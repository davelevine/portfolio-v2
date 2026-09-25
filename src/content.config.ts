import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './lib/writing';

// Schemas mirror the original markdown frontmatter 1:1 (camelCase preserved).

const writing = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    // Section shown in the archive and category pills; `categories` are topic tags.
    category: z.enum(CATEGORIES), // required: Homelab, AWS, Work, or Personal
    categories: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional().default(false),
    // AI Influence Level (see /ail): 0–5 for the writing, optional separate level for images.
    ail: z.number().int().min(0).max(5).optional(),
    ailImages: z.number().int().min(0).max(5).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tech: z.array(z.string()),
    description: z.string(),
    // One-line blurb for the /projects list; falls back to description.
    summary: z.string().optional(),
    liveLink: z.string().optional(),
    githubLink: z.string().optional(),
    githubComingSoon: z.boolean().optional().default(false),
    image: z.string().optional(),
    // Optional dark-theme variant of `image`, shown when the site is in dark mode.
    imageDark: z.string().optional(),
    isFeatured: z.boolean().optional().default(false),
    date: z.coerce.date().optional(),
  }),
});

const certs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/certs' }),
  schema: z.object({
    title: z.string(),
    // ISO date string; expirationDate may be the literal "Never".
    achievedDate: z.string(),
    expirationDate: z.string(),
    image: z.string(),
    excerpt: z.string(),
    isFeatured: z.boolean().optional().default(false),
    tech: z.array(z.string()).optional(),
    originalTitle: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: 'now.md', base: './src/content' }),
  schema: z.object({ date: z.coerce.date() }),
});

// Scrubbed copies of selected ADRs from the private homelab-iac repo (rendered under /decisions/).
const adr = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/adr' }),
  schema: z.object({
    title: z.string(),
    number: z.number(),
    date: z.coerce.date(),
    status: z.string(),
    summary: z.string(),
    // ADR numbers; linked on the page when that ADR is also published.
    supersedes: z.array(z.number()).optional(),
    supersededBy: z.number().optional(),
    // AI Influence Level (see /ail): 0–5 for the writing, optional separate level for images.
    ail: z.number().int().min(0).max(5).optional(),
    ailImages: z.number().int().min(0).max(5).optional(),
  }),
});

// Home page hero copy (src/content/home.md, frontmatter only).
const home = defineCollection({
  loader: glob({ pattern: 'home.md', base: './src/content' }),
  schema: z.object({
    greeting: z.string(),
    tagline: z.string(),
    intro: z.string(),
    now: z.array(z.object({ label: z.string(), text: z.string() })),
  }),
});

export const collections = { writing, projects, certs, now, adr, home };
