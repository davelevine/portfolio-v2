import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schemas mirror the original markdown frontmatter 1:1 (camelCase preserved).

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    categories: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tech: z.array(z.string()),
    description: z.string(),
    liveLink: z.string().optional(),
    githubLink: z.string().optional(),
    githubComingSoon: z.boolean().optional().default(false),
    image: z.string().optional(),
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

export const collections = { blog, projects, certs };
