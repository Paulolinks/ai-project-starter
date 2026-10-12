#!/usr/bin/env node
// Checks the project's context/ documents so agents never build on broken information.
// Usage: node scripts/lint-context.mjs [--root <dir>] [--strict] [--json]
// Exit codes: 0 = no errors (warnings allowed), 1 = errors, 2 = usage/config error.

import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigError, loadConfig } from './lib/config.mjs';
import {
  LOCKED_SPEC_STATUSES,
  findLocalLinks,
  getSpecStatus,
  getTableField,
  isValidAdrStatus,
  iterateLines,
  listMarkdownFiles,
  readLines,
  stripInlineCode,
} from './lib/markdown.mjs';

const TEMPLATE_FILES = new Set(['_TEMPLATE.md', '0000-adr-template.md']);

export function lintContext(root, { strict = false, config } = {}) {
  root = resolve(root);
  const errors = [];
  const warnings = [];
  const rel = (file) => relative(root, file).split('\\').join('/');
  const report = (list, file, line, rule, message) => list.push({ file: rel(file), line, rule, message });

  const contextDir = join(root, 'context');
  if (!existsSync(contextDir)) {
    report(errors, root, 0, 'context-missing', 'context/ not found — is this a project using the kit?');
    return { errors, warnings };
  }
  config ??= loadConfig(root);

  const contextFiles = listMarkdownFiles(contextDir);
  const ruleFiles = ['AGENTS.md', 'CLAUDE.md'].map((f) => join(root, f)).filter(existsSync);
  const specsDir = join(contextDir, 'feature-specs');
  const decisionsDir = join(contextDir, 'decisions');
  const isTemplate = (file) => TEMPLATE_FILES.has(basename(file));
  const isSpec = (file) => dirname(file) === specsDir && !isTemplate(file);
  const isAdr = (file) => dirname(file) === decisionsDir && !isTemplate(file);

  for (const file of [...ruleFiles, ...contextFiles]) {
    const lines = readLines(file);
    const spec = isSpec(file) ? getSpecStatus(lines) : null;
    const locked = spec && LOCKED_SPEC_STATUSES.includes(spec.status);

    if (isSpec(file)) {
      if (!spec) report(errors, file, 1, 'spec-status', 'spec has no "| Status | ... |" row');
      else if (!spec.status) report(errors, file, spec.lineNo, 'spec-status', `unknown spec status "${spec.raw}" (use Draft, Clarifying, Approved, In Progress, Done or Dropped)`);
    }

    for (const { text, lineNo, inFence } of iterateLines(lines)) {
      const visible = inFence ? text : stripInlineCode(text);

      const dropped = spec?.status === 'Dropped';
      if (!isTemplate(file) && !dropped && visible.includes('{{')) {
        const target = locked || strict ? errors : warnings;
        const why = locked ? `placeholder left in a spec with status ${spec.status}` : 'unfilled placeholder';
        report(target, file, lineNo, 'placeholder', `${why}: ${text.trim().slice(0, 80)}`);
      }
      if (locked && visible.includes('[NEEDS CLARIFICATION')) {
        report(errors, file, lineNo, 'open-question', `open [NEEDS CLARIFICATION] in a spec with status ${spec.status}`);
      }
      if (spec?.status === 'Done' && /^\s*[-*]\s+\[ \]/.test(text)) {
        report(errors, file, lineNo, 'unchecked-task', 'spec is Done but this task is not checked');
      }
      if (!inFence) {
        for (const target of findLocalLinks(text)) {
          if (!existsSync(resolve(dirname(file), target))) {
            report(errors, file, lineNo, 'broken-link', `link target not found: ${target}`);
          }
        }
      }
    }
  }

  const adrNumbers = new Map();
  for (const file of contextFiles.filter(isAdr)) {
    const number = basename(file).match(/^(\d{4})-/)?.[1];
    if (!number) {
      report(errors, file, 1, 'adr-name', 'ADR file name must start with a 4-digit number, e.g. 0002-stack.md');
    } else if (adrNumbers.has(number)) {
      report(errors, file, 1, 'adr-duplicate', `ADR number ${number} is also used by ${adrNumbers.get(number)}`);
    } else {
      adrNumbers.set(number, rel(file));
    }
    const status = getTableField(readLines(file), 'Status');
    if (!status) report(errors, file, 1, 'adr-status', 'ADR has no "| Status | ... |" row');
    else if (!isValidAdrStatus(status.value)) {
      const target = status.value.includes('{{') ? warnings : errors;
      report(target, file, status.lineNo, 'adr-status', `invalid ADR status "${status.value}" (use Proposed, Accepted, Deprecated or Superseded by ADR-NNNN)`);
    }
  }

  let total = 0;
  for (const name of config.alwaysLoaded) {
    const file = join(root, name);
    if (existsSync(file)) total += readLines(file).length;
  }
  if (total > config.contextLineBudget) {
    report(errors, root, 0, 'line-budget', `always-loaded files have ${total} lines (budget ${config.contextLineBudget}): ${config.alwaysLoaded.join(', ')}`);
  }

  return { errors, warnings, alwaysLoadedLines: total };
}

function format({ file, line, rule, message }) {
  const where = line ? `${file || '.'}:${line}` : file || '.';
  return `${where}  ${message}  [${rule}]`;
}

function parseArgs(argv) {
  const args = { root: process.cwd(), strict: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--strict') args.strict = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--root' && argv[i + 1]) args.root = argv[++i];
    else throw new ConfigError(`unknown argument: ${arg}\nusage: node scripts/lint-context.mjs [--root <dir>] [--strict] [--json]`);
  }
  return args;
}

function main() {
  let args;
  let result;
  try {
    args = parseArgs(process.argv.slice(2));
    result = lintContext(args.root, { strict: args.strict });
  } catch (err) {
    if (!(err instanceof ConfigError)) throw err;
    console.error(`✖ ${err.message}`);
    process.exit(2);
  }
  const { errors, warnings, alwaysLoadedLines } = result;
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const w of warnings) console.log(`⚠ ${format(w)}`);
    for (const e of errors) console.log(`✖ ${format(e)}`);
    const lines = alwaysLoadedLines === undefined ? '' : `, ${alwaysLoadedLines} always-loaded lines`;
    console.log(`${errors.length ? '✖' : '✔'} context lint: ${errors.length} error(s), ${warnings.length} warning(s)${lines}`);
  }
  process.exit(errors.length ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
