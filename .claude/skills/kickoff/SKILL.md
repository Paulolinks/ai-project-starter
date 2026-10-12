---
name: kickoff
description: Inicia um projeto NOVO do zero, entrevistando o usuário em rodadas e preenchendo os arquivos de context/. Use quando o usuário pedir kickoff, "vamos começar o projeto", ou quando context/ ainda estiver cheio de placeholders {{...}} e não houver código.
argument-hint: "[ideia do projeto em uma frase]"
disable-model-invocation: true
---

# Kickoff — projeto novo

Ideia inicial do usuário: $ARGUMENTS

**Objetivo:** sair desta sessão com `context/` preenchido e revisado, sem escrever nenhum código de produto.

## Regras
- NÃO escreva código, não instale nada, não crie a estrutura do app. Só documentos de `context/`.
- Pergunte em **rodadas de no máximo 5 perguntas**. Para cada pergunta ofereça 2–4 opções e marque sua recomendação. Aceite "não sei / você decide" — então decida, justifique e registre como suposição.
- Depois de cada rodada, **escreva** no arquivo correspondente e mostre um resumo do que foi preenchido.
- O que continuar desconhecido vira `[NEEDS CLARIFICATION: ...]`, nunca invenção.
- Remova os placeholders `{{...}}` à medida que preencher. Seção que não se aplica: escreva "N/A" com o motivo.

## Rodadas
1. **Visão** → `project-overview.md` §1–3: pitch, problema, alternativas atuais, usuários.
2. **Escopo** → §4–7: objetivos e métricas, **não-objetivos**, MVP em MoSCoW, jornadas principais. Empurre o usuário a cortar escopo: MVP pequeno.
3. **Restrições e domínio** → §8–9: prazo, orçamento, plataformas, aspectos legais, glossário.
4. **Stack e arquitetura** → `architecture-context.md`: proponha **2 opções** de stack com prós/contras para o perfil do projeto (verifique versões atuais na documentação oficial; não chute). Após a escolha: preencha componentes, estrutura de pastas, integrações, requisitos não-funcionais e **comandos**. Crie `decisions/0002-stack.md` a partir do template de ADR.
5. **Interface** → `ui-context.md`: plataforma, princípios de UX, mapa de telas, fluxos, acessibilidade, tom de voz. (Sem UI: "N/A — sem UI" e descreva a experiência de uso.)
6. **Padrões** → `code-standards.md`: preencha ferramentas e convenções coerentes com a stack escolhida (proponha padrões consagrados da comunidade daquela linguagem; o usuário só confirma).
7. **Plano** → `progress-tracker.md`: roadmap em marcos (M0 fundação, M1 MVP...), lista de specs a escrever, próximos 3 passos. Preencha a data no ADR-0001.

## Encerramento
- Rode uma checagem: liste quaisquer `{{` ou `[NEEDS CLARIFICATION` restantes em `context/`.
- Verifique contradições entre arquivos (ex.: plataforma no overview ≠ stack na arquitetura).
- Entregue: resumo de 10 linhas do projeto + lista de pendências + recomendação da primeira spec (geralmente `01-design-system` se houver UI, ou `02-project-skeleton`).
- Sugira commit: `docs: initialize project context`.
