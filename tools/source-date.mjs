/**
 * When was this page's source last actually changed? Ask git, not the author.
 *
 * The Now page carries an "updated <month>" stamp and tells the reader outright
 * that the page is only ever true today. That was a hand-typed constant, so it
 * would have gone on claiming July long after July — the one page on the site
 * whose whole promise is freshness, quietly lying about it. Taking the date from
 * the last commit that touched the source means the stamp cannot drift from the
 * content, because editing the content is what moves it.
 *
 * The build stays reproducible: a commit date only changes when something is
 * committed, so two builds of the same tree agree. The wrinkle is the same one
 * the sitemap has — edit a source, build, and the stamp still shows the previous
 * commit until the edit is committed and the build is rerun. `build.mjs --check`
 * catches that.
 */
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * ISO date (YYYY-MM-DD) of the last commit touching `relativePath`, or null if
 * git cannot say — no repository, or the file has never been committed. Null
 * rather than today's date on purpose: a missing stamp is honest, a guessed one
 * is not.
 */
export function sourceDate(relativePath) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', relativePath], { cwd: root, encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-07-28" -> "July 2026". Split rather than parsed, so no timezone can shift the month. */
export function monthYear(iso) {
  if (!iso) return null;
  const [year, month] = iso.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}
