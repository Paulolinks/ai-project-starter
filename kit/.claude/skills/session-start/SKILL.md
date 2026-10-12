---
name: session-start
description: Retoma o trabalho no início de uma sessão - lê o progress tracker, o estado do git e a spec ativa e resume onde paramos e o próximo passo. Use no começo de cada sessão ou após /clear.
disable-model-invocation: true
---

# Session start — onde paramos?

1. Leia `context/progress-tracker.md` (estado atual, próximos passos, bloqueios).
2. Rode `git status` e `git log --oneline -10`. Verifique se há mudanças não commitadas ou commits que o tracker não menciona.
3. Se houver spec ativa, abra-a e veja quais tarefas faltam.
4. Se o tracker estiver desatualizado em relação ao git, aponte a diferença.

Responda em no máximo 10 linhas:
```
📍 Onde estamos: ...
✅ Última coisa feita: ...
🚧 Pendências/bloqueios: ...
👉 Próximo passo proposto: ... (nível L0–L3)
```
Pergunte: "Seguimos com isso ou quer fazer outra coisa?" — não comece a implementar antes da resposta.
