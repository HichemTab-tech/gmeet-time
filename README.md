# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # gmeet-time

  `gmeet-time` is a Chrome extension that automatically tracks time spent in Google Meet and surfaces the day as a clean, developer-oriented timeline.

  It is built with React, TypeScript, Vite, Tailwind CSS v4, and a Manifest V3 architecture using a background service worker plus a Meet-specific content script.

  ## Features

  - Detects when you join and leave Google Meet sessions.
  - Tracks active meeting state with heartbeat-based reconciliation.
  - Stores completed sessions locally in Chrome extension storage.
  - Shows a live active session card while a meeting is running.
  - Summarizes today with total time, meeting count, and longest session.
  - Displays a polished daily timeline with start time, end time, duration, and meet code/title.
  - Keeps the MVP local-first with no backend or external services.

  ## Tech Stack

  - React 19
  - TypeScript 6
  - Vite 8
  - Tailwind CSS 4 via `@tailwindcss/vite`
  - `@crxjs/vite-plugin` for Chrome extension bundling
  - Chrome Extension Manifest V3 APIs (`storage`, `alarms`, background service worker, content scripts)

  ## Architecture

  ```text
  src/
    background/    Service worker, active-session orchestration, storage writes
    content/       Google Meet presence detection and heartbeat messages
    lib/           Shared helpers for storage, time math, and meet parsing
    popup/         React popup UI and presentational components
    types/         Shared message/session contracts
  manifest.config.ts  Typed MV3 manifest
  ```

  ### Runtime Flow

  1. A content script runs only on `https://meet.google.com/*`.
  2. It detects in-call state using Meet UI heuristics and sends `join`, `heartbeat`, and `leave` messages.
  3. The background service worker owns active session state.
  4. Active sessions are cached in `chrome.storage.session`.
  5. Completed sessions are persisted in `chrome.storage.local`.
  6. The popup reads both stores, computes today’s summary, and renders the timeline.

  ## Local Development

  ### Requirements

  - Node.js 20+
  - `pnpm`
  - Google Chrome

  ### Install

  ```bash
  pnpm install
  ```

  ### Start extension dev build

  ```bash
  pnpm dev
  ```

  ### Production build

  ```bash
  pnpm build
  ```

  ### Lint

  ```bash
  pnpm lint
  ```

  ## Load in Chrome Developer Mode

  1. Build the extension:

     ```bash
     pnpm build
     ```

  2. Open Chrome and navigate to `chrome://extensions`.
  3. Enable `Developer mode`.
  4. Click `Load unpacked`.
  5. Select the generated `dist` directory from this project.
  6. Pin `gmeet-time` if you want one-click access while testing.

  ## When To Reload During Development

  - `manifest.config.ts`: reload the extension
  - `src/background/*`: reload the extension
  - `src/content/*`: reload the extension and refresh the Meet tab
  - `src/popup/*`: reopening the popup is usually enough in dev, but reloading the extension is still the safest path

  ## Storage Model

  ### `chrome.storage.session`

  - Active sessions
  - In-memory per extension load
  - Used for live popup state and restart-safe service worker hydration during the same browser session

  ### `chrome.storage.local`

  - Completed meeting sessions
  - Persistent local history
  - Good base for future weekly/monthly aggregation, export/import, and sync

  ## Notes About Detection

  This MVP uses Meet UI heuristics to infer active call state. That keeps permissions small and the architecture simple, but it does mean detection can shift if Google changes Meet’s DOM or if UI labels vary heavily by locale.

  The current implementation is intentionally structured so the content-side detector can be extended later without rewriting storage or popup logic.

  ## Future Extensions

  - Weekly and monthly rollups
  - Charts and trends
  - Session tags and notes
  - Export/import
  - Sync across browsers
  - Improved locale-aware detection heuristics

  ## Branding

  - Developer: `HichemTab-tech`
  - Repository: `https://github.com/HichemTab-tech/gmeet-time`

  ## License

  Open source. Add your preferred license before publishing.
