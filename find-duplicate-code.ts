import * as ts from 'typescript';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

// Configuration
const MIN_FUNCTION_LINES = 7;
const SIMILARITY_THRESHOLD = 0.8; // 80%

interface FunctionInfo {
  file: string;
  name: string;
  line: number;
  endLine: number;
  text: string;
  normalized: string;
}

// Simple tokenization: split by non-alphanumeric and filter empty
function tokenize(str: string): string[] {
  return str.split(/[^a-zA-Z0-9_]+/).filter(token => token.length > 0);
}

// Longest Common Subsequence (LCS) for two arrays
function lcsLength<T>(a: T[], b: T[]): number {
  const dp: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] === b[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i][j + 1], dp[i + 1][j]);
      }
    }
  }
  return dp[a.length][b.length];
}

// Similarity between two strings using LCS on tokens
function similarity(str1: string, str2: string): number {
  const tokens1 = tokenize(str1);
  const tokens2 = tokenize(str2);
  if (tokens1.length === 0 && tokens2.length === 0) return 1.0;
  if (tokens1.length === 0 || tokens2.length === 0) return 0.0;
  const lcs = lcsLength(tokens1, tokens2);
  return (2 * lcs) / (tokens1.length + tokens2.length);
}

// Normalize function text: remove comments, whitespace, and normalize variable names
function normalizeFunctionText(text: string): string {
  // Remove single-line and multi-line comments
  const noComments = text.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove whitespace and newlines
  const noWhitespace = noComments.replace(/\s/g, '');
  // Replace variable names with placeholders (simple: replace sequences of letters with 'v')
  // This is a very basic normalization; for better results, we'd need to parse identifiers
  const normalized = noWhitespace.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, 'v');
  return normalized;
}

// Extract function declarations and arrow functions from a source file
function extractFunctionsFromFile(fileName: string): FunctionInfo[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    fs.readFileSync(fileName).toString(),
    ts.ScriptTarget.Latest,
    true
  );

  const functions: FunctionInfo[] = [];

  function visit(node: ts.Node): void {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
      // Get function name if available
      let name = '';
      if (ts.isFunctionDeclaration(node) && node.name) {
        name = node.name.getText();
      }

      // Get line and character info
      const line = node.getStart(sourceFile);
      const end = node.getEnd();
      const lineInfo = ts.getLineAndCharacterOfPosition(sourceFile, line);
      const endLineInfo = ts.getLineAndCharacterOfPosition(sourceFile, end);
      const lines = endLineInfo.line - lineInfo.line + 1;

      // Only consider functions with enough lines
      if (lines >= MIN_FUNCTION_LINES) {
        const text = node.getText(sourceFile);
        const normalized = normalizeFunctionText(text);
        functions.push({
          file: fileName,
          name,
          line: lineInfo.line + 1, // Convert to 1-based line number
          endLine: endLineInfo.line + 1,
          text,
          normalized
        });
      }
    }

    // Recurse into children
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}

// Main function
async function main() {
  // Find all userscript.ts files in src/plugins/*/
  const pattern = path.join('src', 'plugins', '*', 'userscript.ts');
  const files = glob.sync(pattern, { absolute: true });

  if (files.length === 0) {
    console.log('No userscript.ts files found.');
    return;
  }

  console.log(`Found ${files.length} userscript.ts files.`);

  // Extract functions from all files
  const allFunctions: FunctionInfo[] = [];
  for (const file of files) {
    const functions = extractFunctionsFromFile(file);
    allFunctions.push(...functions);
    console.log(`Extracted ${functions.length} functions from ${path.relative(process.cwd(), file)}`);
  }

  console.log(`Total functions extracted: ${allFunctions.length}`);

  // Compare functions for similarity
  const similarGroups: FunctionInfo[][] = [];
  const visited = new Set<number>();

  for (let i = 0; i < allFunctions.length; i++) {
    if (visited.has(i)) continue;
    const group: FunctionInfo[] = [allFunctions[i]];
    visited.add(i);

    for (let j = i + 1; j < allFunctions.length; j++) {
      if (visited.has(j)) continue;
      const sim = similarity(allFunctions[i].normalized, allFunctions[j].normalized);
      if (sim >= SIMILARITY_THRESHOLD) {
        group.push(allFunctions[j]);
        visited.add(j);
      }
    }

    if (group.length > 1) {
      similarGroups.push(group);
    }
  }

  // Generate markdown report
  let report = '# Duplicate Code Analysis Report\n\n';
  report += `## Summary\n`;
  report += `- Files analyzed: ${files.length}\n`;
  report += `- Functions extracted: ${allFunctions.length}\n`;
  report += `- Minimum function lines: ${MIN_FUNCTION_LINES}\n`;
  report += `- Similarity threshold: ${SIMILARITY_THRESHOLD * 100}%\n`;
  report += `- Similar groups found: ${similarGroups.length}\n\n`;

  if (similarGroups.length === 0) {
    report += 'No duplicate code groups found meeting the criteria.\n';
  } else {
    report += '## Duplicate Code Groups\n\n';
    for (let i = 0; i < similarGroups.length; i++) {
      const group = similarGroups[i];
      report += `### Group ${i + 1} (${group.length} functions)\n\n`;
      report += '| File | Function | Line | Normalized Preview |\n';
      report += '|------|----------|------|-------------------|\n';
      for (const func of group) {
        const preview = func.normalized.substring(0, 50) + (func.normalized.length > 50 ? '...' : '');
        report += `| ${path.relative(process.cwd(), func.file)} | ${func.name || '<anonymous>'} | ${func.line}-${func.endLine} | \`${preview}\` |\n`;
      }
      report += '\n';

      // Show a sample of the normalized code (first function in group)
      report += '**Sample Normalized Code:**\n\n';
      report += '```typescript\n';
      report += group[0].normalized + '\n';
      report += '```\n\n';

      // Show original code of first function (optional, but useful)
      report += '**Original Code Sample (first function):**\n\n';
      report += '```typescript\n';
      report += group[0].text + '\n';
      report += '```\n\n';
    }
  }

  // Write report to file
  const reportPath = path.join(process.cwd(), 'duplicate-code-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`Report written to ${reportPath}`);
}

// Run main and handle errors
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});