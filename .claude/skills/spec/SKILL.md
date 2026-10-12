---
name: spec
description: Cria ou refina a especificação de uma feature em context/feature-specs/ a partir do _TEMPLATE.md, com perguntas de esclarecimento, design técnico e tarefas. Use antes de implementar qualquer feature ou mudança de comportamento (nível L2/L3).
argument-hint: "[descrição da feature] ou [NN para refinar uma spec existente]"
disable-model-invocation: true
---

# Spec — especificar antes de codar

Pedido: $ARGUMENTS

## Passos
1. **Contexto:** leia `project-overview.md`, `architecture-context.md`, `ai-workflow-rules.md`, ADRs relevantes e o **código** que a feature vai tocar.
2. **Escopo:** confira se a feature está no escopo do MVP / não fere um não-objetivo. Se ferir, avise antes de continuar.
3. **Arquivo:** se `$ARGUMENTS` for um número, abra a spec existente. Senão, crie `context/feature-specs/NN-slug.md` (NN = próximo número livre) copiando `_TEMPLATE.md`. Status `Draft`.
4. **Parte "O QUÊ"** (seções 1–4): problema, histórias de usuário, critérios de aceite em Given/When/Then, casos de borda, fora de escopo. Desconhecidos → `[NEEDS CLARIFICATION]`.
5. **Esclarecer:** status `Clarifying`. Faça até 5 perguntas por rodada (com opções + recomendação). Registre respostas na tabela da seção 4. Repita até zerar os `[NEEDS CLARIFICATION]`.
6. **Parte "COMO"** (seções 5–8): arquivos afetados (verifique que existem), contratos, dados, UI, alternativas, riscos, plano de testes mapeando cada AC, tarefas pequenas e ordenadas.
7. **Nível L3?** Crie também o ADR correspondente (`/adr`).
8. **Checagem final** contra a Definition of Ready (`ai-workflow-rules.md` §3) e contra `AGENTS.md`. Aponte qualquer conflito.
9. Atualize a tabela "Features" do `progress-tracker.md`.

## Regras
- Não escreva código de produção nesta etapa.
- Specs descrevem comportamento observável; evite detalhes de implementação na parte "O QUÊ".
- Termine pedindo aprovação explícita: "Revise a spec NN. Posso marcar como Approved?"
