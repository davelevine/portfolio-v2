// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

// Rewrite root-relative /images/* references (used in cert markdown bodies) to
// the CDN, where the imagery actually lives.
function rehypeCdnImages() {
  const base = 'https://cdn.levine.io/uploads/portfolio/public';
  const walk = (node) => {
    if (node.tagName === 'img' && typeof node.properties?.src === 'string' && node.properties.src.startsWith('/images/')) {
      node.properties.src = base + node.properties.src;
    }
    (node.children || []).forEach(walk);
  };
  return (tree) => walk(tree);
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
    gfm: true,
    // External links open in a new tab (parity with the now/blog renderers).
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      rehypeCdnImages,
    ],
    // Token colours are CSS variables (--astro-code-*) defined per theme in
    // globals.scss, so code follows [data-theme] with no second Shiki theme.
    shikiConfig: {
      theme: 'css-variables',
      // Normalize language tags used in the posts to Shiki's identifiers.
      langAlias: { YAML: 'yaml', crontab: 'shellscript' },
      wrap: false,
    },
  },
});
