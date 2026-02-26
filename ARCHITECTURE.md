# Architecture (MVP)

## Goal
Local-only TODO MVP that runs on macOS and iPhone immediately via browser (PWA-ready),
with a clear path to Android later.

## Approach
- Single frontend app (React + Vite + TypeScript).
- Local persistence via IndexedDB.
- Date handling in Asia/Seoul, stored as YYYY-MM-DD.

## Data Layer
- `Todo` records stored by date.
- Daily achievement is computed on read (average of percent values for that date).

## UI
- Main screen split vertically: calendar (top) and heatmap (bottom).
- Date selection navigates to a TODO list view.

## Future Extension
- Add service worker + manifest for PWA installation.
- Extract business logic into a shared module to reuse for mobile.
- If native is required, port UI to Flutter or React Native later.
