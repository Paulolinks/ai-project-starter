#!/usr/bin/env node
// SessionStart hook: injects where the project stands (git state, last verify, tracker's current
// state) so every session starts oriented, even if nobody runs /session-start.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMain, projectRoot, runHook } from './lib/io.mjs';

export const MAX_LINES = 40;
const STATE_HEADINGS = /^##\s+(Estado atual|Current state)\s*$/i;

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd();
}

function gitSection(root) {
  try {
    const branch = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
    const status = git(root, ['status', '--short']).split('\n').filter(Boolean);
    const lines = [`Git: branch ${branch}, ${status.length} changed file(s)`];
    lines.push(...status.slice(0, 10).map((l) => `  ${l}`));
    if (status.length > 10) lines.push(`  … ${status.length - 10} more`);
    return lines;
  } catch {
    try {
      git(root, ['rev-parse', '--git-dir']);
      return ['Git: repository has no commits yet'];
    } catch {
      return ['Git: not a git repository'];
    }
  }
}

function verifySection(root) {
  try {
    const last = JSON.parse(readFileSync(join(root, '.kit', 'last-verify.json'), 'utf8'));
    const failed = last.steps.filter((s) => !s.ok).map((s) => s.name);
    return [`Last verify: ${last.ok ? 'green' : `RED (${failed.join(', ')})`} at ${last.at}`];
  } catch {
    return ['Last verify: never run — run "node scripts/verify.mjs" before starting work'];
  }
}

function trackerSection(root) {
  const file = join(root, 'context', 'progress-tracker.md');
  if (!existsSync(file)) return [];
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => STATE_HEADINGS.test(l));
  if (start === -1) return [];
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines.slice(start, end === -1 ? undefined : end).filter((l) => l.trim());
}

export function buildContext(root) {
  const lines = [
    'Project status (injected by the kit at session start):',
    ...gitSection(root),
    ...verifySection(root),
    ...trackerSection(root),
  ];
  if (lines.length > MAX_LINES) lines.splice(MAX_LINES - 1, Infinity, '… (truncated — read context/progress-tracker.md)');
  return lines.join('\n');
}

export function decide(input, root) {
  if (!existsSync(join(root, 'context'))) return null;
  return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: buildContext(root) } };
}

if (isMain(import.meta.url)) runHook('session-start', (input) => decide(input, projectRoot(input)));
