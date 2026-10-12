# ADR-0003: Kit bilíngue (inglês + português)

| Campo | Valor |
|---|---|
| Status | Accepted |
| Data | 2026-10-12 |
| Decisores | Paulo (+ IA como consultora) |

## Contexto
O kit será público (MIT) e deve servir a quem fala só inglês, mas o Paulo trabalha em português.
A regra do kit é "cada informação mora em um único lugar": duas cópias de cada template tendem a divergir.

## Opções consideradas
1. **Templates e skills em inglês; idioma da conversa configurável; guia e README nos dois idiomas** — prós: uma
   única fonte para o que a IA lê; inglês é o idioma em que os modelos seguem instruções com mais precisão; o
   usuário escolhe no `/kickoff` o idioma em que a IA conversa e preenche `context/` / contras: o Paulo lê os
   templates em inglês.
2. **Duas cópias completas (`kit/en`, `kit/pt-BR`)** — prós: tudo no idioma nativo / contras: dobra a manutenção;
   cópias divergem; cada melhoria precisa ser feita duas vezes.
3. **Só pt-BR** — prós: zero trabalho / contras: exclui quem não fala português.

## Decisão
Opção 1, aprovada pelo Paulo em 2026-10-12. O `/kickoff` pergunta o idioma e grava em `AGENTS.md`
("Converse e escreva `context/` em: pt-BR"). Código, commits e nomes de arquivos seguem em inglês.

## Consequências
- ✅ Uma fonte de verdade; qualquer pessoa usa o kit.
- ⚠️ Tradução do guia precisa acompanhar cada versão (checagem no lint: mesmas seções nos dois idiomas).
- 🔁 Revisitar se usuários pedirem templates nativos em português.
