// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fully static site — content sourced from markdown content collections at build
// time. Emits to dist/, deploys to Cloudflare Pages with no runtime (parity with
// the old Next.js `output: 'export'`).
export default defineConfig({
  site: 'https://dave.levine.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Hero/cert/project imagery already lives on cdn.levine.io; reference by URL.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.levine.io' }],
  },
  markdown: {
    gfm: true,
    // Theme-aware code blocks (parity with react-syntax-highlighter's
    // atomDark/solarizedlight pair); CSS variables drive the rest.
    shikiConfig: {
      themes: { light: 'solarized-light', dark: 'github-dark' },
      // Normalize language tags used in the posts to Shiki's identifiers.
      langAlias: { YAML: 'yaml', crontab: 'shellscript' },
      wrap: false,
    },
  },
});
