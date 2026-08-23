#!/usr/bin/env node
/**
 * One question, asked of every place that answers it: which release is current?
 *
 * The plan is served by three hosts — Netlify, Vercel and GitHub Pages — and
 * each pins the current release its own way. Nothing makes them agree, and
 * nothing fails when they don't: a host left on the old version serves last
 * quarter's plan with a 200 and no error anywhere.
 *
 * This check finds every pin, requires them to agree, and requires them to
 * point at the newest plan file present. Publishing V0.7 and forgetting a
 * file now fails the build instead of going unnoticed until someone in a
 * meeting is reading the wrong plan.
 */
import { readFileSync, readdirSync } from 'node:fs';

const PLAN = /^Annual_Operational_Plan_2026_V(\d+)_(\d+)\.html$/;
const REF = /Annual_Operational_Plan_2026_V\d+_\d+\.html/g;

/** Every pin, as {where, file}. */
function pins() {
  const out = [];
  for (const path of ['netlify.toml', 'vercel.json', 'index.html']) {
    let text;
    try { text = readFileSync(path, 'utf8'); } catch { continue; }
    text.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(REF)) out.push({ where: `${path}:${i + 1}`, file: m[0] });
    });
  }
  return out;
}

/** Newest plan file on disk, by version number rather than by name. */
function newest() {
  const found = readdirSync('.')
    .map((n) => [n, PLAN.exec(n)])
    .filter(([, m]) => m)
    .map(([n, m]) => ({ name: n, v: Number(m[1]) * 1000 + Number(m[2]) }))
    .sort((a, b) => b.v - a.v);
  return found[0]?.name ?? null;
}

const found = pins();
const current = newest();
const problems = [];

if (found.length === 0) problems.push('No release pin found in any host config. Expected at least one.');
if (!current) problems.push('No Annual_Operational_Plan_2026_V*.html file found.');

const distinct = [...new Set(found.map((p) => p.file))];
if (distinct.length > 1) {
  problems.push(
    `Hosts disagree about the current release: ${distinct.join(', ')}.\n` +
    found.map((p) => `      ${p.where} -> ${p.file}`).join('\n'),
  );
} else if (current && distinct[0] && distinct[0] !== current) {
  problems.push(
    `Every host points at ${distinct[0]}, but the newest plan present is ${current}.\n` +
    '      If the new file is a draft, keep it on a branch. If it is the release,\n' +
    '      update every pin listed below:\n' +
    found.map((p) => `      ${p.where}`).join('\n'),
  );
}

// A pin naming a file that is not there is a 404 waiting to happen.
for (const p of found) {
  try { readFileSync(p.file); } catch { problems.push(`${p.where} points at ${p.file}, which does not exist.`); }
}

if (problems.length) {
  console.error('Current-release check FAILED\n');
  for (const p of problems) console.error('  - ' + p + '\n');
  process.exit(1);
}

console.log(`Current release: ${current}`);
console.log(`${found.length} pins across ${new Set(found.map((p) => p.where.split(':')[0])).size} files, all in agreement.`);
