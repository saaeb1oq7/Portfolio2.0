# Deployment Guide

This guide provides step-by-step instructions for deploying the Portfolio2.0 project to GitHub (Pages) and alternative providers (Netlify / Vercel). It includes Git LFS setup for video files and common troubleshooting tips.

## Prerequisites

- Git installed
- Git LFS installed (recommended for video assets)
- GitHub account

## Initial repository checks

1. Verify repository status:

```powershell
git status
```

2. Verify your remotes:

```powershell
git remote -v
```

3. If no remote exists, add it:

```powershell
git remote add origin https://github.com/saaeb1oq7/Portfolio2.0.git
```

## Git LFS setup (for video files)

1. Install and enable Git LFS:

```powershell
git lfs install
```

2. Ensure `.gitattributes` tracks video types (the repo already includes `*.mp4` in `.gitattributes`).

3. Verify tracked LFS files:

```powershell
git lfs ls-files
```

## Committing changes

1. Stage changes:

```powershell
git add .
```

2. Commit with a descriptive message:

```powershell
git commit -m "Enhance responsive design for all devices"
```

3. Review recent commits:

```powershell
git log --oneline -5
```

## Pushing to GitHub

1. Push to main branch:

```powershell
git push origin main
```

2. If first-time push to a remote branch:

```powershell
git push -u origin main
```

3. If authentication issues occur, prefer using a Personal Access Token (PAT) for HTTPS or configure SSH keys.

## GitHub Pages Deployment

1. Open the GitHub repository page in your browser.
2. Go to **Settings** > **Pages**.
3. Under **Source**, select the branch `main` and folder `/ (root)`.
4. Click **Save** and wait 1-2 minutes for the site to publish.
5. Visit the published URL (e.g., `https://saaeb1oq7.github.io/Portfolio2.0/`).

## Alternative Deployments

### Netlify

- Connect your GitHub repository from the Netlify dashboard.
- Select the `main` branch and root folder as the build directory (if any build steps are needed, configure them).
- Deploy — Netlify will continuously deploy on pushes to `main`.

### Vercel

- Import the GitHub repository via Vercel's import flow.
- Use default static site settings; Vercel will deploy on pushes.

## Custom Domain

- Add a `CNAME` file to the repository root with your custom domain.
- Configure DNS records to point to GitHub Pages or your hosting provider.

## Troubleshooting

- Large file errors: ensure Git LFS is installed and files are tracked before push.
- 404 pages on GitHub Pages: confirm Pages source is set to the correct branch and folder.
- Videos not playing: verify LFS files are present; use `git lfs ls-files` to confirm.
- Service worker caching issues: clear site data and unregister service worker in DevTools during development.

## Maintenance

- Use feature branches for major changes and open PRs for review.
- Test changes locally and in staging before pushing to `main`.
- Monitor GitHub Actions or hosting provider logs for build/deploy errors.

---

If you'd like, I can also add a GitHub Action workflow to automatically deploy to GitHub Pages on push to `main`.
