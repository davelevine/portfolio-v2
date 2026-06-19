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

// Custom Shiki themes carrying the original Prism --code-block-* colours, with
// Prism-style scope grouping (function/tag/attr/variable -> keyword; numbers/
// booleans -> number; strings -> string; rest -> text). Dual light/dark; the
// dark colour is switched in CSS via [data-theme='dark'].
const CODE_LIGHT = { bg: '#eef0f5', text: '#2c3e50', comment: '#8a8a8a', keyword: '#FF0084', number: '#EF5350', string: '#0a7d4a' };
const CODE_DARK = { bg: '#222538', text: '#cdd9e5', comment: '#7a9aa9', keyword: '#a3e600', number: '#ff5d5d', string: '#e8c468' };
function codeTheme(name, c, type) {
  return {
    name,
    type,
    colors: { 'editor.background': c.bg, 'editor.foreground': c.text },
    settings: [
      { settings: { foreground: c.text, background: c.bg } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
      {
        scope: [
          'keyword', 'keyword.control', 'keyword.other', 'storage', 'storage.type', 'storage.modifier',
          'entity.name.tag', 'meta.tag', 'entity.name.function', 'support.function', 'meta.function-call',
          'entity.name.class', 'entity.name.type', 'support.class', 'support.type',
          'entity.other.attribute-name', 'variable', 'variable.other', 'variable.parameter',
          'support.type.property-name', 'meta.object-literal.key', 'entity.name.tag.yaml',
          'entity.name.section', 'keyword.other.important', 'markup.heading',
        ],
        settings: { foreground: c.keyword },
      },
      {
        scope: [
          'constant.numeric', 'constant.language', 'constant.language.boolean', 'constant',
          'support.constant', 'constant.other', 'constant.character', 'string.regexp', 'entity.other.attribute-value',
        ],
        settings: { foreground: c.number },
      },
      {
        scope: [
          'string', 'string.quoted', 'string.quoted.single', 'string.quoted.double',
          'string.template', 'string.unquoted', 'markup.inline.raw',
        ],
        settings: { foreground: c.string },
      },
    ],
  };
}

// Fully static site — content sourced from markdown content collections at build
// time. Emits to dist/, deploys to Cloudflare Pages with no runtime (parity with
// the old Next.js `output: 'export'`).
export default defineConfig({
  site: 'https://dave.levine.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Imagery lives on cdn.levine.io and is referenced by URL via plain <img>
  // (parity with the old `unoptimized` Next images) — no Astro optimization,
  // so markdown CDN images pass through to the CDN untouched.
  server: {
    host: true,
    port: 4321,
    allowedHosts: [
      'davesmbp.fluffy-python.ts.net',
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
    // Theme-aware code blocks (parity with react-syntax-highlighter's
    // atomDark/solarizedlight pair); CSS variables drive the rest.
    shikiConfig: {
      themes: { light: codeTheme('pf-light', CODE_LIGHT, 'light'), dark: codeTheme('pf-dark', CODE_DARK, 'dark') },
      // Normalize language tags used in the posts to Shiki's identifiers.
      langAlias: { YAML: 'yaml', crontab: 'shellscript' },
      wrap: false,
    },
  },
});
