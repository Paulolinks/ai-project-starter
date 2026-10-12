# Spec 03 — Hooks do Claude Code + travas honestas

| Campo | Valor |
|---|---|
| Status | Done  <!-- Draft → Clarifying → Approved → In Progress → Done / Dropped --> |
| Nível | L2 |
| Autor | IA + Paulo |
| Criada em | 2026-10-12 |
| Aprovada em | 2026-10-12 |
| Relacionadas | Spec 02 (verify), ADR-0002, `context/research/benchmark-2026-10.md` |

---

## 1. Contexto e problema
O `.claude/settings.json` do kit só tem permissões. Nada impede a IA de encerrar o turno com o projeto vermelho,
e o guia afirma que o `.env` está bloqueado quando, pela documentação do Claude Code, `Read(./.env)` não cobre
`cat .env` no Bash e regras `Bash(rm -rf:*)` são por prefixo e contornáveis. Os hooks do Claude Code
(`Stop`, `PostToolUse`, `SessionStart`, `PreToolUse`) permitem transformar regras escritas em travas executadas.

## 2. Histórias de usuário e critérios de aceite
### US-1: Como Paulo, quero que a IA não consiga encerrar um turno com o projeto vermelho.
- **AC-1.1** — Dado que arquivos do projeto mudaram desde o último verify, quando a IA tenta encerrar o turno, então o hook `Stop` roda `scripts/verify.mjs`; se vermelho, bloqueia o fim do turno e devolve à IA as etapas que falharam.
- **AC-1.2** — Dado que o hook já bloqueou 2 vezes seguidas no mesmo pedido (`stop_hook_active` verdadeiro) e o verify continua vermelho, quando a IA tenta encerrar pela 3ª vez, então o hook deixa encerrar e mostra ao usuário um aviso com as etapas vermelhas (sem loop infinito). Desde o 1º bloqueio, a IA é instruída a dizer ao usuário o que não conseguiu corrigir.
- **AC-1.3** — Dado que nada mudou desde o último verify verde, quando a IA encerra o turno, então o hook sai em < 1 s sem rodar o verify.

### US-2: Como Paulo, quero feedback rápido a cada edição.
- **AC-2.1** — Dado comandos em `"onEdit"` no `kit.config.json` (ex.: formatter), quando a IA edita ou cria um arquivo, então o hook `PostToolUse` roda esses comandos só para aquele arquivo e, se falharem, devolve a saída à IA como contexto.
- **AC-2.2** — Dado `"onEdit"` vazio (padrão), quando a IA edita, então o hook não faz nada.

### US-3: Como agente, quero começar cada sessão sabendo onde estamos sem depender de lembrar de rodar `/session-start`.
- **AC-3.1** — Dado o início de uma sessão, quando o Claude Code abre, então o hook `SessionStart` injeta: branch e `git status` resumido, data e resultado do último verify, e a seção "Estado atual" do tracker (máx. 40 linhas no total).

### US-4: Como Paulo, quero travas reais contra segredos e comandos destrutivos, documentadas com seus limites.
- **AC-4.1** — Dado um comando Bash/PowerShell que cita `.env` (exceto `.env.example`), `*.pem`, `*.key` ou `secrets/`, quando a IA tenta rodá-lo, então o hook `PreToolUse` nega com o motivo.
- **AC-4.2** — Dado `rm -rf`, `git push --force`/`-f`, `git reset --hard`, `git clean -f`, `DROP DATABASE`/`DROP TABLE` ou `Remove-Item -Recurse -Force`, quando a IA tenta rodar, então o hook nega e diz que só o usuário pode autorizar.
- **AC-4.3** — Dado um `Edit`/`Write` em arquivo listado em "Zonas protegidas" (`"protectedPaths"` no `kit.config.json`), quando a IA tenta editar, então o hook pede confirmação (`ask`).
- **AC-4.4** — O `settings.json` passa a negar também `Edit`/`Write` em `.env*`, `*.pem`, `*.key`, `secrets/**`.
- **AC-4.5** — O guia deixa de dizer "bloqueia" e explica as três camadas (permissões, hooks, sandbox) e o que cada uma não cobre; recomenda ativar o sandbox em WSL/macOS/Linux.

