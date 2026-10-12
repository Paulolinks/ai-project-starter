# AI Workflow Rules — protocolo de trabalho

> Como eu (humano) e a IA trabalhamos juntos. O `AGENTS.md` tem a constituição; aqui está o processo detalhado.

## 1. Níveis de mudança (cerimônia proporcional ao risco)

| Nível | Exemplos | O que é exigido |
|---|---|---|
| **L0 — Trivial** | typo, texto, renomear variável local, ajuste de estilo | Fazer direto. Mencionar no resumo. |
| **L1 — Pequena** | bug localizado em 1–2 arquivos, ajuste em feature existente sem mudar comportamento esperado | Explicar a causa + plano em 3 linhas → fazer → teste que reproduz o bug. |
| **L2 — Feature** | funcionalidade nova, mudança de comportamento, nova tela, novo endpoint | **Spec aprovada** em `feature-specs/` → plan mode → `/implement`. |
| **L3 — Estrutural** | nova dependência estrutural, mudança de stack, modelo de dados, autenticação, infraestrutura, refatoração ampla | Spec + **ADR** + aprovação explícita antes de qualquer código. |

Na dúvida entre dois níveis, use o mais alto e pergunte.

## 2. Ciclo de uma feature (L2/L3)

1. **Entender** — Ler `project-overview`, `progress-tracker`, arquivos de contexto relevantes e o código real envolvido.
2. **Especificar** (`/spec`) — Criar `feature-specs/NN-slug.md` a partir do `_TEMPLATE.md`. Tudo que for desconhecido vira `[NEEDS CLARIFICATION]`.
3. **Esclarecer** — Fazer no máximo 5 perguntas por rodada, cada uma com opções e uma recomendação. Registrar as respostas na spec.
4. **Planejar** — Preencher design técnico, riscos, plano de testes e tarefas (cada tarefa ≤ ~1 h de trabalho, verificável).
5. **✋ Aprovação** — Eu mudo o status para `Approved` (ou digo "aprovado"). Sem isso, nada de código.
6. **Implementar** (`/implement`) — Uma tarefa por vez: código → teste → rodar verificações → marcar `[x]`.
7. **Verificar** (`/review`) — Revisar o diff completo contra `code-standards.md` e os critérios de aceite.
8. **Fechar** (`/session-end`) — Atualizar spec (status `Done`), `progress-tracker.md`, ADRs; sugerir commit.

## 3. Definition of Ready (spec pode ser implementada quando…)
- [ ] Problema e objetivo claros
- [ ] Critérios de aceite testáveis (Given/When/Then)
- [ ] Fora de escopo declarado
- [ ] Nenhum `[NEEDS CLARIFICATION]` em aberto
- [ ] Arquivos afetados e riscos identificados
- [ ] Tarefas pequenas e ordenadas
- [ ] Status `Approved`

## 4. Definition of Done (tarefa/feature está pronta quando…)
- [ ] Todos os critérios de aceite atendidos e demonstrados
- [ ] Testes novos escritos e **toda** a suíte passando
- [ ] Lint, formatter e type check limpos
- [ ] Sem segredos, logs de debug ou código comentado
- [ ] Documentação/contexto atualizados (spec, progress tracker, ADR se aplicável)
- [ ] Resumo entregue: o que mudou, como verificar, o que NÃO foi testado

## 5. Regras anti-alucinação
- Não cite função, arquivo, endpoint, flag de CLI ou opção de biblioteca sem ter verificado que existe (abrindo o arquivo, rodando `--help` ou consultando a documentação/Context7).
- Ao usar uma biblioteca, confirme a **versão instalada** (lockfile/manifest) e use a API dessa versão.
- Se uma informação não está no contexto nem no código: **pergunte**. "Não sei" é uma resposta válida.
- Quando a realidade (código) contradiz a documentação (`context/`), **avise** e proponha qual corrigir. Não escolha em silêncio.
- Não declare sucesso sem evidência. Relate explicitamente o que não foi testado.

## 6. Quando PARAR e perguntar
- Requisito ambíguo ou conflitante.
- A solução exige sair do escopo aprovado ou mudar uma decisão (ADR).
- Mesmo erro após 2 tentativas de correção diferentes → pare, explique hipóteses e peça direção.
- Qualquer ação destrutiva ou irreversível.
- Custo financeiro (APIs pagas, infraestrutura).

## 7. Formato de resposta após implementar
```
✅ Feito: (o que mudou, em 2–5 bullets)
🧪 Verificação: (comandos rodados e resultado)
⚠️ Não verificado / riscos: (...)
📌 Próximo passo sugerido: (...)
```

## 8. Higiene de contexto
- Uma sessão = um objetivo. Ao trocar de assunto: `/session-end` → `/clear` → `/session-start`.
- Contexto grande? Prefira `/clear` + `/session-start` a continuar com contexto poluído.
- Mantenha `project-overview.md` e `progress-tracker.md` curtos — eles entram em toda sessão.

## 9. Protocolo de memória
| Evento | Atualizar |
|---|---|
| Tarefa concluída | Checkbox na spec + "Em andamento" no tracker |
| Feature concluída | Spec → `Done`; tracker → "Concluído" |
| Decisão técnica duradoura | Novo ADR em `decisions/` |
| Bug conhecido / dívida técnica | Seção "Problemas conhecidos" do tracker |
| Fim de sessão | "Estado atual", "Próximos passos" e "Log de sessões" do tracker |
| Mudança de stack, pastas ou comandos | `architecture-context.md` |
