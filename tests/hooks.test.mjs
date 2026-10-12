import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import * as guard from '../kit/.claude/hooks/guard.mjs';
import * as postEdit from '../kit/.claude/hooks/post-edit.mjs';
import * as sessionStart from '../kit/.claude/hooks/session-start.mjs';
import * as stopVerify from '../kit/.claude/hooks/stop-verify.mjs';
import { KIT_DIR, makeProject } from './helpers.mjs';

const node = JSON.stringify(process.execPath);
const PASS = `${node} -e "process.exit(0)"`;
const FAIL = `${node} -e "console.log('boom'); process.exit(1)"`;

function withProject(files, fn) {
  const project = makeProject(files);
  return Promise.resolve()
    .then(() => fn(project))
    .finally(() => project.cleanup());
}

function runHookProcess(script, root, input) {
  return spawnSync(process.execPath, [join(KIT_DIR, '.claude', 'hooks', script)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
  });
}

const decision = (out) => out?.hookSpecificOutput?.permissionDecision ?? 'allow';

describe('guard (PreToolUse)', () => {
  const root = 'C:\\proj';
  const bash = (command) => decision(guard.decide({ tool_name: 'Bash', tool_input: { command } }, root));
  const ps = (command) => decision(guard.decide({ tool_name: 'PowerShell', tool_input: { command } }, root));

  test('denies commands that touch secrets (AC-4.1)', () => {
    for (const c of ['cat .env', 'type .env.local', 'grep KEY config/.env', 'cp id_rsa.pem /tmp', 'less secrets/prod.json', 'cat "./.env"']) {
      assert.equal(bash(c), 'deny', c);
    }
  });

  test('allows harmless commands that mention env', () => {
    for (const c of ['cat .env.example', 'echo $NODE_ENV', 'node -e "console.log(process.env.HOME)"', 'ls -la', 'npm test', 'git status', 'python -m venv .venv']) {
      assert.equal(bash(c), 'allow', c);
    }
  });

  test('denies destructive commands (AC-4.2)', () => {
    for (const c of [
      'rm -rf build', 'rm -fr /', 'rm -r -f dist', 'sudo rm --recursive --force x', 'npm test && rm -Rf node_modules',
      'git push --force', 'git push -f origin main', 'git push origin +main', 'git reset --hard HEAD~1', 'git clean -fd',
      'psql -c "DROP TABLE users"', 'sqlite3 db "drop database x"',
    ]) {
      assert.equal(bash(c), 'deny', c);
    }
    assert.equal(ps('Remove-Item -Recurse -Force .\\dist'), 'deny');
    assert.equal(ps('rm -r -fo C:\\temp\\x'), 'deny');
  });

  test('allows normal git and file commands', () => {
    for (const c of ['rm file.txt', 'rm -r empty-dir', 'git push -u origin feat/x', 'git push --force-with-lease', 'git reset HEAD file', 'git clean -n']) {
      assert.equal(bash(c), 'allow', c);
    }
  });

  test('denies editing secret files, allows .env.example', () => {
    const edit = (file_path) => decision(guard.decide({ tool_name: 'Write', tool_input: { file_path } }, root));
    assert.equal(edit('C:\\proj\\.env'), 'deny');
    assert.equal(edit('C:\\proj\\certs\\server.key'), 'deny');
    assert.equal(edit('C:\\proj\\.env.example'), 'allow');
    assert.equal(edit('C:\\proj\\src\\app.ts'), 'allow');
  });

  test('asks before editing protected paths (AC-4.3)', () => withProject(
    { 'kit.config.json': JSON.stringify({ protectedPaths: ['db/migrations/**', 'vendor/', 'LICENSE'] }) },
    ({ root: projectDir }) => {
      const edit = (rel) => decision(guard.decide({ tool_name: 'Edit', tool_input: { file_path: join(projectDir, rel) } }, projectDir));
      assert.equal(edit('db/migrations/001_init.sql'), 'ask');
      assert.equal(edit('vendor/lib/a.js'), 'ask');
      assert.equal(edit('LICENSE'), 'ask');
      assert.equal(edit('src/index.ts'), 'allow');
    },
  ));

  test('works as a process with the Claude Code JSON protocol', () => withProject({}, ({ root: projectDir }) => {
    const out = runHookProcess('guard.mjs', projectDir, { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'cat .env' } });
    assert.equal(out.status, 0, out.stderr);
    assert.equal(JSON.parse(out.stdout).hookSpecificOutput.permissionDecision, 'deny');
    const ok = runHookProcess('guard.mjs', projectDir, { tool_name: 'Bash', tool_input: { command: 'npm test' } });
    assert.equal(ok.status, 0);
    assert.equal(ok.stdout.trim(), '');
  }));
});