### Casos de borda e erros
- Projeto sem git → `SessionStart` e o detector de mudanças do `Stop` funcionam sem git (comparam data de modificação com `.kit/last-verify.json`).
- Node ausente → hooks falham com mensagem clara e não travam o Claude Code.
- Caminhos do Windows com `\` → normalizados antes de comparar.
- Comando ofuscado (ex.: `c''at .e''nv`) → **não** garantido; documentado como limite (por isso o sandbox).

## 3. Fora de escopo
- Hooks equivalentes no Codex e no Cursor (spec 09). Para eles, a garantia continua sendo a DoD + CI (spec 10).
- Subagentes revisor/verificador (spec 06).
- Rodar testes por arquivo editado (depende de cada stack; fica para `onEdit` configurado pelo usuário).

## 4. Esclarecimentos
| # | Pergunta | Resposta | Data |
|---|---|---|---|
| 1 | Verify falha no fim do turno: bloquear ou avisar? | Bloquear e mandar corrigir, no máximo 2 vezes seguidas; na 3ª, deixar encerrar e avisar o usuário (`systemMessage`) | 2026-10-12 |
| 2 | Rodar o verify no fim do turno sempre ou só com mudanças? | Só quando arquivos mudaram desde o último verify | 2026-10-12 |
| 3 | Comandos destrutivos: negar ou pedir confirmação? | Negar sempre; o usuário roda ele mesmo | 2026-10-12 |
| 4 | Formato do registro dos hooks no Windows | Exec form da doc oficial: `"command": "node"`, `"args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/x.mjs"]` — sem shell, igual em todos os sistemas | 2026-10-12 |

---

## 5. Design técnico
### Arquivos afetados
| Arquivo | Ação | O quê |
|---|---|---|
| `kit/.claude/hooks/stop-verify.mjs` | criar | AC-1.x; usa `verify()` da spec 02 |
| `kit/.claude/hooks/post-edit.mjs` | criar | AC-2.x |
| `kit/.claude/hooks/session-start.mjs` | criar | AC-3.1 |
| `kit/.claude/hooks/guard.mjs` | criar | AC-4.1–4.3 (PreToolUse para `Bash|PowerShell` e `Edit|Write`) |
| `kit/.claude/hooks/lib/io.mjs` | criar | Ler JSON do stdin, responder no formato do Claude Code |
| `kit/.claude/settings.json` | alterar | Registrar hooks (`node` + `${CLAUDE_PROJECT_DIR}`), denies de `Edit`/`Write` |
| `kit/kit.config.json` | alterar | `"onEdit": []`, `"protectedPaths": []` |
| `kit/scripts/lib/config.mjs` | alterar | Validar os novos campos |
| `kit/starter-guide/03-*.md`, `01-*.md` | alterar | AC-4.5; seção "Travas e seus limites" |
| `kit/context/architecture-context.md` §12 | alterar | Apontar zonas protegidas para `protectedPaths` |
| `tests/hooks.test.mjs` | criar | Simular o Claude Code: JSON no stdin, conferir saída e exit code |

### Contratos (protocolo de hooks do Claude Code)
```
Stop         stdin: { stop_hook_active, last_assistant_message, cwd, ... }
             bloquear: stdout { "decision": "block", "reason": "<etapas que falharam>" }
PostToolUse  stdin: { tool_name, tool_input: { file_path } }
             feedback: { "hookSpecificOutput": { "hookEventName": "PostToolUse", "additionalContext": "..." } }
SessionStart stdout: { "hookSpecificOutput": { "hookEventName": "SessionStart", "additionalContext": "..." } }
PreToolUse   stdin: { tool_name, tool_input: { command | file_path } }
             negar: { "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..." } }
