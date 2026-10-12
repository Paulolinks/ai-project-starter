---
name: review
description: Revisa as mudanças atuais (git diff) contra a spec, code-standards e regras de segurança antes do commit. Use antes de commitar ou quando o usuário pedir revisão de código.
argument-hint: "[opcional: branch ou commit base, padrão = mudanças não commitadas]"
disable-model-invocation: true
---

# Review — revisão antes do commit

Base: $ARGUMENTS (se vazio, revise `git diff` + `git diff --staged` + arquivos não rastreados relevantes)

Revise como um engenheiro sênior exigente. Para cada achado: arquivo:linha, severidade (🔴 bloqueia / 🟡 deveria corrigir / 🔵 sugestão), problema e correção proposta.

## Checklist
1. **Correção:** atende aos critérios de aceite da spec? Casos de borda e erros tratados?
2. **Escopo:** alguma mudança fora do que a spec pedia? Arquivos alterados sem motivo?
3. **Testes:** cada comportamento novo tem teste? Os testes realmente falhariam se o código estivesse errado?
4. **Padrões:** nomes, estrutura, tamanho de funções, tipagem, tratamento de erros (`code-standards.md`).
5. **Segurança:** segredos, entrada não validada, injeção, permissões, dados sensíveis em logs.
6. **Simplicidade:** código duplicado, abstração desnecessária, código morto, debug esquecido.
7. **Performance:** loops com I/O, consultas N+1, carregamento de arquivos grandes em memória.
8. **Documentação:** `context/` e README coerentes com a mudança?

## Regras
- Não corrija nada automaticamente: liste os achados e pergunte quais aplicar.
- Termine com veredito: ✅ pronto para commit / ⚠️ commit após correções 🔴 / ❌ precisa repensar.
- Se pronto, proponha a mensagem de commit em Conventional Commits.