describe('stop-verify (Stop)', () => {
  const config = (run) => JSON.stringify({ verify: [{ name: 'tests', run }] });

  test('green project lets the turn end and skips re-running when nothing changed (AC-1.1, AC-1.3)', () => withProject(
    { 'kit.config.json': config(PASS) },
    async ({ root }) => {
      let runs = 0;
      const runVerify = async () => { runs++; return { ok: true, steps: [{ name: 'tests', ok: true }] }; };
      assert.equal(await stopVerify.decide({}, root, { runVerify }), null);
      const started = Date.now();
      assert.equal(await stopVerify.decide({}, root, { runVerify }), null);
      assert.equal(runs, 1);
      assert.ok(Date.now() - started < 1000);
      writeFileSync(join(root, 'context', 'new.md'), '# changed\n');
      await stopVerify.decide({}, root, { runVerify });
      assert.equal(runs, 2);
    },
  ));

  test('red project blocks twice, then lets the turn end with a warning (AC-1.1, AC-1.2)', () => withProject({}, async ({ root }) => {
    const runVerify = async () => ({ ok: false, steps: [{ name: 'context-lint', ok: true }, { name: 'tests', ok: false }] });
    const touch = (n) => writeFileSync(join(root, 'context', `edit-${n}.md`), `${n}\n`);

    const first = await stopVerify.decide({ stop_hook_active: false }, root, { runVerify });
    assert.equal(first.decision, 'block');
    assert.match(first.reason, /verify failed: tests \(attempt 1 of 2\)/);
    touch(1);
    const second = await stopVerify.decide({ stop_hook_active: true }, root, { runVerify });
    assert.equal(second.decision, 'block');
    assert.match(second.reason, /attempt 2 of 2/);
    touch(2);
    const third = await stopVerify.decide({ stop_hook_active: true }, root, { runVerify });
    assert.equal(third.decision, undefined);
    assert.match(third.systemMessage, /still red after 2 fix attempts: tests/);
  }));

  test('agent that changes nothing after a block may stop, with a warning', () => withProject({}, async ({ root }) => {
    const runVerify = async () => ({ ok: false, steps: [{ name: 'tests', ok: false }] });
    await stopVerify.decide({}, root, { runVerify });
    const again = await stopVerify.decide({ stop_hook_active: true }, root, { runVerify });
    assert.match(again.systemMessage, /still red \(tests\)/);
    assert.equal(await stopVerify.decide({}, root, { runVerify }), null);
  }));

  test('runs the real verify as a process inside a git repository', () => withProject(
    { 'kit.config.json': config(FAIL) },
    ({ root }) => {
      execFileSync('git', ['init', '-q'], { cwd: root });
      const out = runHookProcess('stop-verify.mjs', root, { hook_event_name: 'Stop', stop_hook_active: false });
      assert.equal(out.status, 0, out.stderr);
      const result = JSON.parse(out.stdout);
      assert.equal(result.decision, 'block');
      assert.match(result.reason, /tests/);
      const saved = JSON.parse(readFileSync(join(root, '.kit', 'last-verify.json'), 'utf8'));
      assert.equal(saved.ok, false);
    },
  ));

  test('does nothing in a folder without context/', () => withProject(
    { 'AGENTS.md': null, 'context/project-overview.md': null, 'context/progress-tracker.md': null, 'context/feature-specs/_TEMPLATE.md': null, 'context/decisions/0000-adr-template.md': null },
    async ({ root }) => {
      assert.equal(await stopVerify.decide({}, root, { runVerify: async () => { throw new Error('should not run'); } }), null);
    },
  ));
});

