// Builds throwaway target projects for the kit's script tests.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KIT_DIR = fileURLToPath(new URL('../kit/', import.meta.url));
export const LINT_SCRIPT = join(KIT_DIR, 'scripts', 'lint-context.mjs');
export const VERIFY_SCRIPT = join(KIT_DIR, 'scripts', 'verify.mjs');

export function spec(status, body = '') {
  return `# Spec 02 — Example\n\n| Campo | Valor |\n|---|---|\n| Status | ${status} |\n\n${body}\n`;
}

export function adr(status) {
  return `# ADR-0002: Example\n\n| Campo | Valor |\n|---|---|\n| Status | ${status} |\n`;
}

// files: { 'relative/path.md': 'content' }. A minimal valid project is always created.
// The directory name contains a space on purpose, to cover Windows-style paths.
export function makeProject(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'kit test '));
  const base = {
    'AGENTS.md': '# Rules\n\nSee [overview](context/project-overview.md).\n',
    'context/project-overview.md': '# Overview\n',
    'context/progress-tracker.md': '# Tracker\n',
    'context/feature-specs/_TEMPLATE.md': spec('Draft', '{{template placeholder}}\n[NEEDS CLARIFICATION: x]'),
    'context/decisions/0000-adr-template.md': adr('{{Proposed / Accepted}}'),
  };
  for (const [path, content] of Object.entries({ ...base, ...files })) {
    if (content === null) continue;
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}
