# ADR-0002: Scripts e hooks do kit em Node.js sem dependências

| Campo | Valor |
|---|---|
| Status | Accepted |
| Data | 2026-10-12 |
| Decisores | Paulo (+ IA como consultora) |

## Contexto
O kit v2 precisa de scripts (`verify`, lint do contexto, sync de skills) e de hooks do Claude Code que rodem igual
no Windows do Paulo, no macOS/Linux e no CI. A máquina tem Node 22, Python 3.11 e Git Bash; não tem `pwsh`.
Claude Code no Windows executa hooks pelo Git Bash.

## Opções consideradas
1. **Node.js `.mjs`, só stdlib** — prós: multiplataforma, já exigido por claude-mem/Context7, `node:test` embutido, JSON nativo / contras: projetos-alvo em Python precisam ter Node instalado.
2. **Python 3, só stdlib** — prós: multiplataforma, legível / contras: no Windows o comando varia (`python` vs `python3` vs `py`), o que quebra hooks.
3. **Bash + PowerShell duplicados** — prós: zero runtime extra / contras: duas implementações para manter; `pwsh` ausente.

## Decisão
Opção 1, aprovada pelo Paulo em 2026-10-12. Ferramentas externas (Spec Kit, Context7, claude-mem, Superpowers, Copier) continuam como integrações opcionais; só os scripts do próprio kit ficam sem pacotes npm. Scripts e hooks em Node ≥ 20, sem pacotes npm. Cada script tem teste com `node:test`.
O `verify` só **orquestra**: os comandos reais de cada projeto-alvo continuam em `architecture-context.md` §10.

## Consequências
- ✅ Uma implementação para todos os sistemas e para o CI.
- ⚠️ Projetos-alvo sem Node precisam instalá-lo (documentar no guia).
- 🔁 Revisitar se algum agente suportado não conseguir executar Node em hooks.
