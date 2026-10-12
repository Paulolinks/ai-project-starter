// Claude Code hook protocol helpers: JSON in on stdin, JSON out on stdout.
// Hooks must never crash the session: on unexpected errors they exit 0 with a warning.

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function readInput(stream = process.stdin) {
  let raw = '';
  for await (const chunk of stream) raw += chunk;
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function projectRoot(input = {}) {
  return resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
}

export function respond(output) {
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

// Runs a hook's handler. The handler returns an output object (or null for "no opinion").
export async function runHook(name, handler) {
  try {
    const input = await readInput();
    const output = await handler(input);
    if (output) respond(output);
    process.exit(0);
  } catch (err) {
    respond({ systemMessage: `kit hook "${name}" failed and was skipped: ${err.message}` });
    process.exit(0);
  }
}

export function isMain(importMetaUrl) {
  return Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(importMetaUrl);
}

export function toPosix(path) {
  return String(path ?? '').split('\\').join('/');
}
