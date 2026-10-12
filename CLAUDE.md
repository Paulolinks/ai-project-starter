# CLAUDE.md

> Ponto de entrada do Claude Code. As regras universais ficam no `AGENTS.md`
> (que também é lido por Codex, Copilot, Cursor etc.). Mantenha este arquivo curto:
> tudo que é importado aqui entra no contexto em TODA sessão.

<!-- Carregados sempre (curtos e essenciais): -->
@AGENTS.md
@context/project-overview.md
@context/progress-tracker.md

<!-- Os demais arquivos de context/ são lidos sob demanda — veja o "Mapa de contexto" no AGENTS.md. -->

## Específico do Claude Code

- Use **plan mode** (Shift+Tab) antes de qualquer mudança nível L2 ou L3 (ver `context/ai-workflow-rules.md`).
- Workflows disponíveis como skills: `/kickoff`, `/adopt`, `/spec`, `/implement`, `/review`, `/adr`, `/session-start`, `/session-end`.
- Use a lista de tarefas (todo list) para trabalhos com mais de 3 passos.
- Para buscas amplas no código, use um subagente para não poluir o contexto principal.
- Se o MCP **Context7** estiver instalado: consulte-o antes de escrever código contra APIs de bibliotecas externas.
- Se o **claude-mem** estiver instalado: ele é memória de apoio ("o que aconteceu"). A fonte da verdade continua sendo `context/`.
- Entre tarefas não relacionadas, sugira `/clear` ao usuário (depois de rodar `/session-end`).
