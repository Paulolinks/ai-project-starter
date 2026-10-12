---
name: adopt
description: Aplica o kit de contexto a um projeto que JÁ TEM código. Audita o repositório e preenche context/ com a realidade do código, sem alterar o código. Use quando o usuário pedir adopt/auditoria de projeto existente.
argument-hint: "[foco opcional, ex.: backend]"
disable-model-invocation: true
---

# Adopt — projeto existente

Foco opcional: $ARGUMENTS

**Objetivo:** documentar o que o projeto **é** (não o que deveria ser), descobrir o que o usuário **quer** que ele seja e registrar a diferença.

## Regras
- **Somente leitura no código.** Nada de refatorar, corrigir ou formatar. Só escreva em `context/` (e em `CLAUDE.md`/`AGENTS.md` se pedido).
- Toda afirmação técnica precisa de evidência: cite o caminho do arquivo (ex.: "FastAPI — `pyproject.toml`").
- Se houver documentação antiga (README, `docs/`, `.cursor/rules`, arquivos de estratégia), leia e reaproveite — mas confirme contra o código.

## Passos
1. **Inventário:** árvore de pastas (2–3 níveis, ignorando dependências/venv/build), manifests (`package.json`, `pyproject.toml`, lockfiles), configs, CI, Dockerfiles, `.env.example`, git log recente (`git log --oneline -20`).
2. **Rodar o projeto (se seguro):** descobrir e testar os comandos de install/test/lint. Registrar o que passou e o que falhou. Não instale nada globalmente sem perguntar.
3. **Mapear arquitetura:** componentes, pontos de entrada, fluxos de dados, integrações externas, modelo de dados → `architecture-context.md` (com diagrama mermaid).
4. **Inferir padrões reais** do código existente → `code-standards.md` (marque "observado" vs "desejado").
5. **UI** (se houver) → `ui-context.md` com as telas/rotas que existem.
6. **Entrevistar o usuário** (máx. 5 perguntas por rodada) sobre: objetivo do produto, usuários, o que está funcionando, o que está quebrado, prioridades → `project-overview.md`.
7. **Diagnóstico** → `progress-tracker.md`: features existentes (status `Done`/parcial), problemas conhecidos e dívida técnica com evidência, riscos, próximos passos.
8. **ADRs retroativos** para as 2–4 decisões estruturais já tomadas (stack, banco, organização do repo) com status `Accepted`.

## Entrega
- Relatório curto: saúde do projeto (testes, lint, segurança), top 5 problemas, divergências entre documentação antiga e código, recomendação do que fazer primeiro.
- Sugira commit: `docs: add project context (adopt)`.
