# Contributing

Thank you for considering contributing! Please follow these steps:

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and add tests where applicable
4. Commit and push: `git push origin feature/your-feature`
5. Open a pull request describing your changes

Coding style: keep HTML semantic, CSS modular and prefer variables, JavaScript ES6+.

## Development Setup

1. Clone the repository:

```powershell
git clone https://github.com/saaeb1oq7/Portfolio.git
git checkout main
```

2. Install dependencies:

```powershell
npm install
```

3. Install Git LFS if you plan to add or update video files:

```powershell
git lfs install
```

4. Start the dev server:

```powershell
npm run start
```

## Working with Media Files

- This project tracks large video files in the `Videos/` directory using Git LFS. When adding new videos:
	1. Ensure `git lfs install` has been run locally.
	2. Add the file (e.g. `Videos/new-trailer.mp4`) and commit — LFS will manage the large binary.

- If you intentionally do not want to store videos in the repo, host them externally (CDN or cloud storage) and update the `src`/`data-src` attributes in `index.html` to point to the external URLs instead of local `Videos/` paths.

## Pull Request Process

- Branch naming: use `feature/` or `fix/` prefixes, e.g. `feature/add-contact-form` or `fix/video-lazyload`.
- Before creating a PR, run lint and formatting scripts locally:

```powershell
npm run lint:js; npm run format
```

- Commit messages: use concise, descriptive messages. Include issue numbers when applicable.
- Push your feature branch and open a PR targeting `main`. Add screenshots or a short demo if visual changes are included.
