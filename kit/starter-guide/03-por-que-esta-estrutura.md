# Por que esta estrutura — de onde vêm as práticas

Cada arquivo do kit é a versão "para IA" de uma prática consagrada em empresas grandes de software.
A ideia não é burocracia: é que a IA, como um engenheiro novo no time, precisa do mesmo onboarding que um humano.

| Prática na indústria | Onde se usa | No kit |
|---|---|---|
| **PRD** (Product Requirements Document) e o "Working Backwards" / PR-FAQ | Times de produto em geral; a Amazon escreve o comunicado de imprensa e o FAQ antes de construir | `project-overview.md` (problema, usuário, objetivos, **não-objetivos**, MVP) |
| **Design Docs** | Cultura de engenharia do Google: documento com contexto, objetivos, não-objetivos, design e alternativas antes de codar | Seção "COMO" das specs + `architecture-context.md` |
| **RFCs** (Request for Comments) | Uber, Stripe, comunidades open source: proposta revisada antes da implementação | Fluxo `Draft → Clarifying → Approved` das specs |
| **ADRs** (Architecture Decision Records, Michael Nygard) | Recomendado por AWS, GOV.UK, ThoughtWorks Tech Radar | `context/decisions/` |
| **Modelo C4** (Simon Brown) | Diagramas de arquitetura em níveis (contexto, containers, componentes) | Seções 1–2 de `architecture-context.md` |
| **Definition of Ready / Done** | Scrum / times ágeis | `ai-workflow-rules.md` §3–4 |
| **Critérios de aceite Given/When/Then** (BDD) | Times ágeis, testes de aceitação | Specs, seção 2 |
| **Code review com mudanças pequenas** | Google Engineering Practices ("small CLs") | `/review` + regra "mudanças pequenas" |
| **Conventional Commits** | Padrão aberto amplamente adotado | `code-standards.md` §9 |
| **Design system com tokens** | Material (Google), Polaris (Shopify), Primer (GitHub) | `feature-specs/01-design-system.md` |
| **Runbooks / onboarding docs** | SRE, onboarding de engenheiros | `progress-tracker.md` + `/session-start` |
| **Spec-Driven Development** | GitHub Spec Kit, Kiro (AWS), OpenSpec | `/spec` → aprovação → `/implement` |
| **Memory Bank** | Comunidade Cline/Cursor | overview + tracker + arquitetura, atualizados pelo `/session-end` |

## O que melhorei em relação à resposta do ChatGPT (PDF)

A resposta do ChatGPT acertou o diagnóstico (contexto + specs + memória) e as ferramentas, mas parou na proposta.
Diferenças deste kit:

1. **Pronto para uso, não só uma árvore de pastas.** Todos os arquivos têm template preenchível, e 8 workflows
   executáveis (`/kickoff`, `/adopt`, `/spec`, `/implement`, `/review`, `/adr`, `/session-start`, `/session-end`).
2. **Corrige uma armadilha técnica:** o Claude Code ignora o `AGENTS.md` quando existe `CLAUDE.md`. O kit resolve com
   `@AGENTS.md` dentro do `CLAUDE.md` — uma única fonte de regras para Claude e Codex.
3. **Menos arquivos, sem duplicação.** O ChatGPT propôs `CONSTITUTION.md` + `AGENTS.md` (mesma coisa),
   `TECH_STACK.md` + `ARCHITECTURE.md` (mesma coisa), `activeContext` + `progress` + `knownIssues` (três arquivos para
   o mesmo assunto). Aqui cada informação tem um único lugar.
4. **Estratégia de tokens.** Só 3 arquivos curtos carregam sempre; o resto é lido sob demanda via "Mapa de contexto".
5. **Cerimônia proporcional (L0–L3).** Typo não precisa de spec; troca de banco precisa de spec + ADR.
   Sem isso, o processo vira burocracia e você abandona em uma semana.
6. **Travas de verdade, não só pedidos.** Texto no `CLAUDE.md` é orientação; o `.claude/settings.json` **bloqueia**
   leitura de `.env`, `rm -rf`, `push --force` e pede confirmação para commit e instalação de pacotes.
7. **Informação atualizada:** Spec Kit mudou para `--integration claude` e `/speckit-*`; claude-mem agora é plugin
   oficial do marketplace; Context7 tem setup em um comando.
8. **Modo projeto existente (`/adopt`)** que documenta a realidade do código, com evidência por arquivo, antes de planejar.

## Limites (honestidade)
Nada disso elimina alucinações — reduz muito. A proteção real é a combinação:
**contexto escrito + IA lendo o código real + testes + sua revisão + aprovação antes de implementar.**
