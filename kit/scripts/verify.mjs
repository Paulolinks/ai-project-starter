#!/usr/bin/env node
// One command that decides whether the project is green.
// Runs the context lint, then every command in kit.config.json "verify", and records the result
// in .kit/last-verify.json for hooks and CI.
// Usage: node scripts/verify.mjs [--root <dir>] [--only <name>] [--json]
// Exit codes: 0 = green, 1 = red, 2 = usage/config error.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigError, loadConfig } from './lib/config.mjs';

const TAIL_LINES = 30;
const LINT_SCRIPT = fileURLToPath(new URL('./lint-context.mjs', import.meta.url));

export function runStep(command, { cwd, timeoutMs, shell = true }) {
  return new Promise((done) => {
    const started = Date.now();
    let output = '';
    let timedOut = false;
    const [cmd, args] = Array.isArray(command) ? [command[0], command.slice(1)] : [command, []];
    const child = spawn(cmd, args, { cwd, shell, env: process.env, windowsHide: true });
    const collect = (chunk) => { output += chunk.toString(); };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    const finish = (exitCode, extra = '') => {
      clearTimeout(timer);
      if (timedOut) extra += `\ntimed out after ${Math.round(timeoutMs / 60000)} min`;
      done({ ok: exitCode === 0 && !timedOut, exitCode, ms: Date.now() - started, output: output + extra });
    };
    child.on('error', (err) => finish(null, `\n${err.message}`));
    child.on('close', (code) => finish(code));
  });
}

export function tail(text, n = TAIL_LINES) {
  return text.trimEnd().split(/\r?\n/).slice(-n).join('\n');
}

export async function verify(root, { only = null, log = console.log } = {}) {
  root = resolve(root);
  const config = loadConfig(root);
  const steps = [];

  if (!only || only === 'context-lint') {
    steps.push({
      name: 'context-lint',
      command: [process.execPath, LINT_SCRIPT, '--root', root],
      shell: false,
      timeoutMs: 5 * 60_000,
    });
  }
  for (const step of config.verify) {
    if (only && step.name !== only) continue;
    steps.push({
      name: step.name,
      command: step.run,
      timeoutMs: (step.timeoutMin ?? config.defaultTimeoutMin) * 60_000,
    });
  }
  if (only && steps.length === 0) throw new ConfigError(`no verify step named "${only}"`);
  if (!only && config.verify.length === 0) {
    log(`⚠ no verification commands configured — add them to "verify" in kit.config.json`);
  }

  const results = [];
  for (const step of steps) {
    const result = await runStep(step.command, { cwd: root, timeoutMs: step.timeoutMs, shell: step.shell ?? true });
    results.push({ name: step.name, ...result });
    log(`${result.ok ? '✔' : '✖'} ${step.name} (${(result.ms / 1000).toFixed(1)}s)`);
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of failed) {
    log(`\n── ${r.name} failed (exit ${r.exitCode ?? 'n/a'}) — last ${TAIL_LINES} lines ──\n${tail(r.output)}`);
  }
  const summary = {
    at: new Date().toISOString(),
    ok: failed.length === 0,
    steps: results.map(({ name, ok, ms, exitCode }) => ({ name, ok, ms, exitCode })),
  };
  mkdirSync(join(root, '.kit'), { recursive: true });
  writeFileSync(join(root, '.kit', 'last-verify.json'), `${JSON.stringify(summary, null, 2)}\n`);
  log(`\n${summary.ok ? '✔ verify: green' : `✖ verify: red — ${failed.map((r) => r.name).join(', ')} failed`} (${results.length} step(s))`);
  return summary;
}

function parseArgs(argv) {
  const args = { root: process.cwd(), only: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') args.json = true;
    else if (arg === '--root' && argv[i + 1]) args.root = argv[++i];
    else if (arg === '--only' && argv[i + 1]) args.only = argv[++i];
    else throw new ConfigError(`unknown argument: ${arg}\nusage: node scripts/verify.mjs [--root <dir>] [--only <name>] [--json]`);
  }
  return args;
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const summary = await verify(args.root, { only: args.only, log: args.json ? () => {} : console.log });
    if (args.json) console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.ok ? 0 : 1);
  } catch (err) {
    if (!(err instanceof ConfigError)) throw err;
    console.error(`✖ ${err.message}`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
