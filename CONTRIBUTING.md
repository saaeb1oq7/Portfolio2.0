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
git clone https://github.com/saaeb1oq7/Portfolio2.0.git
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

## Working with Animations

The portfolio uses a viewport-triggered animation system with three primary classes:

- **`autoBlur`** — Fade-in with blur resolution, used for cards and content
- **`autoDisplay`** — Fade and slide-down effect, used for section titles
- **`fadeInRight`** — Slide-in from right, used for project information

When adding new sections or elements:

1. Choose the appropriate animation class based on content type
2. Add the `data-stagger-group` attribute to group related elements (e.g., `data-stagger-group="about"`)
3. The IntersectionObserver in `app.js` automatically adds the `.in-view` class when elements enter the viewport, triggering the animation
4. Animations automatically respect `prefers-reduced-motion` for accessibility

**Example:** Adding an animated card to a new section:

```html
<article class="card autoBlur" data-stagger-group="my-section">
  <h3>Card Title</h3>
  <p>Card content...</p>
</article>
```

For detailed documentation, see the **Animation System** section in `README.md`.

## Pull Request Process

- Branch naming: use `feature/` or `fix/` prefixes, e.g. `feature/add-contact-form` or `fix/video-lazyload`.
- Before creating a PR, run lint and formatting scripts locally:

```powershell
npm run lint:js; npm run format
```

- Commit messages: use concise, descriptive messages. Include issue numbers when applicable.
- Push your feature branch and open a PR targeting `main`. Add screenshots or a short demo if visual changes are included.
