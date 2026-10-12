#!/usr/bin/env node
// PostToolUse hook: after the agent edits a file, runs the per-file commands from
// kit.config.json "onEdit" (e.g. a formatter or a fast linter) and reports failures back.
// Keep these commands fast: they run on every edit. The full suite belongs to verify.

import { extname } from 'node:path';
import { loadConfig } from '../../scripts/lib/config.mjs';
import { runStep, tail } from '../../scripts/verify.mjs';
import { isMain, projectRoot, runHook } from './lib/io.mjs';

const TIMEOUT_MS = 60_000;

export async function decide(input, root) {
  const file = input.tool_input?.file_path;
  if (!file) return null;
  const { onEdit } = loadConfig(root);
  const steps = onEdit.filter((s) => !s.extensions || s.extensions.includes(extname(file).toLowerCase()));
  if (steps.length === 0) return null;

  const failures = [];
  for (const step of steps) {
    const command = step.run.split('{file}').join(JSON.stringify(file));
    const result = await runStep(command, { cwd: root, timeoutMs: TIMEOUT_MS });
    if (!result.ok) failures.push(`── ${step.name} failed on ${file} ──\n${tail(result.output, 20)}`);
  }
  if (failures.length === 0) return null;
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `Per-file checks failed after your edit. Fix these before moving on:\n${failures.join('\n')}`,
    },
  };
}

if (isMain(import.meta.url)) runHook('post-edit', (input) => decide(input, projectRoot(input)));
