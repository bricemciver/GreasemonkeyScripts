# Development Guide for AI Agents

> **IMPORTANT**: AGENTS.md files are the source of truth for AI agent instructions. Always update the relevant AGENTS.md file when adding or modifying agent guidance. Do not add to CLAUDE.md or Cursor rules.

## Overview
  
{{Have AI agent fill this in}}

## Tech Stack

- **Language**: TypeScript 5
- **Formatting/Linting**: BiomeJS
- **Build**: ESBuild
- **Target**: Browser extensions (Greasemonkey/Tampermonkey)
- **Output**: Userscripts (.user.js files)

## Project Structure
```
/
├── src/
│   ├── main/      # Contains individual user scripts (e.g., amazon-add-to-goodreads/, google-mail-default-to-all-mail/)
│   └── scripts/   # Build utilities (e.g., create-headers.ts for header generation)
├── dist/          # Output directory for compiled userscripts
└── node_modules/  # Development dependencies (e.g., @biomejs/biome, esbuild)
```

## Development Commands

### Setup

```bash
# Install dependencies
npm install
```

### Formatting
```bash
# Check formatting of files
npm run format:check

# Correct formatting of files
npm run format
```

### Linting

```bash
# Check linting of files
npm run lint:check

# Correct linting of files
npm run lint
```

### Build

```bash
# Compile all user scripts to dist/
npm run build
```

## Code Comments

Comments should not repeat what the code is saying. Instead, reserve comments for explaining **why** something is being done, or to provide context that is not obvious from the code itself.

**When to Comment:**

- To explain why a particular approach or workaround was chosen
- To clarify intent when the code could be misread or misunderstood
- To provide context from external systems, specs, or requirements
- To document assumptions, edge cases, or limitations
- To explain non-obvious business logic or domain knowledge

**When Not to Comment:**

- Don't narrate what the code is doing — the code already says that
- Don't duplicate function or variable names in plain English
- Don't leave stale comments that contradict the code
- Don't reference removed or obsolete code paths (e.g. "No longer uses X format")
- Don't comment on obvious test setup steps (e.g. "Create organization", "Call the API")
