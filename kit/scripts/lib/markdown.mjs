// Small line-based Markdown helpers for the kit's context checks.
// Deliberately simple: the kit's own templates are the format we parse.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const SPEC_STATUSES = ['Draft', 'Clarifying', 'Approved', 'In Progress', 'Done', 'Dropped'];
export const LOCKED_SPEC_STATUSES = ['Approved', 'In Progress', 'Done'];
const ADR_STATUS = /^(Proposed|Accepted|Deprecated|Superseded by ADR-\d{4})\b/;

export function readLines(file) {
  return readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
}

// Removes `inline code` so that documentation *about* placeholders is not flagged.
export function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, '');
}

// Yields { text, lineNo, inFence } for every line, tracking ``` fences.
export function* iterateLines(lines) {
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const isFence = /^\s*(```|~~~)/.test(text);
    if (isFence) inFence = !inFence;
    yield { text, lineNo: i + 1, inFence: inFence || isFence };
  }
}

// Reads a "| Field | value |" row from the metadata table at the top of specs and ADRs.
export function getTableField(lines, field) {
  const row = new RegExp(`^\\|\\s*${field}\\s*\\|\\s*(.*?)\\s*\\|\\s*$`);
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(row);
    if (match) {
      const value = match[1].replace(/<!--.*?-->/g, '').trim();
      return { value, lineNo: i + 1 };
    }
  }
  return null;
}

export function getSpecStatus(lines) {
  const field = getTableField(lines, 'Status');
  if (!field) return null;
  const status = SPEC_STATUSES.find((s) => field.value === s || field.value.startsWith(`${s} `) || field.value.startsWith(`${s}(`));
  return { raw: field.value, status: status ?? null, lineNo: field.lineNo };
}

export function isValidAdrStatus(value) {
  return ADR_STATUS.test(value);
}

// Returns relative link targets found on a line: [text](target) and Claude Code @imports.
export function findLocalLinks(line) {
  const targets = [];
  const clean = stripInlineCode(line);
  for (const match of clean.matchAll(/\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    targets.push(match[1]);
  }
  const atImport = clean.match(/^@(\S+)\s*$/);
  if (atImport) targets.push(atImport[1]);
  return targets
    .filter((t) => !/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(t))
    .filter((t) => !t.includes('{{'))
    .map((t) => {
      const path = t.split('#')[0].split('?')[0];
      try { return decodeURIComponent(path); } catch { return path; }
    })
    .filter((t) => t.length > 0);
}

export function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listMarkdownFiles(full));
    else if (name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}
