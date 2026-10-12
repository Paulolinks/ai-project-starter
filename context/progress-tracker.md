# Progress Tracker

> **Carregado em toda sessão — mantenha curto.** É a memória de trabalho do projeto.
> Atualizado pela IA no `/session-end`. Log com mais de 5 sessões → mover as antigas para `context/archive/AAAA-MM.md`.

## Estado atual
- **Fase:** M1 — verificação por máquina
- **Foco agora:** spec 04 (ACs com evidência, bugfix, mudança de escopo)
- **Spec ativa:** nenhuma (02 e 03 concluídas)
- **Última atualização:** 2026-10-12

## Próximos passos (em ordem)
1. Paulo cria o repositório público no GitHub (MIT) para o primeiro push.
2. `/spec 04` — ACs com status e evidência, bugfix, mudança de escopo.

## Roadmap
| Marco | Specs incluídas | Status |
|---|---|---|
| M0 — Contexto e pesquisa | kickoff, ADR-0002, pesquisa | Em andamento |
| M1 — Verificação por máquina | 02 verify + lint, 03 hooks e travas, 04 ACs com evidência + bugfix + escopo | Planejado |
| M2 — Aprendizado e revisão | 05 lições + `/retro`, 06 subagentes reviewer/verifier | Planejado |
| M3 — Escala e reuso | 07 perfis Lite/Full, 08 Copier + versão do kit, 09 paralelismo + skills portáveis, 10 CI + observabilidade | Planejado |
| M4 — Piloto | usar o kit v2 num projeto real e medir; ajustar | Planejado |

## Features
| Spec | Título | Status | Observação |
|---|---|---|---|
| 01 | Design system | Dropped | kit não tem UI |
| 02 | Verify + lint do contexto | Done | 25 testes; verify verde |
| 03 | Hooks do Claude Code + travas honestas | Done | testado no Claude Code real |
| 04 | ACs com status/evidência, bugfix, mudança de escopo | A escrever | prioridade 1–2 |
| 05 | Lições aprendidas + `/retro` | A escrever | |
| 06 | Subagentes reviewer e verifier | A escrever | |
| 07 | Perfis Lite/Full e anexos por tipo | A escrever | |
| 08 | Instalação/atualização (Copier) + versionamento | A escrever | |
| 09 | Tarefas `[P]`, worktrees, skills para Codex e Cursor | A escrever | |
| 10 | CI, observabilidade, métricas do kit | A escrever | |
| 11 | Kit bilíngue (en + pt-BR) | A escrever | ADR-0003 |

Status possíveis: `Draft` → `Clarifying` → `Approved` → `In Progress` → `Done` (ou `Dropped`).

## Bloqueios e perguntas para o humano
- Criar o repositório público no GitHub: precisa da sua conta (o `gh` não está instalado nesta máquina).

## Problemas conhecidos / dívida técnica
| # | Descrição | Impacto | Onde | Plano |
|---|---|---|---|---|
| 1 | Guia afirma que settings bloqueia `.env`; Bash ainda lê | Falsa segurança | `kit/starter-guide/03-*.md` | Spec 03 |
| 2 | Caminho `_templates` fixo no guia não bate com a pasta real | Confusão no setup | `kit/starter-guide/01-*.md` | Spec 08 |
| 3 | Seção sobre o ChatGPT vai para todo projeto copiado | Ruído | `kit/starter-guide/03-*.md` | Spec 08 (CHANGELOG) |
| 4 | Git avisa conversão LF→CRLF em todos os arquivos | Diffs ruidosos entre Windows e CI | raiz e `kit/` | Adicionar `.gitattributes` (`* text=auto eol=lf`) na spec 10 |

## Log de sessões (mais recente primeiro, máx. 5)
### 2026-10-12
- **Feito:** spec 03 implementada (hooks guard, stop-verify, post-edit, session-start; 42 testes); spec 02 implementada (`kit/scripts/verify.mjs`, `lint-context.mjs`, 25 testes, verify verde); análise do kit v1 e pesquisa (relatório + `context/research/benchmark-2026-10.md`); criado `ai-project-starter-v2` com o kit em `kit/`; kickoff preencheu overview, arquitetura, padrões, UI (N/A), ADR-0002 proposto.
- **Decidido:** GitHub público + MIT; agentes Claude Code, Codex e Cursor; bilíngue (en + pt-BR); ADR-0002 aprovado; v1 fica intocado como backup; MVP = M1 (verificação por máquina); scripts em Node sem dependências (proposto).
- **Pendente:** criar repo no GitHub e fazer o primeiro push (4 commits locais).
