# Spec 01 — Design System

| Campo | Valor |
|---|---|
| Status | Draft |
| Nível | L2 |
| Criada em | {{AAAA-MM-DD}} |
| Relacionadas | `context/ui-context.md` |

> Primeira spec de todo projeto com interface: define a linguagem visual ANTES das telas,
> para a IA não inventar uma cor ou um espaçamento diferente em cada componente.
> Projeto sem UI? Marque esta spec como `Dropped`.

## 1. Objetivo
Criar uma fonte única de tokens visuais e componentes base, implementada em código
(ex.: variáveis CSS / tema Tailwind / theme object), que todas as telas devem usar.

## 2. Personalidade visual
- 3 adjetivos: {{ex.: escuro, preciso, energético}}
- Referências: {{links / prints}}
- Modo: {{claro / escuro / ambos}}

## 3. Tokens
### Cores (semânticas, não literais)
| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-bg` | {{#FFFFFF}} | {{#0B0B0F}} | fundo da página |
| `--color-surface` | | | cards, painéis |
| `--color-text` | | | texto principal |
| `--color-text-muted` | | | texto secundário |
| `--color-primary` | | | ação principal |
| `--color-primary-fg` | | | texto sobre primary |
| `--color-border` | | | bordas, divisores |
| `--color-success` / `--color-warning` / `--color-danger` | | | estados |

### Tipografia
| Token | Fonte | Tamanho / altura de linha | Peso |
|---|---|---|---|
| `display` | {{...}} | {{36/44}} | {{700}} |
| `h1` / `h2` / `h3` | | | |
| `body` | | {{16/24}} | {{400}} |
| `small` / `caption` | | | |
| `mono` | | | |

### Espaçamento, raio, sombra, movimento
- Escala de espaçamento (base {{4px}}): {{4, 8, 12, 16, 24, 32, 48, 64}}
- Raio: {{sm 4 / md 8 / lg 16 / full}}
- Sombras: {{sm / md / lg}}
- Duração de animação: {{150ms ui / 300ms transições}}; respeitar `prefers-reduced-motion`.

## 4. Componentes base (com todos os estados)
| Componente | Variantes | Estados |
|---|---|---|
| Button | primary, secondary, ghost, danger | default, hover, focus, active, disabled, loading |
| Input / Select / Textarea | — | default, focus, error, disabled |
| Card | — | — |
| Modal / Dialog | — | aberto, fechando |
| Toast | success, error, info | — |
| {{específico do domínio, ex.: Waveform, Knob, Slider}} | | |

## 5. Critérios de aceite
- **AC-1** — Dado qualquer componente, quando inspecionado, então só usa tokens (zero cor/tamanho literal fora do arquivo de tokens).
- **AC-2** — Dado o modo escuro ativo, quando a página carrega, então todos os componentes base trocam de tema sem ajuste manual.
- **AC-3** — Todo texto passa contraste WCAG AA (4.5:1).
- **AC-4** — Existe uma página/rota de showcase listando todos os componentes e estados.

## 6. Fora de escopo
- Telas de produto (cada uma terá sua spec).

## 7. Esclarecimentos
| # | Pergunta | Resposta |
|---|---|---|
| 1 | [NEEDS CLARIFICATION: biblioteca de componentes — usar uma pronta (ex.: shadcn/ui) ou do zero?] | |

## 8. Tarefas
- [ ] T1 — Arquivo de tokens ({{caminho}})
- [ ] T2 — Configurar tema claro/escuro
- [ ] T3 — Componentes base
- [ ] T4 — Página de showcase
- [ ] T5 — Lint/regra que impede cores literais (se viável)

## 9. Aprovação
- [ ] **Aprovado pelo humano** — {{nome, data}}
