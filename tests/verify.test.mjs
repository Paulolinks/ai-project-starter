import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { VERIFY_SCRIPT, makeProject, spec } from './helpers.mjs';

const node = JSON.stringify(process.execPath);
const pass = `${node} -e "console.log('all good')"`;
const fail = `${node} -e "for (let i = 1; i <= 40; i++) console.log('line ' + i); process.exit(3)"`;

function run(project, ...args) {
  return spawnSync(process.execPath, [VERIFY_SCRIPT, '--root', project.root, ...args], { encoding: 'utf8' });
}

function withProject(files, fn) {
  const project = makeProject(files);
  try {
    return fn(project);
  } finally {
    project.cleanup();
  }
}

const config = (verify, extra = {}) => JSON.stringify({ verify, ...extra });

test('green when every step passes (AC-1.1)', () => withProject(
  { 'kit.config.json': config([{ name: 'tests', run: pass }, { name: 'lint', run: pass }]) },
  (project) => {
    const result = run(project);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /✔ context-lint \(\d+\.\ds\)/);
    assert.match(result.stdout, /✔ tests/);
    assert.match(result.stdout, /✔ lint/);
    assert.match(result.stdout, /verify: green/);
  },
));

test('red when a step fails, runs remaining steps and shows the last 30 lines (AC-1.2)', () => withProject(
  { 'kit.config.json': config([{ name: 'tests', run: fail }, { name: 'lint', run: pass }]) },
  (project) => {
    const result = run(project);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /✖ tests/);
    assert.match(result.stdout, /✔ lint/);
    assert.match(result.stdout, /tests failed \(exit 3\)/);
    assert.match(result.stdout, /line 40/);
    assert.match(result.stdout, /line 11\n/);
    assert.doesNotMatch(result.stdout, /line 10\n/);
    assert.match(result.stdout, /verify: red — tests failed/);
  },
));

test('without commands it runs only the context lint and warns (AC-1.3)', () => withProject({}, (project) => {
  const result = run(project);
  assert.equal(result.status, 0, result.stdout);
  assert.match(result.stdout, /no verification commands configured/);
  assert.match(result.stdout, /\(1 step\(s\)\)/);
}));

test('context lint errors make verify red', () => withProject(
  { 'context/feature-specs/02-x.md': spec('Approved', '{{x}}') },
  (project) => {
    const result = run(project);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /✖ context-lint/);
    assert.match(result.stdout, /02-x\.md:7/);
  },
));

test('records the result in .kit/last-verify.json (AC-1.4)', () => withProject(
  { 'kit.config.json': config([{ name: 'tests', run: fail }]) },
  (project) => {
    run(project);
    const saved = JSON.parse(readFileSync(join(project.root, '.kit', 'last-verify.json'), 'utf8'));
    assert.equal(saved.ok, false);
    assert.ok(!Number.isNaN(Date.parse(saved.at)));
    assert.deepEqual(saved.steps.map((s) => [s.name, s.ok, s.exitCode]), [['context-lint', true, 0], ['tests', false, 3]]);
  },
));

test('a missing program is a failed step, not a crash', () => withProject(
  { 'kit.config.json': config([{ name: 'ghost', run: 'definitely-not-a-real-command-kit' }]) },
  (project) => {
    const result = run(project);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /✖ ghost/);
  },
));

test('steps time out', () => withProject(
  { 'kit.config.json': config([{ name: 'slow', run: `${node} -e "setTimeout(() => {}, 60000)"`, timeoutMin: 0.02 }]) },
  (project) => {
    const result = run(project);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /timed out/);
  },
));

test('--only runs a single step', () => withProject(
  { 'kit.config.json': config([{ name: 'tests', run: pass }, { name: 'lint', run: fail }]) },
  (project) => {
    const result = run(project, '--only', 'tests');
    assert.equal(result.status, 0, result.stdout);
    assert.doesNotMatch(result.stdout, /lint/);
  },
));

test('invalid config exits 2 with a clear message', () => {
  withProject({ 'kit.config.json': '{ "verify": [ }' }, (project) => {
    const result = run(project);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /kit\.config\.json is not valid JSON/);
  });
  withProject({ 'kit.config.json': config([{ name: 'x' }]) }, (project) => {
    const result = run(project);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /needs a non-empty "run"/);
  });
});
