#!/usr/bin/env node
/**
 * Build everything, in dependency order.
 *
 *   node tools/build.mjs
 *   node tools/build.mjs --check   # fail if the build changes any tracked file
 *
 * There are six generators and they have to run in the right order: pages before
 * the search index (which reads the rendered HTML), everything before the
 * sitemap. Remembering that by hand is how a content edit ends up committed with
 * a stale index. This is the one command.
 *
 * --check is the guard for that: it builds, then asks git whether anything moved.
 * A dirty tree after a build means the committed output no longer matches its
 * source, and the fix is to commit what was just regenerated.
 */
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

// Order matters: each step may read what the previous one wrote.
const STEPS = [
  ['generate-placeholders.mjs', 'placeholder artwork'],
  ['build-pages.mjs', 'hand-written pages'],
  ['build-work-pages.mjs', 'work pages'],
  ['build-feed.mjs', 'feed'],
  ['build-search-index.mjs', 'search index'],
  ['build-sitemap.mjs', 'sitemap and robots'],
];

const run = (script) => execFileSync(process.execPath, [path.join(root, 'tools', script)], { cwd: root, encoding: 'utf8' }).trim();

const started = Date.now();
for (const [script, label] of STEPS) {
  const output = run(script);
  console.log(`  ${label.padEnd(22)} ${output.split('\n').pop()}`);
}
console.log(`built in ${((Date.now() - started) / 1000).toFixed(1)}s`);

// The social cards need a browser, so they are not part of the default build —
// they only change when the artwork does.
console.log('  (social cards: node tools/build-social-images.mjs — needs a browser)');

if (check) {
  let dirty;
  try {
    // Compare the rebuilt tree against the index, not against HEAD. Output that
    // is already staged is exactly what is about to be committed; only a file the
    // build changed *after* staging means the committed output would be stale.
    const changed = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim();
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).trim();
    dirty = [changed, untracked].filter(Boolean).join('\n');
  } catch {
    console.log('\nnot a git repository — cannot check for stale output');
    process.exit(0);
  }
  // Only paths the build actually writes count. A new tool or content module in
  // the tree is not stale output, and failing on it would train everyone to
  // ignore this check.
  const GENERATED = /^(?:[^/]+\.html|feed\.xml|sitemap\.xml|robots\.txt|assets\/search-index\.json|assets\/img\/.+)$/;
  const moved = dirty.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => GENERATED.test(line));

  if (moved.length) {
    console.log('\nSTALE — rebuilding changed these files, so the committed output was out of date:\n');
    moved.forEach((line) => console.log('  ' + line));
    console.log('\nThey have been regenerated. Commit them.');
    process.exit(1);
  }
  console.log('\nup to date — a rebuild changes nothing');
}
