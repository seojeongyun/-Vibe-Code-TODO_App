# Deployment

## GitHub Pages (GitHub Actions)

### Required GitHub Settings
1. Go to `Settings` → `Pages` in your repository.
2. Under `Build and deployment`, set `Source` to `GitHub Actions`.
3. Save the settings (the workflow will deploy on the next push to `main`).

### Shareable URL (Important)
- `localhost` is **not** shareable.
- Use GitHub Pages URL:
  - `https://<GITHUB_ID>.github.io/-Vibe-Code-TODO_App/`

### Local Preview
```bash
cd apps/web
npm run build
npm run preview
```

### Local Preview with GitHub Pages Base Path
```bash
cd apps/web
BASE_PATH="/-Vibe-Code-TODO_App/" npm run build
npm run preview
```

When using `BASE_PATH`, the preview URL will include `/-Vibe-Code-TODO_App/`.

---

## PWA Install Guide

### macOS (Chrome/Edge)
1. Open the GitHub Pages URL in Chrome/Edge.
2. Click the install icon on the right side of the address bar.
3. Confirm the install.
4. Launch the app from the Dock.
5. The app runs as a standalone window.

### iPhone (Safari)
1. Open the GitHub Pages URL in Safari.
2. Tap the Share button.
3. Select "Add to Home Screen".
4. Confirm the name and add.
5. Launch from the home screen like an app.

### Data Storage Notice
- Data is stored **locally on each device/browser**. There is no sync between users.

---

## Backup Restore

### Restore Branch
```bash
git switch backup/mvp-2026-02-27
```

### Restore Tag (Detach)
```bash
git switch --detach v0.1.0-mvp
```

### Restore Tag (Work Branch)
```bash
git switch -c hotfix/from-v0.1.0-mvp v0.1.0-mvp
```

### Back to main
```bash
git switch main && git pull
```
