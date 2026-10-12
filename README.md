# AI Project Starter

**English** · [Português](#português)

A starter kit that makes every AI-assisted project begin the way large software companies do: a clear goal,
a spec before code, persistent memory, and "done" proven by a machine, not by the agent's word.
Works with Claude Code, Codex and Cursor. MIT licensed.

> Status: **v2 in development.** The template lives in [`kit/`](kit/). Templates are being translated to
> English (ADR-0003); the usage guide is currently in Portuguese.

## What you get
- `AGENTS.md` / `CLAUDE.md` — one set of rules for every agent, read on demand through a context map.
- `context/` — project overview, progress tracker, architecture, code standards, specs and ADRs.
- Skills — `/kickoff`, `/adopt`, `/spec`, `/implement`, `/review`, `/adr`, `/session-start`, `/session-end`.
- `scripts/verify.mjs` — one command that decides whether the project is green (context lint + your tests, lint, type check).
- Claude Code hooks — block secrets and destructive commands, refuse to end a turn while verify is red,
  and open every session with git status, last verify and current project state.

Requirements: Node.js 20+ (scripts and hooks use no npm packages) and git.

## Quick start
```bash
cp -r kit/. my-project/
cd my-project && git init
node scripts/verify.mjs
```
Then open Claude Code and run `/kickoff <your idea in one sentence>`.

## This repository
| Path | What it is |
|---|---|
| `kit/` | The product: the template copied into each new project |
| `context/` | How we build the kit itself (it uses its own method) |
| `tests/` | `node:test` tests for the kit's scripts and hooks |

Run the checks: `node kit/scripts/verify.mjs`

---

## Português

Kit para começar qualquer projeto com IA do jeito que grandes empresas de software fazem: objetivo claro,
spec antes de código, memória persistente e "pronto" comprovado por máquina, não pela palavra do agente.
Funciona com Claude Code, Codex e Cursor. Licença MIT.

- O template fica em [`kit/`](kit/); o guia de uso está em [`kit/starter-guide/`](kit/starter-guide/01-como-usar.md).
- Requisitos: Node.js 20+ e git.
- Início rápido: copie o conteúdo de `kit/` para a pasta do projeto, rode `git init` e depois `/kickoff <sua ideia>` no Claude Code.
- Para verificar este repositório: `node kit/scripts/verify.mjs`.
