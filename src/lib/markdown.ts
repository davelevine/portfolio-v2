import { marked } from 'marked';

/** Inline Markdown for frontmatter strings. External links open in a new tab, matching
 *  what rehype-external-links does for rendered Markdown. */
export const inlineMd = (s: string) =>
  (marked.parseInline(s) as string).replace(/<a href="(https?:\/\/)/g, '<a target="_blank" rel="noopener noreferrer" href="$1');
