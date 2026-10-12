---
name: adr
description: Registra uma decisão de arquitetura (ADR) em context/decisions/. Use quando uma decisão técnica duradoura for tomada ou precisar ser tomada (stack, banco, biblioteca estrutural, padrão de arquitetura, mudança de decisão anterior).
argument-hint: "[decisão ou dúvida técnica]"
---

# ADR — registrar decisão de arquitetura

Tema: $ARGUMENTS

1. Liste os ADRs existentes em `context/decisions/` e verifique se o tema já foi decidido. Se sim, mostre o ADR e pergunte se é para substituí-lo.
2. Pesquise o necessário (código atual, documentação oficial com versões atuais).
3. Crie `context/decisions/NNNN-slug.md` a partir de `0000-adr-template.md` (NNNN = próximo número).
4. Apresente 2–3 opções reais com prós e contras e sua recomendação. Status `Proposed`.
5. Após a escolha do usuário: status `Accepted`, preencha decisão e consequências.
6. Se substitui outro ADR: marque o antigo como `Superseded by ADR-NNNN` (nunca apague).
7. Atualize `architecture-context.md` se a decisão muda stack, componentes ou comandos.
