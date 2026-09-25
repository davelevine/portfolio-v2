# Heap-style redesign (branch `mock/heap-style`)

Restyle modelled on michaelheap.com. The 1:1 rebuild plan below is historical;
its design-system, AOS, modal and card items are superseded by this section.

## Done
- [x] Bugs: dark-mode code tokens (Shiki `css-variables`), blog/docs filters dead
      on revisit (now real routes / anchors), favorites via `isFeatured`,
      UTC-safe dates ("Sep" not "Sept"), empty `<h1>` on /now, category map moved
      to frontmatter `category`
- [x] Heap light + dark palette, typography and spacing in `globals.scss`
- [x] Theme persisted in `localStorage`, defaulting to the OS preference
- [x] Heap-style nav (5 primary links, icons, toggle; secondary pages in mobile row + footer)
- [x] Shared `Footer` component outside `<main>`
- [x] Resume and contact are plain links (hero); contact modal + resume iframe removed
- [x] Project and cert detail pages restyled and linked from their indexes
- [x] Removed orphans: Modals/About/BlogItem/CertItem/ProjectItem, old SCSS partials,
      Google Fonts + FontAwesome CSS, nav-seen + reveal scripts

- [x] /contact page (restyled Formspree form); "Reach me" row in the now panel
- [x] /docs replaced by /decisions: 26 scrubbed ADRs (triaged from 86; security-sensitive ones stay private), supersedes/superseded-by links
- [x] Sitemap moved from footer to robots.txt; brand casing; PGP icon path fixed

- [x] WCAG 2.2 AA pass: contrast fixes (accent, code tokens, input borders, dark on-accent),
      always-underlined meta links, section rules as real h2s, skip link, heart/emoji names,
      long-URL wrapping, larger small text on phones; static scan of all built pages clean

- [x] Prose moved to Markdown (home.md, about.md, uses.md); short project summaries; mock/ deleted

## Open
- [ ] Review the 26 published ADRs and drafts/secrets-at-deploy-time.md before merge
- [ ] Rotate Healthchecks ping URLs committed in private ADRs 0015/0057 (anyone holding them can ping those checks)
- [ ] Screen-reader + keyboard pass on a real phone (static checks can't cover these)
- [ ] Review scrubbed ADRs before publishing (0056 names CI workflows; 0070 outlines DR mechanics; 0076 states exact cooldowns)
- [ ] Test the contact form end-to-end once deployed (Formspree may need the new /contact origin allowed)
- [ ] Visual review against michaelheap.com (screenshots from Dave)
- [ ] Retire the resume X-Frame-Options exception in homelab-iac once this ships
- [ ] Open Graph / Twitter / canonical meta (Heap has them; production never did)
- [ ] Optional: TOC on long posts, topic pages for `#tags`, 404 page
- [ ] Portfolio project copy still describes the Next.js site

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
- [x] **Blog** (list filters + scroll-progress + card grid; post markdown + Shiki code + copy + lightbox).
- [ ] **Projects**: `allProjects.js` grid, `projectItem.js` (tech logos), `projectContent.js`.
- [ ] **Certs**: `allCerts.js` (tech filter), `certItem.js` (date-status badges, modal), `certContent.js`.
- [ ] Port each component's `.module.scss` (colocate as scoped `<style lang="scss">` or global where shared).

## Pages (`src/pages/`)
- [ ] `index.astro` — hero + featured certs/projects/blog (replace placeholder)
- [x] `about.astro`, `now.astro`
- [x] `blog/index.astro`, `blog/[...slug].astro` (+ reading time)
- [ ] `projects/index.astro`, `projects/[...slug].astro`
- [ ] `certs/index.astro`, `certs/[...slug].astro`
- [ ] Per-page `<title>`/description parity (raw titles: "Blog", "Projects", "Certifications")

## Features / parity
- [ ] Theme toggle (system default, toggle in navbar, theme-color meta sync)
- [ ] AOS scroll animations (`aos` npm + init script; keep `data-aos` attrs)
- [x] Lightbox for blog images — vanilla (GLightbox/PhotoSwipe) replacing yet-another-react-lightbox
- [ ] Contact form → Formspree via fetch (no React)
- [x] `rss.xml` endpoint (`@astrojs/rss` from blog collection; title "Dave's Blog")
- [x] Reading-time helper (Math.ceil(words/200))
- [x] Scroll-progress bars (blog/projects lists)
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
