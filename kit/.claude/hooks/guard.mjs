#!/usr/bin/env node
// PreToolUse guard: denies shell commands that touch secrets or destroy data, denies edits to
// secret files, and asks before editing protected paths (kit.config.json "protectedPaths").
// Limits: this inspects command text. Obfuscated commands can slip through; enable the sandbox
// where available for OS-level protection (see starter-guide).

import { relative } from 'node:path';
import { loadConfig } from '../../scripts/lib/config.mjs';
import { isMain, projectRoot, runHook, toPosix } from './lib/io.mjs';

const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

const SECRET_IN_COMMAND = [
  { re: /(^|[\s'"=/\\:<>|;&(])\.env(?!\.example\b)(\.[\w.-]+)?(?=$|[\s'"/\\;&|)<>])/, what: '.env files' },
  { re: /(^|[\s'"/\\=])[\w.-]*\.(pem|key)(?=$|[\s'";&|)])/, what: 'private keys (*.pem, *.key)' },
  { re: /(^|[\s'"/\\=])secrets[/\\]/, what: 'the secrets/ folder' },
];

export function isSecretPath(path) {
  const p = toPosix(path);
  const name = p.split('/').pop();
  if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') return true;
  if (/\.(pem|key)$/.test(name)) return true;
  return /(^|\/)secrets\//.test(p);
}

function splitSegments(command) {
  return command.split(/&&|\|\||[;|\n]/).map((s) => s.trim()).filter(Boolean);
}

function tokens(segment) {
  const list = segment.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  while (['sudo', 'command', 'exec', 'nohup'].includes(list[0])) list.shift();
  return list;
}

function shortFlags(list) {
  return list.filter((t) => /^-[a-zA-Z]+$/.test(t)).join('');
}

export function destructiveReason(command) {
  if (/\bdrop\s+(database|table|schema)\b/i.test(command)) return 'DROP DATABASE/TABLE/SCHEMA';
  if (/\btruncate\s+table\b/i.test(command)) return 'TRUNCATE TABLE';
  for (const segment of splitSegments(command)) {
    const t = tokens(segment);
    const [cmd, sub] = [t[0]?.toLowerCase(), t[1]];
    const flags = shortFlags(t.slice(1));
    const long = new Set(t.filter((x) => x.startsWith('--')));
    if (cmd === 'rm' && (/[rR]/.test(flags) || long.has('--recursive')) && (flags.includes('f') || long.has('--force'))) {
      return 'rm -rf';
    }
    if (cmd === 'git' && sub === 'push' && (long.has('--force') || /f/.test(flags) || t.some((x) => /^\+[^+]/.test(x)))) {
      return 'git push --force';
    }
    if (cmd === 'git' && sub === 'reset' && long.has('--hard')) return 'git reset --hard';
    if (cmd === 'git' && sub === 'clean' && (/f/.test(flags) || long.has('--force'))) return 'git clean -f';
    if (['remove-item', 'rm', 'del', 'ri', 'rmdir', 'rd'].includes(cmd)) {
      const lower = t.map((x) => x.toLowerCase());
      const recurse = lower.some((x) => /^-r(e(c(u(r(s(e)?)?)?)?)?)?$/.test(x));
      const force = lower.some((x) => /^-fo(r(c(e)?)?)?$/.test(x));
      if (recurse && force) return 'Remove-Item -Recurse -Force';
    }
    if (cmd === 'format' || cmd === 'mkfs' || /^mkfs\./.test(cmd ?? '')) return 'disk formatting';
  }
  return null;
}

export function secretReason(command) {
  return SECRET_IN_COMMAND.find(({ re }) => re.test(command))?.what ?? null;
}

function globToRegExp(glob) {
  let re = '';
  const g = toPosix(glob).replace(/^\.\//, '');
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*' && g[i + 1] === '*') {
      re += '.*';
      i++;
      if (g[i + 1] === '/') i++;
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}${g.endsWith('/') ? '.*' : ''}$`);
}

export function matchesProtected(relPath, patterns) {
  const p = toPosix(relPath);
  return patterns.some((glob) => globToRegExp(glob).test(p));
}

const deny = (reason) => ({
  hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
});
const ask = (reason) => ({
  hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason },
});

export function decide(input, root) {
  const tool = input.tool_name;
  const toolInput = input.tool_input ?? {};

  if (SHELL_TOOLS.has(tool)) {
    const command = String(toolInput.command ?? '');
    const destructive = destructiveReason(command);
    if (destructive) {
      return deny(`Blocked by the project kit: "${destructive}" is destructive. Only the user may run it — explain what you wanted to do and ask them to run it themselves.`);
    }
    const secret = secretReason(command);
    if (secret) {
      return deny(`Blocked by the project kit: this command touches ${secret}. Never read or print secrets; use .env.example for variable names.`);
    }
    return null;
  }

  if (EDIT_TOOLS.has(tool)) {
    const file = toolInput.file_path ?? toolInput.notebook_path;
    if (!file) return null;
    if (isSecretPath(file)) {
      return deny('Blocked by the project kit: secret files (.env, *.pem, *.key, secrets/) must not be edited by the agent.');
    }
    const rel = toPosix(relative(root, file));
    const { protectedPaths = [] } = loadConfig(root);
    if (!rel.startsWith('..') && matchesProtected(rel, protectedPaths)) {
      return ask(`"${rel}" is a protected path (kit.config.json "protectedPaths"). Confirm only if this change was explicitly requested.`);
    }
  }
  return null;
}

if (isMain(import.meta.url)) runHook('guard', (input) => decide(input, projectRoot(input)));
