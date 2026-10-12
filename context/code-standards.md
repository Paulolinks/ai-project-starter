# Code Standards

> Lido antes de escrever ou revisar arquivos do kit. Regra de ouro: **se uma ferramenta pode verificar, a ferramenta verifica**.

## 1. Ferramentas obrigatórias
| Objetivo | Ferramenta | Config |
|---|---|---|
| Testes dos scripts | `node:test` | `tests/*.test.mjs` |
| Lint do contexto | `kit/scripts/lint-context.mjs` (spec 02) | — |
| Formatação Markdown | manual por ora; [NEEDS CLARIFICATION: adotar Prettier? exigiria Node deps] | — |

## 2. Nomes
- Arquivos: `kebab-case` (`lint-context.mjs`, `0002-stack.md`). Skills: pasta `kebab-case` com `SKILL.md`.
- JS: `camelCase` para funções e variáveis, `UPPER_SNAKE_CASE` para constantes.
- Use os termos do **Glossário** do `project-overview.md` (kit, projeto-alvo, harness, verify, perfil, lição).

## 3. Escrita dos templates (o produto)
- Cada informação mora em **um** arquivo. Duplicou = bug.
- Instruções para a IA no imperativo, curtas, verificáveis ("rode X", "pare se Y"). Evite "tente", "se possível".
- Toda regra importante deve ter, quando possível, uma **trava mecânica** (hook, script, permissão). Regra sem trava é marcada como "orientação".
- Nunca afirme que uma trava bloqueia algo que ela não bloqueia; documente o limite.
- Placeholders sempre `{{...}}`; desconhecidos sempre `[NEEDS CLARIFICATION: ...]`.
- Arquivos sempre carregados (AGENTS, overview, tracker) somados ≤ 400 linhas.

## 4. Scripts e hooks
- Node ≥ 20, ESM (`.mjs`), sem dependências npm (ADR-0002).
- Saída: uma linha por checagem, resumo final, código de saída 0/1 (hooks: seguir o protocolo de exit code 2 / JSON do Claude Code).
- Caminhos com `node:path`; nada de separador fixo `/` ou `\`.
- Falhar com mensagem acionável: o que falhou, arquivo:linha, como corrigir.

## 5. Testes
- Cada script tem teste com fixtures em `tests/fixtures/` (um projeto-alvo "verde" e um "vermelho").
- Nome descreve comportamento: `reports placeholder left in approved spec`.

## 6. Git
- Conventional Commits em inglês: `feat(kit): add verify script`, `docs(context): ...`.
- Branch por spec: `feat/NN-slug`. A IA só faz commit/push quando o Paulo pedir.

## 7. Proibido neste projeto
- Editar `../ai-project-starter/` (kit v1).
- Adicionar ferramenta externa ao kit sem ADR.
