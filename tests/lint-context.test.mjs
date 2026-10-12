import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { lintContext } from '../kit/scripts/lint-context.mjs';
import { KIT_DIR, LINT_SCRIPT, adr, makeProject, spec } from './helpers.mjs';

function lint(files, options) {
  const project = makeProject(files);
  try {
    return lintContext(project.root, options);
  } finally {
    project.cleanup();
  }
}

const rules = (list) => list.map((item) => item.rule);

test('a minimal project with templates only is clean', () => {
  const { errors, warnings } = lint({});
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('reports placeholder left in an approved spec (AC-2.1)', () => {
  const { errors } = lint({ 'context/feature-specs/02-x.md': spec('Approved', 'Owner: {{name}}') });
  assert.deepEqual(rules(errors), ['placeholder']);
  assert.equal(errors[0].file, 'context/feature-specs/02-x.md');
  assert.equal(errors[0].line, 7);
});

test('reports open clarification in specs that are In Progress or Done (AC-2.1)', () => {
  for (const status of ['Approved', 'In Progress', 'Done']) {
    const { errors } = lint({ 'context/feature-specs/02-x.md': spec(status, '[NEEDS CLARIFICATION: which db?]') });
    assert.deepEqual(rules(errors), ['open-question'], status);
  }
});

test('draft specs may keep placeholders and questions as warnings only', () => {
  const { errors, warnings } = lint({ 'context/feature-specs/02-x.md': spec('Draft', '{{todo}}\n[NEEDS CLARIFICATION: x]') });
  assert.deepEqual(errors, []);
  assert.deepEqual(rules(warnings), ['placeholder']);
});

test('dropped specs are ignored for placeholders', () => {
  const { errors, warnings } = lint({ 'context/feature-specs/01-x.md': spec('Dropped (no UI)', '{{tokens}}') });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('reports unchecked task in a Done spec (AC-2.2)', () => {
  const { errors } = lint({ 'context/feature-specs/02-x.md': spec('Done', '- [x] T1 — done\n- [ ] T2 — forgotten') });
  assert.deepEqual(rules(errors), ['unchecked-task']);
});

test('reports unknown spec status', () => {
  const { errors } = lint({ 'context/feature-specs/02-x.md': spec('Finished') });
  assert.deepEqual(rules(errors), ['spec-status']);
});

test('reports broken relative links and @imports, ignores urls and inline code (AC-2.3)', () => {
  const { errors } = lint({
    'CLAUDE.md': '@AGENTS.md\n@context/missing.md\n',
    'context/project-overview.md': [
      '[ok](progress-tracker.md)',
      '[ok with anchor](progress-tracker.md#estado-atual)',
      '[web](https://example.com/x.md)',
      '`[x](not-a-link.md)`',
      '[broken](nope/missing.md)',
    ].join('\n'),
  });
  assert.deepEqual(errors.map((e) => `${e.rule}@${e.file}:${e.line}`), [
    'broken-link@CLAUDE.md:2',
    'broken-link@context/project-overview.md:5',
  ]);
});

test('resolves links in paths with spaces and encoded characters', () => {
  const { errors } = lint({
    'context/notes/meu arquivo.md': '# x\n',
    'context/project-overview.md': '[a](notes/meu%20arquivo.md) [b](<notes/meu arquivo.md>)',
  });
  assert.deepEqual(errors, []);
});

test('reports invalid and duplicate ADRs (AC-2.4)', () => {
  const { errors } = lint({
    'context/decisions/0001-a.md': adr('Accepted'),
    'context/decisions/0002-b.md': adr('Superseded by ADR-0003'),
    'context/decisions/0003-c.md': adr('Maybe'),
    'context/decisions/0003-d.md': adr('Proposed'),
  });
  assert.deepEqual(rules(errors).sort(), ['adr-duplicate', 'adr-status']);
});

test('reports always-loaded files over the line budget (AC-2.5)', () => {
  const big = `${'line\n'.repeat(450)}`;
  const { errors } = lint({ 'context/progress-tracker.md': big });
  assert.deepEqual(rules(errors), ['line-budget']);
  assert.match(errors[0].message, /budget 400/);
});

test('line budget is configurable in kit.config.json', () => {
  const { errors } = lint({
    'context/progress-tracker.md': 'line\n'.repeat(450),
    'kit.config.json': '{ "contextLineBudget": 1000 }',
  });
  assert.deepEqual(errors, []);
});

test('placeholders outside locked specs are warnings, errors with --strict (AC-2.6)', () => {
  const files = { 'context/project-overview.md': '| Nome | {{nome}} |\nUse `{{...}}` for placeholders.' };
  const normal = lint(files);
  assert.deepEqual(normal.errors, []);
  assert.deepEqual(rules(normal.warnings), ['placeholder']);
  const strict = lint(files, { strict: true });
  assert.deepEqual(rules(strict.errors), ['placeholder']);
});

test('missing context/ is a clear error', () => {
  const { errors } = lint({
    'AGENTS.md': null,
    'context/project-overview.md': null,
    'context/progress-tracker.md': null,
    'context/feature-specs/_TEMPLATE.md': null,
    'context/decisions/0000-adr-template.md': null,
  });
  assert.deepEqual(rules(errors), ['context-missing']);
});

test('the fresh kit itself passes with warnings only (AC-2.7)', () => {
  const result = spawnSync(process.execPath, [LINT_SCRIPT, '--root', KIT_DIR], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /context lint: 0 error\(s\)/);
});

test('cli exits 1 on errors and 2 on bad arguments', () => {
  const project = makeProject({ 'context/feature-specs/02-x.md': spec('Approved', '{{x}}') });
  try {
    const red = spawnSync(process.execPath, [LINT_SCRIPT, '--root', project.root], { encoding: 'utf8' });
    assert.equal(red.status, 1);
    assert.match(red.stdout, /context\/feature-specs\/02-x\.md:7/);
    const bad = spawnSync(process.execPath, [LINT_SCRIPT, '--nope'], { encoding: 'utf8' });
    assert.equal(bad.status, 2);
  } finally {
    project.cleanup();
  }
});
