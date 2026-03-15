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

This workspace includes `.github/workflows/github-pages.yml` configured to publish the `patel-mansion` folder.

1. Push repository to GitHub.
2. In GitHub, open repository **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Run workflow `Deploy Patel Mansion to GitHub Pages`.
5. Your website is published at your GitHub Pages URL.
