import fs from 'fs';
import glob from 'glob';
import path from 'path';

type Metadata = {
  UserScript: object;
  OpenUserJS?: object;
};

type MetadataItem = {
  key?: string;
  value: string;
  keyword?: string;
  locale?: string;
};

const createUserScriptHeader = (metaData: object): string => {
  let header = '// ==UserScript==\n';
  for (const [item, data] of Object.entries(metaData)) {
    for (const subItem of data as MetadataItem[]) {
      if (subItem.key) {
        header += `// @${subItem.key} ${subItem.value}\n`;
      } else {
        header += `// @${item} ${subItem.value}\n`;
      }
    }
  }
  header += '// ==/UserScript==\n';
  return header;
};

async function generateUserScriptHeaders(globPattern: string, outputDir: string): Promise<void> {
  const filePaths = await new Promise<string[]>((resolve, reject) => {
    glob(globPattern, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

  for (const filePath of filePaths) {
    const parentDir = path.normalize(`${filePath}/../../`);
    try {
      const metaData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Metadata;
      if (!metaData.UserScript) {
        continue;
      }
      const userScriptHeader = createUserScriptHeader(metaData.UserScript);

      const relativeFilePath = path.normalize(filePath).replace(parentDir, '');
      const outputFilePath = path.join(
        outputDir,
        path.dirname(relativeFilePath),
        `${path.basename(relativeFilePath, '.meta.json')}.user.js`,
      );
      if (fs.existsSync(outputFilePath)) {
        const existingContent = fs.readFileSync(outputFilePath, 'utf-8');
        fs.writeFileSync(outputFilePath, `${userScriptHeader}\n${existingContent}`);
      }
    } catch (e) {
      continue;
    }
  }
}

const [, , sourcePattern, outputDir] = process.argv;

if (!sourcePattern || !outputDir) {
  console.error('Usage: npx ts-node create-headers.ts <source_pattern> <output_dir>');
  process.exit(1);
}

generateUserScriptHeaders(sourcePattern, outputDir);
