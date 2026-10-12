# ADR-0001: Registrar decisões de arquitetura e trabalhar com contexto versionado

| Campo | Valor |
|---|---|
| Status | Accepted |
| Data | 2026-10-12 |
| Decisores | Paulo |

## Contexto
O projeto é desenvolvido em par com agentes de IA que começam cada sessão sem memória.
Sem registro, decisões são esquecidas, reabertas ou contraditas, e a IA tende a inventar requisitos.

## Opções consideradas
1. **Só conversa** — rápido, mas o conhecimento se perde entre sessões.
2. **Ferramenta de memória automática apenas** — ajuda a lembrar "o que aconteceu", mas não é revisada nem versionada.
3. **Contexto em Markdown versionado no git + ADRs + specs** (com memória automática opcional como apoio).

## Decisão
Opção 3. A pasta `context/` é a fonte da verdade; `AGENTS.md` define as regras; decisões duradouras viram ADRs
neste diretório, numerados sequencialmente e nunca apagados (uma decisão revertida recebe status `Superseded`).

## Consequências
- ✅ Qualquer agente (Claude Code, Codex, Cursor) e qualquer pessoa entende o projeto lendo os arquivos.
- ✅ Histórico de decisões auditável pelo git.
- ⚠️ Exige disciplina de atualização (automatizada pelo `/session-end`).
