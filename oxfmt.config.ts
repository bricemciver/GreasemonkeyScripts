import { defineConfig } from 'oxfmt';

export default defineConfig({
  arrowParens: 'avoid',
  printWidth: 120,
  proseWrap: 'always',
  singleQuote: true,
  trailingComma: 'all',
  experimentalSortPackageJson: false,
  ignorePatterns: ['dist/**', 'node_modules/**'],
  overrides: [
    {
      files: ['*.md', '*.mdc'],
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
});
