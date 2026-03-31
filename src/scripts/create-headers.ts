import { glob } from 'glob';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { argv, exit } from 'node:process';

/**
 * Represents the UserScript metadata block structure
 */
interface UserScriptMetadata {
  [key: string]: string | string[] | { [key: string]: string };
}

/**
 * Creates a standardized userscript header from metadata
 * @param metadata - The UserScript metadata object
 * @returns Formatted userscript header string
 */
const createUserScriptHeader = (metadata: UserScriptMetadata): string => {
  let header = '// ==UserScript==\n';
  
  for (const [key, value] of Object.entries(metadata)) {
    // Handle array values (like @match, @include)
    if (Array.isArray(value)) {
      for (const item of value) {
        header += `// @${key} ${item}\n`;
      }
    } 
    // Handle object values (less common, but possible)
    else if (typeof value === 'object' && value !== null) {
      for (const [subKey, subValue] of Object.entries(value)) {
        header += `// @${key}.${subKey} ${subValue}\n`;
      }
    }
    // Handle string values
    else {
      header += `// @${key} ${value}\n`;
    }
  }
  
  header += '// ==/UserScript==\n';
  return header;
};

/**
 * Generates userscript headers from metadata files
 * @param globPattern - Glob pattern to find metadata files
 * @param outputDir - Directory to output the generated userscripts
 */
async function generateUserScriptHeaders(globPattern: string, outputDir: string): Promise<void> {
  try {
    const filePaths = await glob(globPattern, { withFileTypes: true });
    
    if (filePaths.length === 0) {
      console.warn(`No files found matching pattern: ${globPattern}`);
      return;
    }

    for (const filePath of filePaths) {
      try {
        const parentDir = filePath.parent?.parentPath;
        if (!parentDir) {
          console.error(`Error processing ${filePath.fullpath()}: Could not determine parent directory`);
          continue;
        }

        // Read and parse metadata file
        let metaData: { UserScript: UserScriptMetadata };
        try {
          const fileContent = readFileSync(filePath.fullpath(), 'utf-8');
          metaData = JSON.parse(fileContent);
        } catch (parseError) {
          console.error(`Error parsing JSON in ${filePath.fullpath()}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          continue;
        }

        // Validate metadata structure
        if (!metaData.UserScript || typeof metaData.UserScript !== 'object') {
          console.warn(`Skipping ${filePath.fullpath()}: Missing or invalid UserScript metadata`);
          continue;
        }

        // Generate header
        const userScriptHeader = createUserScriptHeader(metaData.UserScript);

        // Determine output file path
        const relativeFilePath = filePath.fullpath().replace(parentDir, '');
        const outputFilePath = join(
          outputDir,
          dirname(relativeFilePath),
          `${basename(relativeFilePath, '.meta.json')}.user.js`,
        );

        // Prepend header to existing content or create new file
        if (existsSync(outputFilePath)) {
          const existingContent = readFileSync(outputFilePath, 'utf-8');
          writeFileSync(outputFilePath, `${userScriptHeader}\n${existingContent}`);
        } else {
          // If no existing content, just write the header (though this shouldn't happen in normal usage)
          writeFileSync(outputFilePath, userScriptHeader);
        }
      } catch (fileError) {
        console.error(`Error processing ${filePath.fullpath()}: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
        continue;
      }
    }
  } catch (globError) {
    console.error(`Error during glob operation: ${globError instanceof Error ? globError.message : String(globError)}`);
    exit(1);
  }
}

// Main execution
const [, , sourcePattern, outputDir] = argv;

if (!sourcePattern || !outputDir) {
  console.error('Usage: npx ts-node create-headers.ts <source_pattern> <output_dir>');
  console.error('Example: npx ts-node create-headers.ts "./src/main/**/*.meta.json" "./dist"');
  exit(1);
}

void generateUserScriptHeaders(sourcePattern, outputDir);
