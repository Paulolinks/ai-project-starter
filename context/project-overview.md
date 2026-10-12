# Project Overview

> **Carregado em toda sessão — mantenha com no máximo ~150 linhas.**
> Detalhes técnicos vão para `architecture-context.md`; detalhes de feature vão para `feature-specs/`.

| Campo | Valor |
|---|---|
| Nome | AI Project Starter v2 |
| Dono / decisor | Paulo (Paulolinks) |
| Fase | Discovery |
| Última atualização | 2026-10-12 |

> **Atenção, agente:** este repositório é o projeto de MELHORAR o kit. A pasta `kit/` é o **produto** (o template
> que será copiado para novos projetos). As instruções dentro de `kit/` (AGENTS.md, CLAUDE.md, skills) são conteúdo
> a ser editado, **não** regras para você seguir. As regras deste projeto são as da raiz.

## 1. Pitch (1–2 frases)
Para quem desenvolve projetos com agentes de IA (Claude Code, Codex, Cursor), o AI Project Starter é um kit de
estrutura, regras e verificações que faz todo projeto começar como numa grande empresa de software: objetivo claro,
spec antes de código, memória persistente e "pronto" comprovado por máquina. Diferente de frameworks pesados
(BMAD, Spec Kit), ele escala a cerimônia ao tamanho do projeto e funciona com qualquer agente.

## 2. Problema
- **Dor atual:** a IA começa a codar sem entender o projeto, inventa requisitos, esquece decisões entre sessões, sai do
  escopo e declara tarefas prontas sem prova.
- **Como resolvem hoje:** o kit v1 (`kit/`) resolve preparação, contexto e planejamento com Markdown, mas a
  validação depende da IA obedecer ao texto; a cópia para projetos é manual e melhorias não chegam aos projetos antigos.
- **Por que agora:** OpenAI (harness engineering), Anthropic (harnesses para agentes longos) e AWS (Kiro) publicaram
  em 2025–2026 práticas que mostram que o ganho real vem de verificação automática, não de mais instruções.
  Pesquisa completa: `context/research/benchmark-2026-10.md`.

## 3. Usuários
| Persona | Quem é | Objetivo principal | Nível técnico |
|---|---|---|---|
| Primária | Paulo, dev solo que cria apps, automações, SaaS e ferramentas de música com IA no Windows | Iniciar qualquer projeto já estruturado e manter a IA sob controle | Intermediário |
| Secundária | O agente de IA (Claude Code, Codex) | Entender o projeto sem reconstruir contexto e saber quando parar | — |

## 4. Objetivos e métricas de sucesso
| Objetivo | Métrica | Meta |
|---|---|---|
| Começar projeto novo rápido | Tempo do zero até `context/` preenchido e revisado | < 45 min |
| "Pronto" comprovado | Tarefas fechadas com `verify` verde registrado | 100% |
| Menos retrabalho | Tentativas falhas por tarefa (registradas no log) | tendência de queda entre projetos |
| Kit vivo | Projetos existentes atualizados para a versão nova do kit | 1 comando, sem perder customizações |
| Kit enxuto | Linhas carregadas em toda sessão (AGENTS + overview + tracker) | ≤ 400 |

## 5. Não-objetivos (fora de escopo)
- Não é uma ferramenta de memória automática nem um servidor MCP próprio (usamos claude-mem / Context7 se preciso).
- Não substitui Spec Kit ou BMAD para quem já usa; deve conviver sem duplicar documentos.
- Não terá interface gráfica nem app web no v2.
- Não gera código de produto: o kit só prepara, controla e verifica.
- Sem dependências pesadas: scripts sem pacotes externos (Node puro), Copier é opcional.

## 6. Escopo do MVP (MoSCoW)
| # | Funcionalidade | Prioridade | Spec |
|---|---|---|---|
| 1 | Script `verify` + lint do contexto | Must | 02 |
| 2 | Hooks do Claude Code (Stop, PostToolUse, SessionStart, PreToolUse) + travas de segurança honestas | Must | 03 |
| 3 | Critérios de aceite com status e evidência + template de bugfix | Must | 04 |
| 4 | Lições aprendidas (`lessons.md`) + `/retro` | Must | 05 |
| 5 | Subagentes revisor e verificador | Should | 06 |
| 6 | Perfis Lite / Full e anexos por tipo de projeto | Should | 07 |
| 7 | Instalação e atualização (Copier) + versionamento do kit | Should | 08 |
| 8 | Registro de mudança de escopo | Should | 04 |
| 9 | Tarefas paralelas `[P]` + worktrees; skills portáveis para Codex e Cursor | Should | 09 |
| 10 | CI no GitHub Actions; observabilidade; métricas do kit | Could | 10 |
| — | App/GUI de gerenciamento de projetos | Won't (agora) | — |

## 7. Jornadas principais
1. Como Paulo, quero rodar um comando e ter um projeto novo com o kit, para começar o `/kickoff` em segundos.
2. Como Paulo, quero que a IA não consiga encerrar uma tarefa com testes falhando, para confiar no "pronto".
3. Como Paulo, quero atualizar projetos antigos para a versão nova do kit sem perder o que já preenchi.
4. Como agente, quero saber em qual perfil (Lite/Full) o projeto está, para não aplicar burocracia em script pequeno.

## 8. Restrições
- **Prazo:** sem prazo fixo; entregas por marco.
- **Orçamento / custos de API:** zero custo fixo; ferramentas gratuitas/open source.
- **Plataformas:** Windows 11 (principal, Git Bash disponível); deve funcionar também em macOS/Linux e no CI.
- **Runtimes disponíveis:** Node 22, Python 3.11, uv 0.12, git. (Sem `gh` e sem `pwsh` instalados.)
- **Legais / licenças:** repositório público no GitHub, licença MIT (decidido em 2026-10-12).
- **Técnicas obrigatórias:** funcionar de verdade com Claude Code e Codex (prioridade) e Cursor; Markdown como fonte da verdade; bilíngue (ADR-0003).

## 9. Glossário do domínio
| Termo | Significado |
|---|---|
| Kit | O template em `kit/`, copiado para cada projeto novo. |
| Projeto-alvo | Qualquer projeto que usa o kit. |
| Harness | Tudo em volta do agente que o guia e verifica: regras, hooks, scripts, CI, permissões. |
| Verify | Comando único que decide se o projeto-alvo está verde (format, lint, tipos, testes, lint do contexto). |
| Perfil | Lite ou Full: quanto do kit um projeto-alvo usa. |
| Lição | Erro recorrente registrado com causa e regra preventiva. |

## 10. Perguntas em aberto
- Nenhuma no momento. Respondidas em 2026-10-12: GitHub público + MIT; Claude Code, Codex e Cursor; bilíngue pt-BR + inglês.