describe('post-edit (PostToolUse)', () => {
  test('does nothing when onEdit is empty (AC-2.2)', () => withProject({}, async ({ root }) => {
    assert.equal(await postEdit.decide({ tool_input: { file_path: join(root, 'a.ts') } }, root), null);
  }));

  test('runs matching per-file commands and reports failures (AC-2.1)', () => withProject(
    {
      'kit.config.json': JSON.stringify({
        onEdit: [
          { name: 'fmt', run: `${node} -e "process.exit(process.argv[1].endsWith('bad.ts') ? 1 : 0)" {file}`, extensions: ['.ts'] },
          { name: 'py-only', run: `${FAIL} {file}`, extensions: ['.py'] },
        ],
      }),
    },
    async ({ root }) => {
      assert.equal(await postEdit.decide({ tool_input: { file_path: join(root, 'good.ts') } }, root), null);
      const out = await postEdit.decide({ tool_input: { file_path: join(root, 'bad.ts') } }, root);
      assert.equal(out.hookSpecificOutput.hookEventName, 'PostToolUse');
      assert.match(out.hookSpecificOutput.additionalContext, /fmt failed on .*bad\.ts/);
      assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /py-only/);
    },
  ));
});

describe('session-start (SessionStart)', () => {
  const tracker = '# Tracker\n\n## Estado atual\n- **Fase:** MVP\n- **Foco agora:** login\n\n## Próximos passos\n1. x\n';

  test('injects git, last verify and the tracker state (AC-3.1)', () => withProject(
    { 'context/progress-tracker.md': tracker, '.kit/last-verify.json': JSON.stringify({ at: '2026-10-12T00:00:00Z', ok: false, steps: [{ name: 'tests', ok: false }] }) },
    ({ root }) => {
      execFileSync('git', ['init', '-q'], { cwd: root });
      const text = sessionStart.decide({}, root).hookSpecificOutput.additionalContext;
      assert.match(text, /Git: (branch|repository has no commits)/);
      assert.match(text, /Last verify: RED \(tests\)/);
      assert.match(text, /\*\*Foco agora:\*\* login/);
      assert.doesNotMatch(text, /Próximos passos/);
    },
  ));

  test('works without git and caps the size at 40 lines', () => withProject(
    { 'context/progress-tracker.md': `## Current state\n${'- item\n'.repeat(80)}` },
    ({ root }) => {
      const text = sessionStart.buildContext(root);
      assert.match(text, /Git: not a git repository|Git: /);
      assert.match(text, /never run/);
      assert.ok(text.split('\n').length <= sessionStart.MAX_LINES);
      assert.match(text, /truncated/);
    },
  ));
});

test('settings.json registers every hook with node in exec form', () => {
  const settings = JSON.parse(readFileSync(join(KIT_DIR, '.claude', 'settings.json'), 'utf8'));
  for (const [event, script] of [['SessionStart', 'session-start'], ['PreToolUse', 'guard'], ['PostToolUse', 'post-edit'], ['Stop', 'stop-verify']]) {
    const hook = settings.hooks[event][0].hooks[0];
    assert.equal(hook.command, 'node', event);
    assert.deepEqual(hook.args, [`\${CLAUDE_PROJECT_DIR}/.claude/hooks/${script}.mjs`], event);
  }
  assert.ok(settings.permissions.deny.includes('Edit(./.env)'));
  assert.ok(!settings.permissions.deny.some((r) => r.includes('.env.example') || r.includes('.env.*')));
});
