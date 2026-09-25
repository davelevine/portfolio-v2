// Decision (ADR) categories; also the `category` enum in content.config.ts.
export const ADR_CATEGORIES = ['Infrastructure as Code', 'Automation', 'Containers', 'Storage & Backups', 'Hosting'] as const;
export type AdrCategory = (typeof ADR_CATEGORIES)[number];
// URL value for the /decisions filter: "Storage & Backups" -> "storage-backups"
export const adrCategorySlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-');
