# Dokvera — estado atual e o que falta

## Sobre o histórico: está tudo cá

Verifiquei o repositório: as tuas alterações externas do VS Code **estão presentes**. Os últimos commits incluem:

- `078a283` — 31/08/26 (rosariocustodio) — `src/lib/document-specs.ts`
- `2418b20` — 31/08/26 (rosariocustodio) — `countries.ts`, `dokvera.ts`, `documents.new.tsx`, `settings.tsx`, `reset-password.tsx`, migração `add_profile_country`

A árvore de trabalho está limpa (sem ficheiros por sincronizar). Nada será começado de zero — vou continuar sobre este código.

## Diagnóstico do que já funciona

- Autenticação (email + Google), reset de password, rota protegida `_authenticated`.
- Base de dados: `profiles`, `credits` (numérico), `documents`, `document_events`, `credit_transactions`, `credit_orders`, RPC `spend_credits` / `refund_credits`.
- Criação de documentos: seletor por categorias, formulários dinâmicos por tipo, campo de instruções, motor de preços determinístico (`src/lib/pricing.ts`).
- Geração real com IA no servidor, com débito e devolução de créditos em caso de erro.
- Exportação PDF e DOCX reais no cliente, já ligadas à página do documento.
- Dashboard, histórico, definições, página de créditos com pacotes e economia visível.

## O que falta para dar por concluído

1. **Ações do documento** — na página do documento faltam: editar conteúdo e guardar, duplicar, eliminar (com confirmação). Ficam ligadas aos estados `draft/generating/ready/error` e registam evento em `document_events`.
2. **Compra de créditos** — hoje mostra "pagamentos em breve". Fecho o fluxo em modo M-Pesa/e-Mola manual: o utilizador cria um pedido (`credit_orders`) com pacote ou quantidade avulsa, recebe instruções de pagamento e referência, e um painel de administração confirma o pedido e credita via transação atómica. Provedor automático pode entrar depois sem mexer no resto.
3. **Painel de administração de pedidos** — tabela de papéis (`user_roles` + função `has_role`) e rota de admin para aprovar/rejeitar pedidos de crédito. Sem isto, ninguém pode creditar em segurança.
4. **Qualidade de saída** — revisão do prompt e do esqueleto (capa, contracapa, índice, objetivos, referências) para que o documento gerado respeite exatamente as opções escolhidas e o número de páginas pedido.
5. **Metadados e publicação** — título/descrição próprios por página (landing, auth, dashboard, créditos, documentos) e publicação para o URL ao vivo. O `vercel.json` na raiz é de outro tipo de app e não se aplica a este projeto — removo-o para não induzir erros de 404 em deploys externos.
6. **Polimento final** — verificação móvel/desktop, estados de loading/erro/sucesso e confirmação de que nenhum botão fica sem função.

## Detalhes técnicos

- Ações de documento: novo `src/lib/documents.functions.ts` estendido com `updateDocument`, `duplicateDocument`, `deleteDocument` (server functions autenticadas), invalidação de queries no cliente.
- Créditos: migração com `user_roles`/`app_role`/`has_role`, políticas RLS e GRANTs; RPC `approve_credit_order` (`security definer`) que credita e escreve em `credit_transactions` numa só transação.
- Admin: rota `src/routes/_authenticated/admin.credits.tsx`, visível só com papel `admin`.
- Sem simulação de APIs: o pagamento manual é um fluxo real de confirmação humana, não um mock.
- Ordem de trabalho: (1) ações do documento, (2) papéis + pedidos/aprovação de créditos, (3) qualidade da geração, (4) metadados + publicação.
