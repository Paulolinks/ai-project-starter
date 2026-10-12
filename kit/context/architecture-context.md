# Architecture Context

> Lido sob demanda. Fonte da verdade sobre **como** o sistema é construído.
> Regra: só registre aqui o que é verdade no código (ou foi aprovado). Decisões e o porquê → ADRs em `decisions/`.

| Campo | Valor |
|---|---|
| Última atualização | {{AAAA-MM-DD}} |
| Estilo arquitetural | {{monólito modular / cliente-servidor / serverless / desktop / CLI / monorepo...}} |

## 1. Visão de contexto (C4 nível 1)
Quem usa o sistema e com quais sistemas externos ele conversa.

```mermaid
flowchart LR
  user([{{Usuário}}]) --> app[{{Sistema}}]
  app --> ext1[({{Serviço externo / API}})]
```

## 2. Componentes (C4 nível 2)
| Componente | Responsabilidade | Tecnologia | Pasta |
|---|---|---|---|
| {{frontend}} | {{...}} | {{...}} | `{{apps/web}}` |
| {{api}} | {{...}} | {{...}} | `{{services/api}}` |

## 3. Stack (versões fixadas)
| Camada | Tecnologia | Versão | Por quê (link ADR) |
|---|---|---|---|
| Linguagem | {{...}} | {{...}} | {{ADR-0002}} |
| Framework | {{...}} | {{...}} | |
| Banco de dados | {{...}} | {{...}} | |
| Testes | {{...}} | {{...}} | |
| Hospedagem | {{...}} | {{...}} | |

## 4. Estrutura de pastas
```
{{
/apps        → aplicações executáveis
/packages    → código compartilhado
/tests       → testes
/context     → documentação para humanos + IA
}}
```
**Regra:** novos arquivos seguem esta estrutura. Pasta nova = atualizar esta seção.

## 5. Fluxos principais de dados
1. {{ex.: Usuário envia prompt → API valida → fila → worker gera áudio → salva em storage → notifica cliente}}

## 6. Modelo de dados
| Entidade | Campos principais | Relações |
|---|---|---|
| {{...}} | {{...}} | {{...}} |

## 7. Integrações externas
| Serviço | Para quê | Autenticação | Limites/custos | Docs |
|---|---|---|---|---|
| {{...}} | {{...}} | {{env var NOME}} | {{...}} | {{link}} |

## 8. Requisitos não-funcionais
- **Performance:** {{...}}
- **Segurança:** {{autenticação, autorização, validação de entrada, OWASP Top 10}}
- **Privacidade:** {{dados pessoais, retenção, LGPD}}
- **Disponibilidade / offline:** {{...}}
- **Custo:** {{teto mensal de infra/API}}

## 9. Segredos e configuração
- Variáveis de ambiente documentadas em `.env.example` (nunca valores reais).
- Lista: {{NOME_VAR — para quê}}

## 10. Comandos
> A IA usa esta seção para rodar e verificar o projeto. Mantenha exata.
| Ação | Comando |
|---|---|
| Instalar | `{{...}}` |
| Rodar em dev | `{{...}}` |
| Testes | `{{...}}` |
| Lint / format | `{{...}}` |
| Type check | `{{...}}` |
| Build | `{{...}}` |

## 11. Ambientes e deploy
| Ambiente | URL/local | Como faz deploy |
|---|---|---|
| Dev | {{local}} | — |
| Prod | {{...}} | {{...}} |

## 12. Zonas protegidas
> Arquivos/pastas que a IA NÃO deve alterar sem pedido explícito.
- {{ex.: migrations já aplicadas, /vendor, arquivos gerados}}