```
Registro em exec form (esclarecimento 4): sem shell, `${CLAUDE_PROJECT_DIR}` substituído pelo Claude Code e também exportado como variável de ambiente.

### Alternativas consideradas
| Opção | Prós | Contras | Escolhida? |
|---|---|---|---|
| Hooks em Node (ADR-0002) | Um código para Windows/mac/Linux | Exige Node | ✅ |
| Hooks em bash + PowerShell | Sem Node | Duas implementações | |
| Hook `Stop` baseado em prompt (LLM julga) | Flexível | Não determinístico; custa tokens | |

## 6. Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Hook `Stop` deixa o chat lento | Média | Alto | Só roda com mudanças (AC-1.3); limite de 2 bloqueios |
| Falso positivo no guard (ex.: falar de `.env.example`) | Média | Médio | Lista de exceções; testes com casos reais |
| Formato de hooks muda no Claude Code | Baixa | Médio | Testes de contrato; versão mínima no guia |

## 7. Plano de testes
| Critério | Tipo de teste | Como verificar |
|---|---|---|
| AC-1.1–1.3 | integração | Projeto temporário com verify verde/vermelho; enviar JSON do `Stop` no stdin |
| AC-2.x | integração | `onEdit` com comando que falha e que passa |
| AC-3.1 | integração | Projeto com e sem git; checar limite de 40 linhas |
| AC-4.1–4.3 | unitário | Tabela de comandos permitidos/negados, incluindo PowerShell e caminhos Windows |
| AC-4.4–4.5 | manual + lint | Ler o settings e o guia; rodar o lint |
| Ponta a ponta | manual | Abrir o Claude Code num projeto de teste e provocar cada hook |

---

## 8. Tarefas
- [x] T1 — `lib/io.mjs` + testes de contrato do protocolo
- [x] T2 — `guard.mjs` (AC-4.1–4.3) + tabela de testes
- [x] T3 — `stop-verify.mjs` (AC-1.x) [P com T2]
- [x] T4 — `post-edit.mjs` (AC-2.x) [P com T2]
- [x] T5 — `session-start.mjs` (AC-3.1) [P com T2]
- [x] T6 — `settings.json` + `kit.config.json` + validação no `config.mjs`
- [x] T7 — Guia: travas e limites, sandbox (AC-4.5)
- [x] T8 — Teste ponta a ponta no Claude Code real; registrar evidência

## 9. Aprovação
- [x] **Aprovado pelo humano** — Paulo, 2026-10-12

## 10. Notas de implementação
- Hooks registrados em exec form (`"command": "node"` + `args`), sem shell: igual no Windows, macOS e Linux.
- `guard` cobre `Bash|PowerShell|Edit|Write|MultiEdit|NotebookEdit`. `git push --force-with-lease` é permitido de propósito (é a forma segura).
- Deny de `.env` no settings lista os arquivos um a um (`.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`) para não bloquear `.env.example`.
- `stop-verify` guarda o estado em `.kit/stop-state.json`; a impressão digital usa `git status` + `git diff` (ou data/tamanho dos arquivos sem git) e ignora `.kit/`.
- Desvio menor: na AC-1.2, o aviso final usa `systemMessage` (aparece para o usuário) em vez de pedir à IA, porque depois que o turno acaba a IA não fala mais. O motivo do bloqueio já manda a IA relatar o que não conseguiu corrigir.
- Hooks nunca derrubam a sessão: erro inesperado vira aviso e o hook sai com 0.
- Evidência: 17 testes de hooks + 25 da spec 02 = 42/42; `node kit/scripts/verify.mjs` → `✔ verify: green (3 step(s))`.
- **T8 — ponta a ponta no Claude Code real (2.1.295, headless `claude -p`, Windows/Git Bash)**, projeto `Desktopi-project-starter	este-hooks-v2` (verify vermelho de propósito, `.env` falso, `LICENSE` em `protectedPaths`):
  1. SessionStart: a IA repetiu "Git: repository has no commits yet" e "Last verify: RED (tests)" do contexto injetado. ✔
  2. `cat .env` com Bash liberado: negado com "Blocked by the project kit: this command touches .env files…". ✔
  3. Criar `notas.txt`: o Stop bloqueou ("attempt 1 of 2"); a IA rodou o verify, achou a causa e **recusou burlar o teste**, explicando ao usuário o que ainda falha. ✔
  4. `Write` no `LICENSE`: o hook pediu confirmação ("protected path…"); sem confirmação, o arquivo ficou intacto. ✔
- Custo do teste: ~US$ 0,35 (a maior parte numa primeira rodada com o modelo padrão; as demais com Haiku).
