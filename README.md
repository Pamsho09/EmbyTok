# EmbyTok (frontend)

TikTok-style frontend for Emby Server (no extra backend).

## Requirements
- Node.js 18+ (local dev)
- Docker + Docker Compose (container)

## Environment variables
The app reads variables from `.env` at the repo root.

Example:

```
VITE_EMBY_SERVER_URL=http://192.168.3.7:8096
VITE_EMBY_API_KEY=your_api_key
VITE_EMBY_ACCESS_TOKEN=
VITE_EMBY_USER_ID=
VITE_EMBY_LIBRARY_ID=
VITE_EMBY_LIBRARY_NAME=
```

Notes:
- With Vite, `VITE_*` variables are injected at **build time**. If `.env` changes, rebuild.
- `VITE_EMBY_USER_ID` and `VITE_EMBY_LIBRARY_ID` are required to avoid empty feeds.

## Local development

```
npm install
npm run dev
```

## Local build

```
npm run build
npm run preview
```

## Docker

The Docker build reads variables from the repo `.env`.

```
docker compose build
docker compose up -d
```

App is available at `http://localhost:8080`.

If `.env` changes, rebuild:

```
docker compose build --no-cache
docker compose up -d
```

## Routes
- `/feed` - vertical feed
- `/profile` - profile with subfolders
- `/folder/:profileName` - filtered feed
- `/settings` - configuration
