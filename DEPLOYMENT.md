# Deployment

## GitHub Pages (GitHub Actions)

### Required GitHub Settings
1. Go to `Settings` → `Pages` in your repository.
2. Under `Build and deployment`, set `Source` to `GitHub Actions`.
3. Save the settings (the workflow will deploy on the next push to `main`).

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
