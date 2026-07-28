#!/usr/bin/env node
/**
 * The gate. Everything that must be true before publishing.
 *
 *   node tools/verify.mjs           # build freshness, audits, weight
 *   node tools/verify.mjs --quick   # skip the slow full-page sweep
 *   node tools/verify.mjs --engine=webkit
 *
 * Each stage prints one line and the whole thing exits non-zero if any fails, so
 * it works as a pre-commit hook or a CI step.
 */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const quick = args.includes('--quick');
const engine = (args.find((argument) => argument.startsWith('--engine=')) || '--engine=chromium').replace('--engine=', '');

const STAGES = [
  ['output is current', ['build.mjs', '--check']],
  ['html, orphans, freshness', ['audit.mjs', '--only=static,freshness', `--engine=${engine}`]],
  ['feed', ['audit-feed.mjs']],
  ['link text', ['audit-links-text.mjs']],
  ['content security policy', ['audit-csp.mjs']],
  ['forms', ['audit-forms.mjs', `--engine=${engine}`]],
  quick ? null : ['pages, contrast, keyboard, modes', ['audit.mjs', `--engine=${engine}`]],
  quick ? null : ['page weight', ['audit-weight.mjs']],
  quick ? null : ['visual regression', ['audit-visual.mjs']],
].filter(Boolean);

let failed = 0;
for (const [label, argv] of STAGES) {
  const started = Date.now();
  const result = spawnSync(process.execPath, [path.join(root, 'tools', argv[0]), ...argv.slice(1)], { cwd: root, encoding: 'utf8' });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const ok = result.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(34)} ${seconds}s`);
  if (!ok) {
    const output = ((result.stdout || '') + (result.stderr || '')).trim().split('\n');
    output.slice(-14).forEach((line) => console.log('        ' + line));
  }
}

console.log(failed ? `\n${failed} stage(s) failed` : `\nall clear (${engine})`);
process.exit(failed ? 1 : 0);
