// Build-machine independent formatting: always UTC, fixed English month names
// (Intl's en-GB renders September as "Sept").
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "07 Sep 2020" */
export const formatDate = (d: Date) =>
  `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

/** "Sep 2020" */
export const formatMonth = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export const readingTime = (body = '') => Math.ceil(body.split(/\s+/).length / 200);

/** Cert status at build time (a stale build shows stale status). */
export const certStatus = (expirationDate: string) =>
  expirationDate === 'Never' ? 'No expiry' : new Date(expirationDate) < new Date() ? 'Expired' : 'Active';
