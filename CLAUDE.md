# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is npm.

- `npm run dev` — Vite dev server
- `npm run build` — typecheck (`tsc -b`) then production build
- `npm run lint` — ESLint (flat config in `eslint.config.js`)
- `npm run preview` — preview the production build

No test runner is configured; there is no single-test command.

Docker (serves built assets via nginx on host port `1111`):

- `docker compose build` / `docker compose up -d`
- Rebuild with `--no-cache` after changing `.env` (see "Config flow" below).

## Architecture

EmbyTok is a **pure frontend SPA** (Vite + React 19 + TypeScript, React Compiler enabled). There is **no custom backend** — the browser talks directly to an Emby Server's HTTP API.

### Config flow (important)

Config (`src/emby/types.ts` → `EmbyConfig`) has two layers:

1. **Build-time defaults** from `VITE_EMBY_*` env vars, baked into the bundle by Vite. Changing `.env` requires a rebuild (including Docker `--no-cache`).
2. **Runtime overrides** persisted in `localStorage` under key `embyConfig` via `src/hooks/useEmbyConfig.ts`. The `/settings` route writes here.

`App.tsx` redirects to `/settings` until `isReady` (serverUrl + apiKey or accessToken). `VITE_EMBY_USER_ID` and `VITE_EMBY_LIBRARY_ID` are also required to get non-empty feeds.

### Emby client

`src/emby/embyClient.ts` exports `createEmbyClient(config)` returning an `EmbyClient` with methods `getItems`, `getLibraries`, `getFolders`, `getItemImageUrl`, `getItemBackdropUrl`, `getVideoStreamUrl`, `deleteItem`. All requests inject auth two ways: `api_key` query param (for URLs embedded in `<img>`/`<video>` tags) and `X-Emby-Token` header (for JSON fetches). `authenticateByName` is a separate exported function — not a method on the client — and uses the `X-Emby-Authorization` header with `CLIENT_INFO`.

`App.tsx` memoizes the client via `useMemo` on the config; consumers receive `client: EmbyClient | null` and must guard `null` themselves.

### Feed / items pipeline

`src/hooks/useInfiniteEmbyFeed.ts` is the core feed hook. It fetches the total count with `limit: 1`, then requests **all items** (`limit: totalCount`) with `SortBy=Random` in a single call, maps them via `mapEmbyItem`, and paginates client-side by advancing a `cursor` (`pageSize`, default 8). Feed resets whenever `client` or `libraryId` changes.

`src/emby/embyMapper.ts` → `mapEmbyItem` derives a `profileName` from `item.Path` by taking the directory segment immediately before a `Videos/` segment (or the parent folder otherwise). The UI groups/filters by this inferred name — file layouts without a `Videos/` ancestor will fall back to "parent folder" which may mis-group.

### Routes (`App.tsx`)

- `/feed` — `EmbyVideoFeed` (randomized infinite feed across `libraryId`)
- `/profile` — `EmbyProfileScreen` (subfolders of the library)
- `/folder/:profileName` — `EmbyFolderScreen` (feed filtered by inferred profile)
- `/settings` — `EmbyConfigScreen` (persists to `localStorage`)

### Docker / deployment

Multi-stage Dockerfile builds the SPA then serves via nginx (`default.conf`) with SPA fallback (`try_files $uri $uri/ /index.html`). `docker-compose.yml` forwards `VITE_EMBY_*` into the build stage as `ARG`s — they must be set when running `docker compose build`, not just at runtime.

## Conventions

- `verbatimModuleSyntax` is on — always use `import type { ... }` for type-only imports.
- No path aliases; keep imports relative within `src/`.
- No Prettier; match the surrounding file's style.
- `src/api.ts` referenced in `AGENTS.md` no longer exists — all Emby calls go through `src/emby/embyClient.ts`. Do not reintroduce hardcoded credentials; extend `VITE_*` env vars and `EmbyConfig` instead.
- Detailed naming/formatting/error-handling rules live in `AGENTS.md`; keep that file in sync if conventions change.
