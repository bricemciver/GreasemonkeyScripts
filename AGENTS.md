# Development Guide for AI Agents

> **IMPORTANT**: AGENTS.md files are the source of truth for AI agent instructions. Always update the relevant AGENTS.md file when adding or modifying agent guidance. Do not add to CLAUDE.md or Cursor rules.

## Overview

This document serves as the canonical source of instructions for AI agents working on the Greasemonkey scripts project. It outlines the project's purpose, tooling, workflows, and standards that agents should follow when generating, modifying, or maintaining userscripts. The guide covers the tech stack (TypeScript, Oxfmt, Oxlint, ESBuild), code navigation preferences (LSP over Grep), commit conventions, project directory layout, and development commands. Agents should consult this file for context on how to properly interact with the codebase, adhere to formatting/linting requirements, and produce consistent, well-documented changes.

## Tech Stack

- **Language**: TypeScript 5
- **Formatting**: Oxfmt
- **Linting**: Oxlint
- **Build**: ESBuild
- **Target**: Browser extensions (Greasemonkey/Tampermonkey)
- **Output**: Userscripts (.user.js files)

## Code Intelligence

Prefer LSP over Grep/Read for code navigation — it's faster, precise, and avoids reading entire files:

- `workspaceSymbol` to find where something is defined
- `findReferences` to see all usages across the codebase
- `goToDefinition` / `goToImplementation` to jump to source
- `hover` for type info without reading the file

Use Grep only when LSP isn't available or for text/pattern searches (comments, strings, config).

After writing or editing code, check LSP diagnostics and fix errors before proceeding.

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: <agent model name> <agent model email>
```

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
