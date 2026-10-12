#!/usr/bin/env node
// Stop hook: when files changed since the last check, runs scripts/verify.mjs before the agent may
// finish its turn. Red → blocks and sends the failures back (at most MAX_BLOCKS times in a row);
// after that it lets the turn end and warns the user. Unchanged files → exits immediately.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { verify } from '../../scripts/verify.mjs';
import { isMain, projectRoot, runHook } from './lib/io.mjs';

export const MAX_BLOCKS = 2;
const STATE_FILE = join('.kit', 'stop-state.json');
const SKIP_DIRS = new Set(['.git', '.kit', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build', '.next', 'target']);

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isDirectory()) walk(full, out);
    else out.push(`${full}|${info.size}|${info.mtimeMs}`);
  }
}

// A cheap fingerprint of the working tree. With git: status + diff + untracked file stats.
// Without git: path, size and mtime of every file outside dependency/build folders.
export function fingerprint(root) {
  const hash = createHash('sha256');
  try {
    const status = git(root, ['status', '--porcelain=v1', '-uall'])
      .split('\n')
      .filter((line) => line && !line.slice(3).startsWith('.kit/'));
    hash.update(status.join('\n'));
    try { hash.update(git(root, ['diff', 'HEAD'])); } catch { hash.update(git(root, ['diff'])); }
    for (const line of status.filter((l) => l.startsWith('??'))) {
      const file = join(root, line.slice(3).replace(/^"|"$/g, ''));
      if (existsSync(file)) {
        const info = statSync(file);
        hash.update(`${file}|${info.size}|${info.mtimeMs}`);
      }
    }
  } catch {
    const files = [];
    walk(root, files);
    hash.update(files.sort().join('\n'));
  }
  return hash.digest('hex');
}

function readState(root) {
  try { return JSON.parse(readFileSync(join(root, STATE_FILE), 'utf8')); } catch { return {}; }
}

function writeState(root, state) {
  mkdirSync(join(root, '.kit'), { recursive: true });
  writeFileSync(join(root, STATE_FILE), `${JSON.stringify(state, null, 2)}\n`);
}

export async function decide(input, root, { runVerify = (r) => verify(r, { log: () => {} }) } = {}) {
  if (!existsSync(join(root, 'context'))) return null;
  const active = Boolean(input.stop_hook_active);
  const state = readState(root);
  const fp = fingerprint(root);

  if (fp === state.fingerprint) {
    if (active && state.ok === false) {
      writeState(root, { ...state, blocks: 0 });
      return { systemMessage: `⚠ verify is still red (${state.failed.join(', ')}). Nothing changed since the last check; review before continuing.` };
    }
    return null;
  }

  const summary = await runVerify(root);
  const failed = summary.steps.filter((s) => !s.ok).map((s) => s.name);
  const after = fingerprint(root);
  if (summary.ok) {
    writeState(root, { fingerprint: after, ok: true, failed: [], blocks: 0 });
    return null;
  }

  const blocks = (active ? state.blocks ?? 0 : 0) + 1;
  if (blocks > MAX_BLOCKS) {
    writeState(root, { fingerprint: after, ok: false, failed, blocks: 0 });
    return { systemMessage: `⚠ verify is still red after ${MAX_BLOCKS} fix attempts: ${failed.join(', ')}. The agent stopped; run "node scripts/verify.mjs" to see the details.` };
  }
  writeState(root, { fingerprint: after, ok: false, failed, blocks });
  return {
    decision: 'block',
    reason: [
      `The project is red — verify failed: ${failed.join(', ')} (attempt ${blocks} of ${MAX_BLOCKS}).`,
      'Run "node scripts/verify.mjs" to see the output, fix the cause, and finish again.',
      'Do not weaken or delete tests to make them pass. If you cannot fix it, say so plainly to the user and list what still fails.',
    ].join(' '),
  };
}

if (isMain(import.meta.url)) runHook('stop-verify', (input) => decide(input, projectRoot(input)));
