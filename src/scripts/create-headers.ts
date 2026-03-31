import { glob } from 'glob';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { argv, exit } from 'node:process';

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
  const filePaths = await glob(globPattern, { withFileTypes: true });

  for (const filePath of filePaths) {
    const parentDir = filePath.parent?.parentPath;
    if (!parentDir) {
      console.error(`Error processing ${filePath.fullpath()}: parentDir not found`);
      continue;
    }
    try {
      const metaData = JSON.parse(readFileSync(filePath.fullpath(), 'utf-8')) as Metadata;
      if (!metaData.UserScript) {
        continue;
      }
      const userScriptHeader = createUserScriptHeader(metaData.UserScript);

      const relativeFilePath = filePath.fullpath().replace(parentDir, '');
      const outputFilePath = join(
        outputDir,
        dirname(relativeFilePath),
        `${basename(relativeFilePath, '.meta.json')}.user.js`,
      );
      if (existsSync(outputFilePath)) {
        const existingContent = readFileSync(outputFilePath, 'utf-8');
        writeFileSync(outputFilePath, `${userScriptHeader}\n${existingContent}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`Error processing ${filePath.fullpath()}: ${errorMessage}`);
      continue;
    }
  }
}

const [, , sourcePattern, outputDir] = argv;

if (!sourcePattern || !outputDir) {
  console.error('Usage: npx ts-node create-headers.ts <source_pattern> <output_dir>');
  exit(1);
}

void generateUserScriptHeaders(sourcePattern, outputDir);
