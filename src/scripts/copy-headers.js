const fs = require('fs');
const path = require('path');
const glob = require('glob');

function extractHeaders(sourcePattern) {
  const headers = {};
  const files = glob.sync(sourcePattern);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const openingTagIndex = content.indexOf('// ==UserScript==');
    const closingTagIndex = content.indexOf('// ==/UserScript==');
    if (openingTagIndex !== -1 && closingTagIndex !== -1) {
      const headerComment = content.slice(openingTagIndex, closingTagIndex + '// ==/UserScript=='.length);
      headers[file] = headerComment;
    }
  });
  return headers;
}

function addHeaders(headers, outputDir) {
  Object.entries(headers).forEach(([sourceFile, header]) => {
    const relativeSourceFile = sourceFile.replace('./src/main/', '').replace(/^\//, '').replace('.user.ts', '.user.js');
    const outputFile = path.join(outputDir, relativeSourceFile);
    const content = fs.readFileSync(outputFile, 'utf8');
    const updatedContent = `${header}\n\n${content}`;
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, updatedContent);
  });
}

const [, , sourcePattern, outputDir] = process.argv;

if (!sourcePattern || !outputDir) {
  console.error('Usage: node copy-headers.js <source_pattern> <output_dir>');
  process.exit(1);
}

const headers = extractHeaders(sourcePattern);
addHeaders(headers, outputDir);
