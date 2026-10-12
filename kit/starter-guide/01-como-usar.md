# AI Project Starter — como usar

Kit de contexto para desenvolver com IA (Claude Code e Codex no VS Code, e também Cursor/Copilot)
sem alucinação, sem esquecimento entre sessões e sem a IA sair codando antes de entender o projeto.

## O que tem no kit

```
ai-project-starter/
├── CLAUDE.md                  ← entrada do Claude Code (importa AGENTS.md + 2 arquivos essenciais)
├── AGENTS.md                  ← constituição: regras para QUALQUER agente (Codex lê direto)
├── .claude/
│   ├── settings.json          ← travas reais: bloqueia ler .env, rm -rf, push --force; pede confirmação p/ commit/install
│   └── skills/                ← workflows prontos (viram comandos /)
│       ├── kickoff/           /kickoff        projeto novo: entrevista e preenche o contexto
│       ├── adopt/             /adopt          projeto existente: audita o código e documenta a realidade
│       ├── spec/              /spec           especifica uma feature antes do código
│       ├── implement/         /implement      implementa spec aprovada, tarefa por tarefa
│       ├── review/            /review         revisão do diff antes do commit
│       ├── adr/               /adr            registra decisão de arquitetura
│       ├── session-start/     /session-start  "onde paramos?"
│       └── session-end/       /session-end    salva a memória do projeto
├── context/
│   ├── project-overview.md    ← O QUÊ e PARA QUEM (carregado sempre)
│   ├── progress-tracker.md    ← memória de trabalho: onde paramos (carregado sempre)
│   ├── ai-workflow-rules.md   ← COMO trabalhamos: níveis L0–L3, DoR, DoD, anti-alucinação
│   ├── architecture-context.md← COMO é construído: stack, pastas, dados, comandos
│   ├── code-standards.md      ← padrões de código, testes, git
│   ├── ui-context.md          ← telas, fluxos, UX, acessibilidade
│   ├── feature-specs/
│   │   ├── _TEMPLATE.md       ← modelo de spec (requisitos + design + tarefas)
│   │   └── 01-design-system.md← primeira spec de todo projeto com UI
│   ├── decisions/             ← ADRs (por que decidimos X)
│   └── archive/               ← logs antigos do tracker
└── starter-guide/             ← este guia (pode apagar do projeto depois do setup)
```

## Onde guardar o kit
Guarde a pasta `ai-project-starter` num lugar fixo, por exemplo `C:\Users\paulo\Projects\_templates\ai-project-starter`.
**Nunca edite o kit original com dados de um projeto** — sempre copie.

## Projeto NOVO — passo a passo

1. Crie a pasta do projeto e rode `git init`.
2. Copie **o conteúdo** de `ai-project-starter` (inclusive a pasta oculta `.claude`) para a raiz do projeto.
   No PowerShell:
   ```powershell
   Copy-Item -Recurse -Force "C:\Users\paulo\Projects\_templates\ai-project-starter\*" "C:\Users\paulo\Projects\meu-projeto\"
   ```
3. Acrescente ao `.gitignore` o conteúdo de `starter-guide/gitignore-additions.txt`.
4. Abra no VS Code, abra o Claude Code e rode:
   ```
   /kickoff um app que transforma prompts em faixas de música eletrônica
   ```
5. Responda as rodadas de perguntas. No fim você terá overview, arquitetura, padrões, UI e roadmap preenchidos.
6. Revise os arquivos você mesmo (é rápido e é o que faz a diferença) e faça o commit: `docs: initialize project context`.
7. Primeira feature: `/spec 01` (design system) ou `/spec esqueleto do projeto` → aprove → `/implement 01`.

## Projeto EXISTENTE
Mesmos passos 2–3; se o projeto já tiver `CLAUDE.md` ou `AGENTS.md`, **mescle** (não sobrescreva). Depois:
```
/adopt
```
A IA audita o código sem alterá-lo, documenta o que realmente existe, te entrevista sobre os objetivos e lista problemas e próximos passos.

## O ciclo do dia a dia

```
/session-start                       → onde paramos?
/spec <feature>                      → spec + perguntas (você responde)
"aprovado"                           → status Approved
/implement NN                        → tarefa por tarefa, com testes
/review                              → revisão do diff
/session-end                         → memória atualizada + mensagem de commit
/clear                               → contexto limpo para o próximo assunto
```

Não precisa de spec para tudo — veja os níveis em `context/ai-workflow-rules.md`:
**L0** (typo) faz direto · **L1** (bug pequeno) plano curto · **L2** (feature) spec · **L3** (estrutural) spec + ADR.

## O que vai onde

| Informação | Arquivo |
|---|---|
| Ideia, público, escopo, o que NÃO fazer | `project-overview.md` |
| Stack, pastas, banco, integrações, comandos | `architecture-context.md` |
| Por que escolhemos X e não Y | `decisions/NNNN-*.md` |
| Como escrever código, testes, commits | `code-standards.md` |
| Telas, fluxos, UX | `ui-context.md` + spec 01 (tokens) |
| Uma feature específica | `feature-specs/NN-*.md` |
| Onde paramos, bugs conhecidos, próximos passos | `progress-tracker.md` |
| Regras de comportamento da IA | `AGENTS.md` + `ai-workflow-rules.md` |

**Regra de ouro: cada informação mora em um único lugar.** Duplicar = a IA vai encontrar duas versões e escolher a errada.

## Por que o CLAUDE.md importa o AGENTS.md
O Claude Code só lê o `AGENTS.md` sozinho quando **não existe** `CLAUDE.md`. Como o `CLAUDE.md` existe (para regras
específicas do Claude), ele importa o `AGENTS.md` com `@AGENTS.md`. Assim:
- **Claude Code** → lê `CLAUDE.md` → que puxa `AGENTS.md` + overview + tracker.
- **Codex / Cursor / Copilot** → leem `AGENTS.md` direto.
Uma fonte de regras, todos os agentes.

## Usando com o Codex
O Codex lê o `AGENTS.md` automaticamente. As skills ficam em `.claude/skills/`; no Codex, peça:
"siga o procedimento de `.claude/skills/spec/SKILL.md` para a feature X". (Se quiser os comandos nativos no Codex,
copie as pastas das skills para `.agents/skills/`.)

## Custo de contexto (tokens)
- Carregados **sempre**: `AGENTS.md`, `project-overview.md`, `progress-tracker.md` → mantenha-os curtos.
- Carregados **sob demanda**: todo o resto (o Mapa de contexto no `AGENTS.md` diz à IA quando ler cada um).
- Recomendação oficial da Anthropic: cada `CLAUDE.md` com menos de ~200 linhas.

## Manutenção
- Ao fim de cada marco, peça: "revise `context/` e aponte informações desatualizadas ou contraditórias".
- Ao melhorar uma regra num projeto e gostar do resultado, leve a melhoria para o kit original em `_templates`.
- Seus padrões pessoais que valem para TODOS os projetos (idioma, estilo) podem ir em `~/.claude/CLAUDE.md`.
