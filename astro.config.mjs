// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';
import githubLight from '@shikijs/themes/github-light';
import githubDark from '@shikijs/themes/github-dark-default';

// Code theme: GitHub Light / Dark Default (red keywords echo the site accent), fitted to the site palette. Backgrounds become the site's
// code surfaces, and any token colour below MIN_CONTRAST against its surface is
// nudged toward black (light) or white (dark) until it passes, keeping its hue.
// 5.5:1 rather than WCAG AA's 4.5:1: the code font (Pitch Regular) has thin strokes,
// which WCAG 2's colour-only formula doesn't account for.
const MIN_CONTRAST = 5.5;
/** @param {string} hex */
const luminance = (hex) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
/** @param {string} a @param {string} b */
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
/** @param {string} hex @param {string} target @param {number} t */
const mix = (hex, target, t) =>
  '#' + [1, 3, 5].map((i) => {
    const [c, d] = [parseInt(hex.slice(i, i + 2), 16), parseInt(target.slice(i, i + 2), 16)];
    return Math.round(c + (d - c) * t).toString(16).padStart(2, '0');
  }).join('');
/** @param {string} hex @param {string} bg @param {string} toward */
const fit = (hex, bg, toward) => {
  let c = hex.slice(0, 7).toLowerCase();
  for (let t = 0; contrast(c, bg) < MIN_CONTRAST && t <= 1; t += 0.01) c = mix(hex.slice(0, 7), toward, t);
  return c;
};
/** @param {any} theme @param {string} name @param {string} bg @param {string} toward */
function fitTheme(theme, name, bg, toward) {
  /** @param {unknown} v */
  const color = (v) => (typeof v === 'string' && /^#[0-9a-f]{6}/i.test(v) ? fit(v, bg, toward) : v);
  return {
    ...theme,
    name,
    colors: { ...theme.colors, 'editor.background': bg, 'editor.foreground': color(theme.colors['editor.foreground']) },
    tokenColors: theme.tokenColors.map((/** @type {any} */ t) => ({ ...t, settings: { ...t.settings, foreground: color(t.settings?.foreground) } })),
  };
}
const codeLight = fitTheme(githubLight, 'site-github-light', '#f3ede0', '#000000');
const codeDark = fitTheme(githubDark, 'site-github-dark', '#2a2b2c', '#ffffff');

// Markdown images: rewrite root-relative /images/* references (used in cert markdown
// bodies) to the CDN, where the imagery actually lives, and lazy-load them all.
function rehypeImages() {
  const base = 'https://cdn.levine.io/uploads/portfolio/public';
  /** @param {any} node */
  const walk = (node) => {
    if (node.tagName === 'img') {
      if (typeof node.properties?.src === 'string' && node.properties.src.startsWith('/images/')) {
        node.properties.src = base + node.properties.src;
      }
      node.properties.loading ??= 'lazy';
      node.properties.decoding ??= 'async';
    }
    (node.children || []).forEach(walk);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

// Fully static site — content sourced from markdown content collections at build
// time. Emits to dist/, deploys to Cloudflare Pages with no runtime (parity with
// the old Next.js `output: 'export'`).
export default defineConfig({
  site: 'https://dave.levine.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Inline the small per-page component stylesheets (about/index ~2-5 KiB each)
  // into <head> instead of emitting render-blocking <link>s, removing them from
  // the critical request path.
  build: { inlineStylesheets: 'always' },
  // Imagery lives on cdn.levine.io and is referenced by URL via plain <img>
  // (parity with the old `unoptimized` Next images) — no Astro optimization,
  // so markdown CDN images pass through to the CDN untouched.
  server: {
    host: true,
    port: 4321,
    allowedHosts: [
      'davesmbp.fluffy-python.ts.net',
      'xenlab.fluffy-python.ts.net',
      'localhost',
    ],
  },
  markdown: {
    processor: unified({
      gfm: true,
      // Straight quotes site-wide (frontmatter and hand-written copy can't be curled);
      // dashes and ellipses are still converted.
      smartypants: { quotes: false },
      // External links open in a new tab (parity with the now/writing renderers).
      rehypePlugins: [
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
        rehypeImages,
      ],
    }),
    // Dual themes; globals.css switches to the --shiki-dark values under [data-theme="dark"].
    shikiConfig: {
      themes: { light: codeLight, dark: codeDark },
      // Normalize language tags used in the posts to Shiki's identifiers.
      langAlias: { YAML: 'yaml', crontab: 'shellscript' },
      wrap: false,
    },
  },
});
