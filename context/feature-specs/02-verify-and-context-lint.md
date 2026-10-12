# Spec 02 — Verify + lint do contexto

| Campo | Valor |
|---|---|
| Status | Done  <!-- Draft → Clarifying → Approved → In Progress → Done / Dropped --> |
| Nível | L2 |
| Autor | IA + Paulo |
| Criada em | 2026-10-12 |
| Aprovada em | 2026-10-12 |
| Relacionadas | ADR-0002, ADR-0003, `context/research/benchmark-2026-10.md`, specs 03 e 10 (dependem desta) |

---

## 1. Contexto e problema
Hoje o kit declara "pronto" quando a IA diz que rodou testes, lint e type check. Nada garante isso, e os documentos
de `context/` podem ficar com placeholders, links quebrados ou specs aprovadas com dúvidas abertas sem ninguém notar.
OpenAI e Anthropic mostram que o ganho real vem de **um comando que decide** se o projeto está verde, usado pela
IA, pelos hooks (spec 03) e pelo CI (spec 10). Objetivo do overview: "Pronto comprovado — 100% das tarefas com verify verde".

## 2. Histórias de usuário e critérios de aceite
### US-1: Como Paulo, quero um comando único que diga se o projeto-alvo está verde, para não depender da palavra da IA.
- **AC-1.1** — Dado um projeto-alvo com comandos de verificação configurados, quando rodo `node scripts/verify.mjs`, então cada comando roda, aparece uma linha `✔`/`✖` por etapa com o tempo, e o processo sai com 0 se todas passaram ou 1 se alguma falhou.
- **AC-1.2** — Dado que uma etapa falhou, quando o verify termina, então as demais etapas também rodaram e o resumo final lista todas as falhas com as últimas 30 linhas de saída de cada uma.
- **AC-1.3** — Dado um projeto recém-criado sem comandos configurados, quando rodo o verify, então ele roda só o lint do contexto, avisa "no verification commands configured" e sai com 0.
- **AC-1.4** — Dado qualquer execução, quando o verify termina, então grava o resultado em `.kit/last-verify.json` (data, etapas, status, duração), arquivo ignorado pelo git, para os hooks da spec 03.

### US-2: Como Paulo, quero que os documentos de `context/` sejam checados por máquina, para a IA não trabalhar sobre informação quebrada.
- **AC-2.1** — Dado uma spec com status `Approved`, `In Progress` ou `Done` que contém `{{` ou `[NEEDS CLARIFICATION`, quando rodo `node scripts/lint-context.mjs`, então sai com 1 e aponta arquivo:linha.
- **AC-2.2** — Dado uma spec `Done` com tarefa `- [ ]` desmarcada, quando rodo o lint, então é erro.
- **AC-2.3** — Dado um link Markdown relativo `[x](caminho)` para arquivo inexistente em `context/`, `AGENTS.md` ou `CLAUDE.md`, quando rodo o lint, então é erro com arquivo:linha.
- **AC-2.4** — Dado um ADR sem status válido (`Proposed`, `Accepted`, `Deprecated`, `Superseded by ADR-NNNN`) ou dois ADRs com o mesmo número, quando rodo o lint, então é erro.
- **AC-2.5** — Dado que `AGENTS.md` + `project-overview.md` + `progress-tracker.md` somam mais linhas que o limite configurado (padrão 400), quando rodo o lint, então é erro com o total.
- **AC-2.6** — Dado `{{` em arquivos fora de specs aprovadas, quando rodo o lint, então é **aviso** (não falha), exceto com `--strict`, que vira erro.
- **AC-2.7** — Dado o kit recém-copiado, sem nada preenchido, quando rodo o lint, então sai com 0 (só avisos).

### Casos de borda e erros
- Projeto sem pasta `context/` → erro claro: "context/ not found — is this a project using the kit?".
- Comando de verificação inexistente (ex.: `pnpm` não instalado) → etapa `✖` com a mensagem do sistema, não um crash.
- Caminhos com espaço e Windows (`C:\Users\...`) → funcionam.
- Arquivo de configuração com JSON inválido → erro com a linha do problema.
- Comando que nunca termina → timeout por etapa (padrão 10 min, configurável).

## 3. Fora de escopo
- Hooks do Claude Code que chamam o verify (spec 03).
- Workflow do GitHub Actions (spec 10).
- Mudanças nas skills `/implement` e `/review` para exigir o verify (entram na spec 03, junto com os hooks).
- Formatar ou corrigir automaticamente qualquer arquivo.

## 4. Esclarecimentos
| # | Pergunta | Resposta | Data |
|---|---|---|---|
| 1 | Onde ficam os comandos do verify? | `kit.config.json` na raiz, lido pelo script; §10 aponta para ele | 2026-10-12 |
| 2 | Placeholders fora de specs aprovadas: aviso ou erro? | Aviso (erro só com `--strict`) | 2026-10-12 |
| 3 | Idioma das mensagens dos scripts? | Inglês (ADR-0003) | 2026-10-12 |
| 4 | Limite de linhas sempre carregadas? | 400, configurável em `kit.config.json` | 2026-10-12 |

---

