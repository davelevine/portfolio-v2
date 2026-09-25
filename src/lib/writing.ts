// Writing sections; also the `category` enum in content.config.ts.
export const CATEGORIES = ['Homelab', 'AWS', 'Work', 'Personal'] as const;
export type Category = (typeof CATEGORIES)[number];
/** Grey lede under each category page's heading. */
export const CATEGORY_LEDES: Record<Category, string> = {
  Homelab: 'Building, breaking, and rebuilding the servers and network at home.',
  AWS: 'Study notes from working toward the AWS Solutions Architect certification.',
  Work: 'Lessons and opinions from the day job.',
  Personal: 'Reflections, milestones, and the occasional detour.',
};
export const categoryHref = (c: string) => `/writing/category/${c.toLowerCase()}/`;
