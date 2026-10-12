# UI Context

> **N/A — sem UI.** O kit é usado por linha de comando e pelo chat do agente.

## Experiência de uso
- **Entrada:** comandos `/kickoff`, `/spec`, `/implement`... no Claude Code; no Codex, "siga `.claude/skills/<nome>/SKILL.md`" (ou skills nativas após a spec 09).
- **Scripts:** `node scripts/verify.mjs` e `node scripts/lint-context.mjs` imprimem uma linha por checagem (`✔`/`✖`), um resumo final e saem com código 0 (verde) ou 1 (vermelho).
- **Mensagens de erro:** sempre "o que falhou + arquivo:linha + como corrigir".
- **Idioma:** mensagens ao usuário em pt-BR; nomes de arquivos, flags e código em inglês.
- **Perguntas da IA:** no máximo 5 por rodada, cada uma com opções e recomendação marcada.
