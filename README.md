# Li Shiyin // yinasaurus

Personal site for [Li Shiyin](https://yinasaurus.github.io) — software engineering student at SMU School of Computing and Information Systems.

React + Vite + Tailwind + Framer Motion + React Three Fiber. Live at **https://yinasaurus.github.io**.

```bash
npm install
npm run dev
```

## What's on the site

| Route | What it is |
| --- | --- |
| `/` | Home — hero mascot, about, skills, GitHub activity, contact |
| `/projects` | Separate projects page (dino-mouth wipe on the way in and back) |
| anything else | 404 — “This page went extinct.” |

Home sections are in-page anchors (`#about`, `#stack`, `#activity`, `#contact`). Projects is a real route, not a scroll target.

The hero mascot is a low-poly triceratops. Append `?dino=front` to see it face-on.

GitHub activity is a 3D cube calendar at **1024px and up**, and a swipeable 2D heatmap below that.

## Projects

Public repos are fetched at **build / dev start** from `@yinasaurus` and written to `src/data/github-projects.json`.

Edit `src/data/project-config.js` to:

- hide a repo (`EXCLUDE_REPOS`)
- override the title or blurb
- pin media (`image` / `youtube` / `none`)
- replace the auto-detected tech badges

Forks and the profile README repo (`yinasaurus`) are always filtered out.

Optional media, if you don’t want to set an override:

- a YouTube URL in the repo README, or
- a PNG at `public/projects/{repo-name}.png`

Site copy, nav, and contact links live in `src/data/site.js`. Skills groups live in `src/data/tech.js`. Resume is `public/resume.pdf`.

## Publish

This is a **user site** (`yinasaurus.github.io`), served from the domain root.

```bash
npm run build
```

Vite writes the static files to `docs/`. GitHub Pages is set to **`main` → `/docs`**. Commit the updated `docs/` folder when you’re ready to go live.

SPA routes (`/projects`, unknown URLs) use `public/404.html` to bounce back into the client router — that only matters on the live Pages host, not `npm run dev`.
