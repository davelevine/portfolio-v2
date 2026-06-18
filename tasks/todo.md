# Astro Portfolio — 1:1 Rebuild Plan

Faithful re-implementation of the existing Next.js portfolio (`../portfolio`,
the live `dave.levine.io`) in Astro. Static output → Cloudflare Pages, no runtime.

## Foundation — DONE
- [x] Recreate `davelevine/portfolio-v2` repo (empty, private)
- [x] Scaffold Astro project (package.json, astro.config, tsconfig)
- [x] Content collections (`blog` 31, `projects` 7, `certs` 10) — schemas mirror frontmatter 1:1 (camelCase); project frontmatter dedented; `now.md` carried over
- [x] Global design system copied verbatim (`src/styles/*.scss`: colors/buttons/utils/ui/globals/swiper)
- [x] Base `Layout.astro` — full head (favicons, CDN fonts, manifest, RSS link, Umami), theme-color, no-FOUC `data-theme` (system pref, not persisted — parity with `_app.js`)
- [x] Public assets (resume PDF, manifest.json, robots.txt)
- [x] `astro build` green; sitemap generated

## Components to port (`components/**` → `src/components/*.astro`)
Sequential first (shared chrome), then parallelizable:
- [x] **Navbar** (`navbar/navbar.js` + `themeToggle.js` + `menuToggle.js`) — sticky-on-scroll, nav links + active state, theme toggle (flips `#app[data-theme]`), CSS hamburger→X, contact-modal trigger. framer-motion dropped.
- [x] **Modal system** (`layout/modal/*`) — backdrop + contact (Formspree `xzbloaed` via `fetch`, submitting/succeeded/error states) + resume (PDF iframe); Escape/backdrop close; event-driven (`modal:open`/`modal:closed`).
- [ ] **Footer** (empty)
- [x] **Hero** (`home/hero.js`) — profile image, social links, CTA buttons (resume/contact modals), AOS.
- [ ] **About** (`about/about.js`) — bio, image, quote box, AOS.
- [ ] **Now** (`now/now.js`) — custom markdown renderers (quoteBox, divider, highlighted, image).
- [ ] **Blog**: list (`blog.js` filter chips + scroll-progress), `blogItem.js` card, `blogContent.js` (markdown + Shiki + lightbox).
- [ ] **Projects**: `allProjects.js` grid, `projectItem.js` (tech logos), `projectContent.js`.
- [ ] **Certs**: `allCerts.js` (tech filter), `certItem.js` (date-status badges, modal), `certContent.js`.
- [ ] Port each component's `.module.scss` (colocate as scoped `<style lang="scss">` or global where shared).

## Pages (`src/pages/`)
- [ ] `index.astro` — hero + featured certs/projects/blog (replace placeholder)
- [ ] `about.astro`, `now.astro`
- [ ] `blog/index.astro`, `blog/[...slug].astro` (+ reading time)
- [ ] `projects/index.astro`, `projects/[...slug].astro`
- [ ] `certs/index.astro`, `certs/[...slug].astro`
- [ ] Per-page `<title>`/description parity (raw titles: "Blog", "Projects", "Certifications")

## Features / parity
- [ ] Theme toggle (system default, toggle in navbar, theme-color meta sync)
- [ ] AOS scroll animations (`aos` npm + init script; keep `data-aos` attrs)
- [ ] Lightbox for blog images — vanilla (GLightbox/PhotoSwipe) replacing yet-another-react-lightbox
- [ ] Contact form → Formspree via fetch (no React)
- [ ] `rss.xml` endpoint (`@astrojs/rss` from blog collection; title "Dave's Blog")
- [ ] Reading-time helper (Math.ceil(words/200))
- [ ] Scroll-progress bars (blog/projects lists)
- [ ] Verify CDN image refs (`cdn.levine.io/uploads/portfolio/public/images/...`)
- [ ] Fira Code web font (currently var fallback only — confirm CDN google-fonts.css ships it, else add)

## Deploy
- [ ] Cloudflare Pages project (build `astro build`, output `dist/`) — mirror current deploy
- [ ] Port security headers / Umami rewrites (was `vercel.json`) to Pages `_headers` / `_redirects`
- [ ] renovate.json, README
- [ ] Cutover `dave.levine.io` only after visual parity confirmed (keep current deploy as rollback)

## Verification
- Diff each route against the live site; check theme toggle, animations, lightbox, contact form, RSS, meta, robots, sitemap.

## Notes / decisions
- camelCase frontmatter preserved (no rename) for a true 1:1.
- framer-motion dropped in favor of CSS/Astro islands (lighter, fewer deps).
- `now.md` only has `date`; rendered directly by `now.astro` (not a collection).
