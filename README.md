# Saaeb Saad � Portfolio

[![Live Demo](https://img.shields.io/badge/demo-saaeb.netlify.app-blue)](https://saaeb.netlify.app)  [![GitHub](https://img.shields.io/badge/repo-Portfolio2.0-brightgreen)](https://github.com/saaeb1oq7/Portfolio2.0)

This repository contains a personal portfolio website for Saaeb Saad. It showcases projects, blog posts, skills, and contact information with a modern, accessible, and responsive UI.

## Table of Contents
- Live Demo
- Features
- Pages & Site Map
- Tech Stack
- Project Structure
- Local Development
- npm Scripts
- Deployment
- PWA & Service Worker
- Responsive Design
- Animation System
- Accessibility
- Performance
- Social & Contact
- Contributing
- License

## Live Demo
The site is published on Netlify at **https://saaeb.netlify.app** and via GitHub Pages at **https://saaeb1oq7.github.io/Portfolio2.0/**.

## Features
- Fully responsive design for all devices (phones, tablets, desktops)
- Touch-optimized interactions with proper tap targets
- Fluid typography with `clamp()` for seamless scaling
- Orientation-aware layouts for landscape mobile devices
- Smooth scrolling and subtle animations
- Lazy loading for videos and images
- Accessible navigation and forms
- Contact form with client-side validation
- Progressive enhancements (service worker, manifest)
- Sidebar with right-side toggle and smooth open/close animation
- Search bar in the sidebar
- Reading progress indicator bar
- Typed-text / typewriter hero subtitle effect
- 3D tilt interactions on cards, tech items, and buttons
- Skill progress bars with animated counters and particle effects
- Blog post filtering by category (All, Java / Game Dev, Frontend, Python, UI/UX)
- Fuzzy search across the site via sidebar search box
- Active navigation highlighting on scroll
- EmailJS-powered contact form with `mailto` fallback
- PWA installable (Web App Manifest + Service Worker with offline support)
- Back-to-top button
- Skip-to-content accessibility link

## Pages & Site Map
| File | Purpose |
|------|---------|
| `index.html` | Main portfolio page (Home, About, Education, Blog, Testimonials, Projects, Skills, Contact) |
| `blog/index.html` | Blog index with category filter |
| `blog/index.html` | Blog index with category filter |
| `blog/java-game.html` | Post: Building My First Java Game |
| `blog/responsive.html` | Post: Frontend Best Practices – Responsive Design |
| `blog/python.html` | Post: Python for Problem Solving |
| `blog/ciphers-ui.html` | Post: UI/UX Design in Ciphers Please |
| `projects/project1.html` | Project detail: Java Repository |
| `projects/project2.html` | Project detail: Interactive Web Application |
| `projects/project3.html` | Project detail: Ciphers-Please Game |
| `pages/privacy.html` | Privacy Policy |
| `pages/terms.html` | Terms of Use |

## Tech Stack
- HTML5
- CSS3 (Grid, Flexbox)
- Vanilla JavaScript
- Boxicons 2.1.4 (loaded via CDN)
- EmailJS (`@emailjs/browser@4` for contact form)
- Git LFS (video asset storage)

**Development tools**
- `live-server` (local dev server)
- `eslint` (JavaScript linting)
- `prettier` (code formatting)

## Project Structure
```
NewPortfolio/
+-- index.html                    # Main page
+-- blog/                         # Blog index & posts
    +-- index.html                # Blog listing with filters
    +-- java-game.html            # Blog post
    +-- responsive.html           # Blog post
    +-- python.html               # Blog post
    +-- ciphers-ui.html           # Blog post
+-- projects/                     # Project detail pages
    +-- project1.html
    +-- project2.html
    +-- project3.html
+-- pages/                        # Static policy/legal pages
    +-- privacy.html
    +-- terms.html
+-- style.css
+-- app.js
+-- service-worker.js
+-- manifest.json
+-- robots.txt
+-- sitemap.xml
+-- package.json
+-- .eslintrc.json
+-- .prettierrc
+-- .editorconfig
+-- .gitattributes        # Git LFS tracking for *.mp4
+-- README.md
+-- CONTRIBUTING.md
+-- DEPLOYMENT_GUIDE.md
+-- Images/
+-- Videos/               # tracked with Git LFS
```

## Local Development
1. Clone the repository:
   ```powershell
   git lfs install
   git clone https://github.com/saaeb1oq7/Portfolio2.0.git
   ```
2. Open a browser or run a local server:
   ```powershell
   python -m http.server 8000
   ```
3. Visit `http://localhost:8000`.

For the npm tooling you'll need:
```powershell
npm install
npm run start
```

> See `CONTRIBUTING.md` for development guidelines.

## npm Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `start` | `live-server --open=./index.html --port=3000` | Starts local dev server |
| `lint:js` | `eslint "**/*.js"` | Runs ESLint on all JS files |
| `format` | `prettier --write "**/*.{js,html,css,md}"` | Formats code with Prettier |

## Deployment
(see above for quick steps)
*Detailed instructions are in `DEPLOYMENT_GUIDE.md`.*

## PWA & Service Worker
The site is installable via `manifest.json` (theme color `#72a1de`, display=standalone). `service-worker.js` implements:

- **Static assets** (HTML/CSS/JS/images) cached under `portfolio-v1` / `portfolio-runtime-v1` (cache-first).
- **Video files** (`.mp4`) cached under `portfolio-videos-v1` (cache-first).
- **Other requests** served network-first with cache fallback; offline navigations return `index.html`.

Developers can trigger cache updates by sending `SKIP_WAITING` or `CLEAR_CACHE` messages via DevTools.

## Responsive Design
This project uses a mobile-first approach with progressive enhancement. Breakpoints range from <375px up to >1440px. Fluid typography, orientation-specific styles, and touch optimizations are used throughout.

## Animation System
Animations are driven by CSS classes (`autoBlur`, `autoDisplay`, `fadeInRight`) and an IntersectionObserver in `app.js`. Elements can be grouped with `data-stagger-group`. See `CONTRIBUTING.md` for the full developer guide and class descriptions.

## Accessibility
- Keyboard navigation and focus management
- ARIA landmarks and `aria-hidden` handling
- Skip-to-content link
- Reduced-motion support

## Performance
- Lazy-loaded videos and images
- Explicit width/height on critical media
- Asset hints (`preconnect`/`dns-prefetch` for CDN)

## Social & Contact
- Telegram: https://t.me/Saaeb
- LinkedIn: https://linkedin.com/in/saaeb
- GitHub: https://github.com/saaeb1oq7
- Discord: https://discordapp.com/users/1005177056050561066
- Contact form at `index.html#contact` (EmailJS-powered)

## Contributing
Please read `CONTRIBUTING.md` for contribution guidelines.

## License
This project is released under the MIT License.
