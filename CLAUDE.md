# open-bamz-viewz - AI Agent Context

## Project Overview
Open BamZ ViewZ plugin renders SSR content for Open BamZ applications. It generates HTML via ViewZ SSR framework and integrates with other plugins (grapesjs-editor, code-editor, ag-grid, packaging, pwa).

## Architecture
- `index.mjs` - Main entry. Exports `prepareDatabase`, `cleanDatabase`, `initPlugin`. Registers Express routes and plugin slots.
- `front/lib/viewz-lib.mjs` - Exposes `viewzLib`, `startViewZ`, imports ViewZ from CDN.
- `front/lib/viewz-bamz.mjs` - Exports global `bamz` client instance.
- `front/lib/ag-grid-viewz.mjs` - AG-Grid cell renderer/editor with ViewZ binding support (`CellViewZRenderer`, `CellViewZEditor`, `columnOptionsTransformer`).
- `front/@types/viewz-bamz.d.ts` - Declares global `bamz: BamzClient`.

## Key Patterns
- Plugin slots are registered in `loadPluginData` callback. Slots include: `htmlProcessors`, `viewzExtensions`, `bindzFormatters`, `agGridExtensions`, `javascriptApiDef`, `codeEditors`, `urlsToDownload`, `urlsToCache`.
- SSR handlers cache file stats per app name and rebuild on change.
- Routes serve dynamically generated JS (`viewz-extensions`, `bindz-formatters`) using `:appName` template variable.

## Dependencies
- `express` - Router
- `fs-extra` - File operations
- `viewz` - Git dependency from Bakino/viewz

## Files to Know
- `public/viewz.config.json` - Created by prepareDatabase, contains routing config.
- `public/views/root/` - Default root view files (root.html, root.css, root.js).
