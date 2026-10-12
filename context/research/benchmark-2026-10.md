# Pesquisa: como grandes empresas e projetos open source estruturam trabalho com IA (out/2026)

> Base das specs do v2. Cada linha diz o que copiar e para qual spec vai.
> Relatório completo com fontes: https://claude.ai/code/artifact/1ca99622-3092-4ae0-af44-5eeb09616e8d

## Empresas
| Fonte | Prática | O que levamos para o kit | Spec |
|---|---|---|---|
| OpenAI — Harness engineering (fev/2026) | AGENTS.md como mapa; docs validadas por linter e CI; testes estruturais de arquitetura; agente com acesso a logs; humano projeta o ambiente | Lint do contexto; CI; seção de observabilidade; testes de camadas opcionais | 02, 10 |
| Anthropic — Effective harnesses for long-running agents | Agente inicializador; lista de features em JSON com `passes: false`; arquivo de progresso; `init.sh`; uma feature por sessão; teste end-to-end antes de marcar | ACs com status + evidência; `features.json` no perfil Full; `/session-start` roda verify como baseline | 04, 02 |
| Anthropic — Claude Code (hooks, subagentes, settings) | Hooks Stop/PostToolUse/SessionStart/PreToolUse; subagentes com contexto limpo; `Read` deny não cobre Bash; sandbox | Spec de hooks e travas honestas; subagentes reviewer/verifier | 03, 06 |
| AWS — Kiro | Specs em requisitos (EARS) / design / tarefas; steering files por tema; hooks por evento; bugfix spec (atual, esperado, inalterado) | Template de bugfix; EARS opcional; anexos por tipo de projeto | 04, 07 |
| Google — Design docs, small CLs, SRE | Contexto, objetivos, não-objetivos, alternativas; mudanças pequenas; postmortem sem culpa | Já no kit; postmortem vira formato das lições | 05 |
| Amazon — Working Backwards (PR/FAQ) | Escrever o comunicado e o FAQ antes de construir | Já no kit (`project-overview`); opcional: seção FAQ no perfil Full | 07 |

## Open source (GitHub)
| Projeto | Ideia principal | O que levamos | O que evitamos |
|---|---|---|---|
| [github/spec-kit](https://github.com/github/spec-kit) | constitution → specify → plan → tasks → implement; tarefas `[P]` paralelas | Marcação `[P]` e dependências | Duplicar specs em `specs/` |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | Propostas de mudança (delta) sobre specs existentes | Bloco "delta" em spec aprovada; registro de mudança de escopo | Pasta paralela de changes |
| [obra/superpowers](https://github.com/obra/superpowers) | Skills que forçam brainstorm, plano, TDD, subagente por tarefa e revisão em 2 etapas (spec, depois qualidade) | Revisão em 2 etapas no subagente revisor; TDD explícito no `/implement` | Cerimônia pesada em tarefa pequena |
| [buildermethods/agent-os](https://github.com/buildermethods/agent-os) | 3 camadas: standards, product (mission, roadmap, tech-stack), specs; `/discover-standards` e índice de standards | Standards por tema carregados por caminho (`.claude/rules/` com `paths:`) | Renomear arquivos que já funcionam |
| [eyaltoledano/claude-task-master](https://github.com/eyaltoledano/claude-task-master) | PRD → tarefas com dependências, análise de complexidade 1–10, "próxima tarefa" | Campo de complexidade e dependências nas tarefas; regra de "próxima tarefa" | Dependência de CLI externa |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | Agentes por papel; trilhas Quick Flow / Method / Enterprise conforme tamanho | Perfis Lite / Full (equivalente às trilhas) | Dezenas de personas |
| [copier-org/copier](https://github.com/copier-org/copier) | Template com `copier update` que leva melhorias a projetos existentes | Distribuição e atualização do kit | — |
| Kits `LEARNINGS.md` / self-improvement | Registrar erros, promover após 3 repetições para AGENTS.md | `lessons.md` + `/retro` | Auto-edição sem revisão humana |
| [agentskills.io](https://agentskills.io) | Padrão aberto de skills (SKILL.md) lido por Claude Code, Codex e outros | Sync `.claude/skills` → `.agents/skills` | — |

## Achados sobre o kit v1
- Forte: AGENTS.md como mapa, L0–L3, spec antes de código, ADRs, `/adopt`, orçamento de tokens.
- Lacuna principal: nada é verificado por máquina; `settings.json` só tem permissões.
- Afirmação incorreta: o guia 03 diz que o settings bloqueia leitura de `.env`, mas `Read(./.env)` não cobre `cat .env` no Bash.
- Distribuição manual, sem versão nem caminho de atualização; pasta não é repositório git.
- Princípios 7 (escopo) e 8 (melhoria contínua) sem artefato próprio.
