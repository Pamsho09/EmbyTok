# Agent Notes for emby-client

This file is for coding agents working in this repository. Keep it in sync with the
current scripts, tooling, and conventions. If something conflicts with the codebase,
prefer the codebase and update this file.

## Project Summary
- Vite + React + TypeScript app.
- React Compiler is enabled via the Vite React plugin preset.
- ESLint uses the flat config in `eslint.config.js` with the recommended ruleset.
- TypeScript is strict and configured for bundler module resolution.

## Commands (Build, Lint, Test)

Package manager: npm (see `package-lock.json`).

Primary scripts (from `package.json`):
- `npm run dev` - start Vite dev server.
- `npm run build` - typecheck build (`tsc -b`) and create production build.
- `npm run lint` - run ESLint on the repo.
- `npm run preview` - preview the production build.

Testing:
- No test runner is configured (no `test` script present).
- There is no known "single test" command.
- If you add a test runner later, update this file with:
  - Full test command.
  - Single-test command (e.g., `npm run test -- <pattern>` or `vitest -t <name>`).

## Tooling Details

Vite:
- Config: `vite.config.ts`.
- React Compiler is enabled by `reactCompilerPreset()`.

TypeScript:
- Project references in `tsconfig.json`.
- App config: `tsconfig.app.json` (strict, noUnused*, noEmit, bundler resolution).
- Node config: `tsconfig.node.json` for Vite config and tooling.
- `allowImportingTsExtensions` is true; `verbatimModuleSyntax` is true.

ESLint:
- Config: `eslint.config.js`.
- Uses `@eslint/js` recommended, `typescript-eslint` recommended, React Hooks and
  React Refresh configs.
- Ignores `dist/` by default.

## Code Style Guidelines

General:
- Prefer TypeScript for new logic in `src/` (`.ts` or `.tsx`).
- Keep components small and focused; split on data fetching vs rendering when it
  clarifies responsibilities.
- Prefer descriptive names over abbreviations.

Formatting:
- There is no Prettier. Keep formatting consistent with the file you are editing.
- Vite/React/TS defaults apply; do not introduce a new formatter unless requested.
- Use trailing commas where the existing file already uses them.

Imports:
- Use ES module syntax (`import ... from ...`).
- Group imports in this order:
  1) React and framework imports
  2) Third-party packages
  3) Local modules (relative paths)
  4) Stylesheets
- Keep import paths relative within `src/` (no aliases are configured).
- With `verbatimModuleSyntax`, keep type-only imports explicit:
  `import type { Foo } from './types'`.

Types:
- `strict` is enabled; avoid `any` unless necessary.
- Prefer explicit types for public APIs and component props.
- Narrow types early (e.g., for fetched data) to avoid runtime surprises.
- Use `unknown` for untrusted data and validate before use.

Naming:
- Components: `PascalCase` (e.g., `MovieCard`).
- Hooks: `useX`.
- Variables and functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants.
- Files: match component name for components, otherwise `kebab-case` or `camelCase`
  depending on existing patterns in the same folder.

Error handling:
- Check network responses (`res.ok`) before `res.json()` and surface meaningful
  errors to the UI or logs.
- Prefer early returns for invalid states.
- Avoid silent failures; include contextual error messages.

State and effects:
- Keep `useEffect` dependencies accurate; avoid stale closures.
- Avoid setState loops; guard or debounce scroll-driven effects.
- Prefer derived state instead of duplicating data when possible.

React specifics:
- Use functional components and hooks (no class components).
- Follow React Hooks rules; ESLint enforces this.
- Use `StrictMode` (already enabled in `src/main.tsx`).

CSS:
- CSS lives in `src/index.css` and `src/App.css`.
- Use existing CSS variables from `:root` if adding new styles.
- Keep selectors flat and readable; avoid deep nesting unless consistent with
  current style in the file.

## API and Secrets

- `src/api.ts` currently contains a hardcoded base URL and API key.
- Do not add new secrets to the repo. If changes are needed, prefer Vite env vars
  (`VITE_*`) and document them in `README.md` or this file.

## Repository Conventions

- Keep changes minimal and consistent with existing structure.
- Avoid mass reformatting; only touch lines related to your change.
- When adding new files, place them under `src/` and keep imports relative.

## Cursor/Copilot Rules

- No Cursor rules found (`.cursor/rules/` or `.cursorrules` not present).
- No Copilot instructions found (`.github/copilot-instructions.md` not present).

## Update Checklist for Agents

- If you add tests, add build/lint/test commands and a single-test example above.
- If you add tooling (formatter, test runner, bundler changes), update this file.
- If you modify conventions (naming, CSS, imports), document the new standard.
