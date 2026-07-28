/**
 * When the shows actually ran, in machine-readable form.
 *
 * The prose deliberately gives dates without a year — "23 April – 31 May" reads
 * better and does not rot — but that leaves nothing any check can compare against
 * today. So the year lives here, next to nothing else, and only audits read it.
 * Nothing in the build depends on it, so it cannot make the output non-reproducible.
 *
 * When a show opens, set `end` to the day it closes. tools/audit-dates.mjs uses it
 * to decide whether present-tense exhibition copy is currently a true statement.
 */
export const CURRENT_SHOW = {
  title: 'Like a flower you shall bloom',
  page: 'series-like-a-flower.html',
  start: '2026-04-23',
  end: '2026-05-31',
};