## 5. Design técnico
### Arquivos afetados
| Arquivo | Ação | O quê |
|---|---|---|
| `kit/scripts/verify.mjs` | criar | Orquestra: lint do contexto + comandos do config; resumo; exit code; grava `.kit/last-verify.json` |
| `kit/scripts/lint-context.mjs` | criar | Checagens AC-2.x; `--strict`; `--root <pasta>` |
| `kit/scripts/lib/*.mjs` | criar | Leitura de Markdown (status da spec, tarefas, links), leitura do config |
| `kit/kit.config.json` | criar | `{ "verify": [{ "name", "run", "timeoutMin" }], "contextLineBudget": 400 }` |
| `kit/context/architecture-context.md` | alterar | §10 aponta para `kit.config.json` e para `node scripts/verify.mjs` |
| `kit/context/ai-workflow-rules.md` | alterar | DoD: "`node scripts/verify.mjs` verde, saída citada no resumo" |
| `kit/starter-guide/gitignore-additions.txt` | alterar | `.kit/` |
| `tests/verify.test.mjs`, `tests/lint-context.test.mjs` | criar | Testes com `node:test` |
| `tests/fixtures/green/`, `tests/fixtures/red/` | criar | Projetos-alvo mínimos de exemplo |
| `context/architecture-context.md` (raiz) | alterar | Comandos reais deste repositório |

### Contratos
```
node scripts/verify.mjs [--root <dir>] [--only <name>] [--json]
  exit 0 = verde, 1 = vermelho, 2 = erro de uso/config
node scripts/lint-context.mjs [--root <dir>] [--strict] [--json]
  exit 0 = sem erros (avisos permitidos), 1 = erros, 2 = erro de uso
.kit/last-verify.json
  { "at": ISO-8601, "ok": bool, "steps": [{ "name", "ok", "ms", "exitCode" }] }
```

### Dados
Nenhum banco. Novo arquivo de configuração e novo arquivo de resultado ignorado pelo git.

### Interface
Saída de terminal descrita em `context/ui-context.md`.

### Alternativas consideradas
| Opção | Prós | Contras | Escolhida? |
|---|---|---|---|
| Node `.mjs` sem dependências | Multiplataforma, testes embutidos | Exige Node no projeto-alvo | ✅ (ADR-0002) |
| `Makefile` / `just` | Popular | Não vem no Windows | |
| Scripts `npm run verify` | Familiar | Exige `package.json` em projeto Python | |

## 6. Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Lint chato demais e o usuário desliga | Média | Alto | Só erro onde há certeza (specs aprovadas); resto aviso |
| Parsing de Markdown frágil | Média | Médio | Regras simples por linha; fixtures cobrindo casos reais do kit v1 |
| Diferenças de shell no Windows | Média | Médio | `child_process.spawn` com `shell: true`; teste com caminho com espaço |

## 7. Plano de testes
| Critério | Tipo de teste | Como verificar |
|---|---|---|
| AC-1.1, 1.2 | integração | Fixture com um comando que passa e um que falha; checar saída e exit code |
| AC-1.3 | integração | Fixture sem comandos |
| AC-1.4 | integração | Ler `.kit/last-verify.json` após a execução |
| AC-2.1 a 2.6 | unitário | Um arquivo de fixture por regra, verde e vermelho |
| AC-2.7 | integração | Rodar o lint sobre uma cópia de `kit/` |
| Bordas | unitário | Caminho com espaço, JSON inválido, comando inexistente, timeout |

---

## 8. Tarefas
> Pequenas, ordenadas, cada uma verificável. `[P]` = pode rodar em paralelo com a anterior.
- [x] T1 — Fixtures `green/` e `red/` + esqueleto dos testes (AC-2.7)
- [x] T2 — `lib/` de leitura de Markdown: status de spec, tarefas, links, ADRs
- [x] T3 — `lint-context.mjs` com AC-2.1 a 2.6 e testes
- [x] T4 — `kit.config.json` + leitura e validação do config [P]
- [x] T5 — `verify.mjs` com AC-1.1 a 1.4 e testes
- [x] T6 — Atualizar `architecture-context.md` §10, DoD em `ai-workflow-rules.md`, `gitignore-additions.txt`
- [x] T7 — Rodar o lint sobre `kit/` e sobre o `context/` deste repositório; registrar comandos na arquitetura da raiz

## 9. Aprovação
- [x] **Aprovado pelo humano** — Paulo, 2026-10-12

## 10. Notas de implementação
- **Desvio (T1):** em vez de pastas fixas `tests/fixtures/green|red`, os testes criam projetos-alvo temporários com `tests/helpers.mjs` (pasta com espaço no nome, cobrindo caminhos do Windows). Mais legível: cada teste mostra o arquivo que provoca a regra.
- `node --test tests/` falha no Node 22 (não aceita pasta); comando registrado com glob `"tests/*.test.mjs"`.
- Links: o lint também checa os `@imports` do `CLAUDE.md`; ignora URLs, âncoras, caminhos absolutos, links com `{{` e código inline.
- Placeholders e `[NEEDS CLARIFICATION` em código inline são ignorados (documentação *sobre* o formato); dentro de blocos ``` continuam contando.
- Specs `Dropped` não geram avisos de placeholder (ruído achado ao rodar no próprio repo; teste adicionado).
- ADR com status ainda `{{...}}` é aviso, não erro (caso do ADR-0001 no kit recém-copiado).
- A suíte leva ~60 s no Windows (spawn de shell); não usar no hook `PostToolUse` da spec 03, só no `Stop`.
- Evidência: `node kit/scripts/verify.mjs` → `✔ verify: green (3 step(s))`, 25/25 testes; kit recém-copiado: 0 erros, 107 avisos.
