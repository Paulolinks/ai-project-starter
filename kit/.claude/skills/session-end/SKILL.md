---
name: session-end
description: Fecha a sessão salvando a memória do projeto - atualiza progress-tracker, specs, ADRs e problemas conhecidos, e propõe a mensagem de commit. Use ao terminar um bloco de trabalho, antes de /clear ou quando o usuário disser que vai parar.
disable-model-invocation: true
---

# Session end — salvar a memória

1. Revise o que aconteceu nesta sessão (conversa + `git diff --stat` + `git status`).
2. Atualize, seguindo o protocolo de memória (`ai-workflow-rules.md` §9):
   - **Spec ativa:** checkboxes, status, "Notas de implementação".
   - **`progress-tracker.md`:** Estado atual, Próximos passos (em ordem), Features, Bloqueios, Problemas conhecidos, nova entrada no topo do Log de sessões (Feito / Decidido / Pendente).
   - **ADR** se alguma decisão duradoura foi tomada.
   - **`architecture-context.md`** se mudou stack, pastas, comandos ou integrações.
3. Se o Log de sessões tiver mais de 5 entradas, mova as mais antigas para `context/archive/AAAA-MM.md`.
4. Mantenha `progress-tracker.md` e `project-overview.md` curtos (eles carregam em toda sessão).
5. Mostre um resumo das atualizações feitas nos arquivos de contexto.
6. Proponha a mensagem de commit (Conventional Commits) cobrindo código + contexto. **Não faça o commit sem o usuário pedir.**
