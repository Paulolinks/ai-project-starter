# UI Context

> Lido antes de qualquer trabalho de interface. Projeto sem interface (API, CLI, biblioteca)?
> Escreva "N/A — sem UI" no topo e descreva apenas a experiência de uso (comandos, mensagens de erro, saída).
> Tokens visuais (cores, tipografia, espaçamento) ficam em `feature-specs/01-design-system.md`.

| Campo | Valor |
|---|---|
| Plataforma | {{web / desktop / mobile / plugin de DAW / CLI}} |
| Dispositivos-alvo | {{desktop primeiro / mobile primeiro}} |
| Biblioteca de componentes | {{shadcn/ui, MUI, Tailwind, nativa...}} |
| Referências visuais | {{links, prints em /context/assets}} |

## 1. Princípios de UX (3 a 5)
1. {{ex.: "Do prompt ao som em 1 clique" — a ação principal sempre visível}}
2. {{ex.: feedback imediato em toda ação (< 100 ms)}}
3. {{...}}

## 2. Mapa de telas
| Tela / rota | Objetivo | Persona | Componentes principais | Spec |
|---|---|---|---|---|
| {{/}} | {{...}} | {{...}} | {{...}} | {{...}} |

## 3. Fluxos principais
```mermaid
flowchart LR
  A[{{Tela inicial}}] --> B[{{Ação}}] --> C[{{Resultado}}]
```

## 4. Estados obrigatórios de toda tela/componente
- **Carregando** (skeleton/spinner) · **Vazio** (com chamada para ação) · **Erro** (mensagem útil + como resolver) · **Sucesso**
- Ações destrutivas pedem confirmação; ações longas mostram progresso e podem ser canceladas.

## 5. Layout e responsividade
- Breakpoints: {{sm 640 / md 768 / lg 1024 / xl 1280}}
- Grid/espaçamento: ver design system.

## 6. Acessibilidade (meta: WCAG 2.2 AA)
- Contraste mínimo 4.5:1 para texto.
- Tudo operável por teclado, com foco visível.
- Labels em todos os campos; `alt` em imagens; não usar só cor para transmitir informação.

## 7. Conteúdo e tom de voz
- Idioma(s): {{pt-BR / en}} — {{i18n desde o início? sim/não}}
- Tom: {{ex.: direto, amigável, sem jargão técnico}}
- Padrão de mensagens de erro: {{o que aconteceu + o que fazer}}

## 8. Não fazer
- {{ex.: modais em cascata; carrosséis automáticos; texto em imagem}}
