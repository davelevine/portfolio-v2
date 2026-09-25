// Blog sections; also the `category` enum in content.config.ts.
export const CATEGORIES = ['Homelab', 'AWS', 'Work', 'Personal'] as const;
export type Category = (typeof CATEGORIES)[number];
export const categoryHref = (c: string) => `/blog/category/${c.toLowerCase()}/`;
