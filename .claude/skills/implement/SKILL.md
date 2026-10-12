---
name: implement
description: Implementa uma spec com status Approved, tarefa por tarefa, com testes e verificação a cada passo. Use quando o usuário pedir para implementar uma spec aprovada.
argument-hint: "[NN da spec] [opcional: T3 para começar numa tarefa]"
disable-model-invocation: true
---

# Implement — executar uma spec aprovada

Spec: $ARGUMENTS

## Pré-condições (pare se alguma falhar)
- A spec existe e está `Approved` (ou o usuário disse "aprovado" nesta sessão — então atualize o status).
- Não há `[NEEDS CLARIFICATION]` em aberto.
- Árvore git limpa ou o usuário sabe das mudanças pendentes (`git status`). Sugira criar a branch `feat/NN-slug`.

## Loop por tarefa
1. Marque a spec como `In Progress` (primeira tarefa) e anuncie: "Tarefa Tn: ...".
2. Abra e leia os arquivos envolvidos antes de editar.
3. Implemente **só** essa tarefa, seguindo `code-standards.md`.
4. Escreva/atualize os testes ligados aos critérios de aceite da tarefa.
5. Rode as verificações (comandos em `architecture-context.md` §10): testes, lint, type check.
6. Passou → marque `[x]` na spec. Falhou → corrija; após 2 tentativas diferentes sem sucesso, **pare** e relate hipóteses.
7. Desvio do plano (arquivo diferente, abordagem nova, dependência extra)? **Pare**, explique e peça aprovação; registre em "Notas de implementação".

## Ao final de todas as tarefas
- Rode a suíte completa.
- Verifique cada critério de aceite e diga como foi demonstrado.
- Rode o checklist da Definition of Done (`ai-workflow-rules.md` §4).
- Sugira `/review` e depois `/session-end`.
- Responda no formato de `ai-workflow-rules.md` §7.
