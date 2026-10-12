# Spec {{NN}} — {{Título da feature}}

| Campo | Valor |
|---|---|
| Status | Draft  <!-- Draft → Clarifying → Approved → In Progress → Done / Dropped --> |
| Nível | {{L2 / L3}} |
| Autor | {{IA + nome}} |
| Criada em | {{AAAA-MM-DD}} |
| Aprovada em | {{AAAA-MM-DD — preenchido pelo humano}} |
| Relacionadas | {{specs, ADRs, issues}} |

---

## 1. Contexto e problema
{{Por que esta feature existe? Qual dor resolve? Ligação com os objetivos do project-overview.}}

## 2. Histórias de usuário e critérios de aceite
### US-1: {{Como [persona], quero [ação] para [benefício]}}
- **AC-1.1** — Dado {{contexto}}, quando {{ação}}, então {{resultado observável}}.
- **AC-1.2** — Dado {{...}}, quando {{...}}, então {{...}}.

### US-2: {{...}}
- **AC-2.1** — {{...}}

### Casos de borda e erros
- {{ex.: o que acontece se a API externa cair? entrada vazia? arquivo de 2 GB?}}

## 3. Fora de escopo
- {{O que esta spec explicitamente NÃO faz.}}

## 4. Esclarecimentos
| # | Pergunta | Resposta | Data |
|---|---|---|---|
| 1 | [NEEDS CLARIFICATION: {{...}}] | | |

---

## 5. Design técnico
### Arquivos afetados
| Arquivo | Ação | O quê |
|---|---|---|
| `{{caminho}}` | criar / alterar / remover | {{...}} |

### Contratos (APIs, funções públicas, eventos, CLI)
```
{{assinaturas, payloads de request/response, schemas}}
```

### Dados
{{Mudanças em modelo/banco/arquivos; migração necessária?}}

### Interface
{{Telas/componentes afetados; estados de loading/vazio/erro. Link para ui-context.}}

### Alternativas consideradas
| Opção | Prós | Contras | Escolhida? |
|---|---|---|---|
| {{A}} | | | ✅ |
| {{B}} | | | |

## 6. Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| {{...}} | | | |

## 7. Plano de testes
| Critério | Tipo de teste | Como verificar |
|---|---|---|
| AC-1.1 | unitário / integração / e2e / manual | {{...}} |

---

## 8. Tarefas
> Pequenas (≤ ~1 h), ordenadas, cada uma verificável. Marque `[x]` ao concluir.
- [ ] T1 — {{...}} (AC-1.1)
- [ ] T2 — {{...}}
- [ ] T3 — Testes de {{...}}
- [ ] T4 — Atualizar documentação/contexto

## 9. Aprovação
- [ ] **Aprovado pelo humano** — {{nome, data}}

## 10. Notas de implementação
> Preenchido durante `/implement`: desvios do plano, descobertas, decisões tomadas.
- {{...}}
