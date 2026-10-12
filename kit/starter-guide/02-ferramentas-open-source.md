# Ferramentas open source — o que instalar (e o que NÃO instalar)

> Pesquisado em outubro de 2026. Essas ferramentas mudam rápido: confira o README oficial antes de instalar.

## Princípio
**Não instale tudo.** Cada ferramenta de memória/spec injeta instruções próprias. Várias juntas = instruções
contraditórias, documentos duplicados e mais tokens gastos por sessão. O kit já resolve 80% com Markdown versionado;
as ferramentas abaixo cobrem os 20% restantes.

| Camada | Problema que resolve | Já resolvido pelo kit | Ferramenta recomendada |
|---|---|---|---|
| Regras do projeto | IA não sabe as regras | ✅ `AGENTS.md` + `CLAUDE.md` | — |
| Memória de decisões | IA esquece por que fizemos X | ✅ ADRs + tracker | — |
| Spec antes do código | IA alucina requisitos | ✅ `/spec` + `/implement` | Spec Kit (opcional, features grandes) |
| Memória automática de sessões | "o que fizemos semana passada?" | parcial (`/session-end`) | **claude-mem** |
| Docs atualizadas de bibliotecas | IA usa API antiga/inventada | parcial (regra anti-alucinação) | **Context7** |
| Navegação em código grande | IA lê arquivos inteiros, se perde | — | Serena (opcional) |

---

## 🥇 Nível 0 — já vem no Claude Code (zero instalação)
- **CLAUDE.md + imports `@arquivo`**: o que o kit usa.
- **Auto memory**: o Claude Code anota sozinho suas correções e preferências por repositório. Veja/edite com `/memory`.
- **Plan mode** (Shift+Tab): a IA planeja sem editar arquivos.
- **Skills** (`.claude/skills/`): os comandos `/kickoff`, `/spec` etc. do kit.
- **`.claude/rules/`** com `paths:` no frontmatter: regras que só carregam ao mexer em certos arquivos
  (ex.: regras de React só para `**/*.tsx`). Use quando o `code-standards.md` ficar grande.

## 🥈 Nível 1 — recomendado instalar

### claude-mem — memória automática entre sessões
- **Repo:** https://github.com/thedotmack/claude-mem — licença Apache-2.0, dados locais (SQLite).
- **O que faz:** captura o que acontece nas sessões, resume com IA e injeta o contexto relevante quando você abre uma sessão nova. Tem busca no histórico.
- **Instalar (dentro do Claude Code):**
  ```
  /plugin marketplace add thedotmack/claude-mem
  /plugin install claude-mem
  ```
  Depois reinicie o Claude Code. Requer Node.js 20+ (Bun e uv são instalados automaticamente).
  Alternativa: `npx claude-mem install`. (Não use `npm install -g claude-mem` — isso instala só a biblioteca.)
- **Privacidade:** conteúdo entre `<private>...</private>` não é armazenado.
- **Como convive com o kit:** claude-mem = "o que aconteceu" (recall). `context/` = "o que é verdade" (fonte oficial, revisada, no git). Se divergirem, `context/` vence.

### Context7 — documentação atualizada de bibliotecas
- **Repo:** https://github.com/upstash/context7
- **O que faz:** busca a documentação da versão certa de uma biblioteca e entrega para a IA. É o melhor remédio contra "a IA inventou um parâmetro que não existe" ou "usou a API de 2 versões atrás".
- **Instalar:** `npx ctx7 setup --claude` (faz login, gera a chave e configura). Chave gratuita recomendada para limites maiores.
- **Uso:** o `CLAUDE.md` do kit já manda a IA consultar o Context7 antes de usar APIs externas.

## 🥉 Nível 2 — opcional, conforme o projeto

### GitHub Spec Kit — Spec-Driven Development formal (o "Specify" que você usava)
- **Repo:** https://github.com/github/spec-kit — docs: https://github.github.io/spec-kit/
- **Mudanças recentes importantes:** a CLI agora usa `--integration` (antes era `--ai`) e os comandos são `/speckit-*` com hífen (antes `/speckit.*` com ponto).
- **Instalar (Windows):**
  ```powershell
  # 1) uv (se ainda não tiver)
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  # 2) Spec Kit
  uv tool install specify-cli
  # 3) Projeto novo
  specify init meu-projeto --integration claude
  ```
  Para projeto já existente, siga o guia "existing project" da documentação.
- **Fluxo:** `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` → `/speckit-converge` (repita implement/converge até "Converged").
- **Quando usar no lugar do `/spec` do kit:** features grandes, com muitas tarefas e várias sessões de implementação.
- **Como integrar sem duplicar:**
  1. No `/speckit-constitution`, diga: "baseie a constituição no `AGENTS.md` e em `context/`; não contradiga".
  2. Escolha **um** lugar para specs: ou `context/feature-specs/` (kit) ou `specs/` (Spec Kit). Se escolher o Spec Kit, atualize a linha das specs no Mapa de contexto do `AGENTS.md`.

### Serena — navegação semântica de código (projetos grandes)
- **Repo:** https://github.com/oraios/serena
- **O que faz:** dá à IA ferramentas de IDE (achar símbolo, referências, editar função específica) via language servers, economizando tokens em bases grandes.
- **Instalar:** `uv tool install -p 3.13 serena-agent` → `serena init` → configurar no Claude Code seguindo
  https://oraios.github.io/serena/02-usage/030_clients.html (o README avisa que comandos antigos de marketplace estão desatualizados).
- **Quando:** a partir de dezenas de milhares de linhas. Em projeto pequeno, é peso extra.

---

## Outras que eu avaliei (e por que não estão no padrão)

| Ferramenta | O que é | Por que não é padrão |
|---|---|---|
| **OpenSpec** | Specs com foco em "mudanças propostas" sobre um sistema existente | Ótima ideia, mas sobrepõe `/spec` + Spec Kit. Considere para projetos legados grandes. |
| **BMAD Method** | Agentes por papel (analista, PM, arquiteto, dev) | Pesado para projetos individuais; muitos documentos. |
| **Cline Memory Bank** | Padrão de 6 arquivos de memória | Não é ferramenta, é um padrão — e já está incorporado no kit (overview + tracker + arquitetura). |
| **Basic Memory** | Base de conhecimento em Markdown via MCP | Útil para notas pessoais entre projetos; não necessário por projeto. |
| **Mem0 / OpenMemory** | Infra de memória para apps/agentes | Mais útil para construir produtos com memória do que para codar. |
| **Servidor MCP "memory" de referência** | Grafo de conhecimento simples local | Básico; claude-mem é mais completo para Claude Code. |

## Ordem sugerida de adoção
1. Use o kit puro em 1 projeto por 1–2 semanas.
2. Adicione **Context7** (ganho imediato, quase sem custo).
3. Adicione **claude-mem** se sentir falta de "lembrar o que conversamos".
4. Experimente **Spec Kit** numa feature grande.
5. **Serena** só quando o código ficar grande.
