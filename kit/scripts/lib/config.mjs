// Reads and validates kit.config.json at the project root.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CONFIG_FILE = 'kit.config.json';
export const DEFAULTS = Object.freeze({
  verify: [],
  contextLineBudget: 400,
  alwaysLoaded: ['AGENTS.md', 'context/project-overview.md', 'context/progress-tracker.md'],
  defaultTimeoutMin: 10,
  onEdit: [],
  protectedPaths: [],
});

export class ConfigError extends Error {}

export function loadConfig(root) {
  const file = join(root, CONFIG_FILE);
  if (!existsSync(file)) return { ...DEFAULTS, path: null };

  let raw;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
  } catch (err) {
    throw new ConfigError(`${CONFIG_FILE} is not valid JSON: ${err.message}`);
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConfigError(`${CONFIG_FILE} must contain a JSON object`);
  }

  const config = { ...DEFAULTS, ...raw, path: file };
  if (!Array.isArray(config.verify)) throw new ConfigError(`${CONFIG_FILE}: "verify" must be an array`);
  config.verify.forEach((step, i) => {
    if (!step || typeof step.name !== 'string' || !step.name.trim()) {
      throw new ConfigError(`${CONFIG_FILE}: verify[${i}] needs a non-empty "name"`);
    }
    if (typeof step.run !== 'string' || !step.run.trim()) {
      throw new ConfigError(`${CONFIG_FILE}: verify[${i}] ("${step.name}") needs a non-empty "run" command`);
    }
    if (step.timeoutMin !== undefined && !(typeof step.timeoutMin === 'number' && step.timeoutMin > 0)) {
      throw new ConfigError(`${CONFIG_FILE}: verify[${i}] ("${step.name}") "timeoutMin" must be a positive number`);
    }
  });
  if (!(Number.isInteger(config.contextLineBudget) && config.contextLineBudget > 0)) {
    throw new ConfigError(`${CONFIG_FILE}: "contextLineBudget" must be a positive integer`);
  }
  if (!Array.isArray(config.alwaysLoaded)) throw new ConfigError(`${CONFIG_FILE}: "alwaysLoaded" must be an array`);
  if (!Array.isArray(config.protectedPaths) || !config.protectedPaths.every((p) => typeof p === 'string')) {
    throw new ConfigError(`${CONFIG_FILE}: "protectedPaths" must be an array of glob strings`);
  }
  if (!Array.isArray(config.onEdit)) throw new ConfigError(`${CONFIG_FILE}: "onEdit" must be an array`);
  config.onEdit.forEach((step, i) => {
    if (!step || typeof step.name !== 'string' || typeof step.run !== 'string' || !step.run.includes('{file}')) {
      throw new ConfigError(`${CONFIG_FILE}: onEdit[${i}] needs "name" and a "run" command containing {file}`);
    }
    if (step.extensions !== undefined && !(Array.isArray(step.extensions) && step.extensions.every((e) => typeof e === 'string'))) {
      throw new ConfigError(`${CONFIG_FILE}: onEdit[${i}] ("${step.name}") "extensions" must be an array like [".ts", ".tsx"]`);
    }
  });
  return config;
}
