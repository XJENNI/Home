# Patel Mansion Website

Premium golden-luxury static website for Patel Mansion, generated from project PDFs/images and structured planning data.

## Included Sections

- Main dashboard with core project metrics
- Construction Departments + 8 department subpages
- Home Navigation with room-wise subpages
- Phases page with phase 1-9 subpages
- Dedicated 3D Home + AR page
- Downloadable raw details source file

## Local Preview

From the workspace root:

```powershell
cd patel-mansion
python -m http.server 5500
```

Open: `http://localhost:5500`

## GitHub Pages Deployment

This repo is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages** (if first time)
   - Go to **Settings** → **Pages**
   - Source should auto-detect **GitHub Actions**

3. **Workflow runs automatically** on each push to `main` branch

4. **View your site** at: `https://<your-username>.github.io/<your-repo>/`

### Notes

- The workflow is defined in `.github/workflows/deploy-pages.yml`
- All static assets (JS, CSS, images) are included automatically
- `.nojekyll` file prevents Jekyll processing (already included)
- Site supports HTTPS, WebXR, and 3D features on GitHub Pages
