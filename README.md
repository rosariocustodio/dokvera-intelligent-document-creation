# Dokvera: Intelligent Document Creation

Quero que cries a fundação completa e o MVP para o SaaS "Dokvera", sob a empresa-mãe "Ruqzora".

1. DESIGN E IDENTIDADE VISUAL — Estilo Notion + XPay

A interface do Dokvera deve ser absolutamente deslumbrante, limpa, minimalista e premium.

Usa tipografia Inter / Plus Jakarta Sans, gradientes subtis, cartões com bordas suaves, efeitos de glassmorphism moderados e micro-animações fluidas.

O design deve transmitir a sensação de uma plataforma SaaS moderna, sofisticada e profissional, combinando produtividade, tecnologia e simplicidade.

Suporta perfeitamente Dark Mode e Light Mode.

A identidade visual deve ser própria do Dokvera, sem copiar literalmente qualquer outra plataforma.

A marca Ruqzora deve aparecer apenas de forma discreta como empresa-mãe, por exemplo no rodapé ou em elementos institucionais:

Dokvera by Ruqzora

2. LANDING PAGE

Cria uma Landing Page de alta conversão na rota principal (/) para o Dokvera, contendo:

Hero section forte com o título "Dokvera"

Subtítulo explicando que o Dokvera ajuda a criar, organizar e preparar documentos académicos e profissionais com tecnologia de IA.

Botões de chamada para ação:

"Começar Agora"

"Entrar com o Google"

Secções de benefícios

Secção "Como funciona"

Tipos de documentos

Tabela de preços de créditos

Exemplo: 1 crédito = 55 MT

Botão visível para "Login/Cadastro com Google"

A Landing Page deve deixar claro que o Dokvera não é apenas um gerador de texto, mas uma plataforma para criação e organização de documentos.

3. AUTENTICAÇÃO E BASE DE DADOS — Supabase

Configura a autenticação integrada utilizando Supabase Auth com:

Login com Google

Cadastro/login

Logout

Proteção das rotas privadas

Define as tabelas essenciais na base de dados:

profiles

Para dados do utilizador.

credits

Para gerir o saldo de créditos.

documents

Para guardar os documentos criados pelo utilizador.

Aplica regras estritas de Row Level Security (RLS) para garantir que cada utilizador só consiga aceder aos seus próprios dados.

Estrutura o código de forma que seja fácil adicionar posteriormente outras tabelas, como:

credit_transactions

document_versions

students

references

generated_files

subscriptions

Não é necessário implementar essas tabelas adicionais agora se não forem essenciais ao MVP, mas a arquitetura deve permitir adicioná-las posteriormente sem necessidade de reconstruir a aplicação.

4. DASHBOARD E SALDO DE CRÉDITOS

Após o login, redireciona automaticamente o utilizador para:

/dashboard

O Dashboard deve conter:

Saldo atual de créditos em destaque.

Exemplo: 32 créditos

Equivalente monetário calculado automaticamente.

Exemplo: 32 créditos = 1.760 MT, considerando 1 crédito = 55 MT.

O cálculo deve ser feito pelo código, não pela IA.

Cria um menu lateral limpo, moderno e responsivo com atalhos para:

Dashboard

Criar Documento

Meus Documentos

Histórico

Créditos

Configurações

Inclui uma listagem visual de:

Documentos Recentes

Cada documento deve apresentar informações relevantes, como:

Nome/título

Tipo

Data de criação

Última atualização

Estado

5. FLUXO INICIAL DE CRIAÇÃO DE DOCUMENTOS

Cria um botão visível:

"+ Criar novo documento"

Ao clicar, abre um modal ou página para escolher o tipo de documento.

Inclui inicialmente opções como:

Trabalho Académico

Trabalho Escolar

CV

Relatório

Resumo

Requerimento

Outro Documento

O sistema deve ser preparado para adicionar novos tipos posteriormente.

Implementa a lógica visual e estrutural onde o código verifica o saldo de créditos antes de permitir avançar.

O sistema deve:

Verificar o saldo atual.

Identificar o custo da operação.

Mostrar claramente o custo ao utilizador.

Impedir a continuação caso os créditos sejam insuficientes.

Apresentar uma opção para adquirir mais créditos.

Não utilizar IA para cálculos financeiros.

Todos os cálculos de créditos, preços, custos e saldo devem ser controlados pelo código/backend.

6. ARQUITETURA DO CÓDIGO

Garante que o código seja:

Limpo

Modular

Organizado

Manutenível

Responsivo

Baseado em componentes React reutilizáveis

Preparado para futuras integrações com APIs externas

A arquitetura deve permitir posteriormente adicionar:

API de IA

Geração real de documentos

DOCX

PDF

Capa

Contracapa

Índice automático

Objetivo geral

Objetivos específicos

Referências bibliográficas

Formatação académica

OCR/Scanner

Sistema avançado de créditos

Pagamentos

Sistema de subscrição

Importante: neste momento, prioriza a fundação sólida e funcional do MVP. Não tente implementar funcionalidades avançadas apenas para aumentar a quantidade de código.

O resultado deve parecer um produto SaaS real e profissional, e não um protótipo genérico.

A marca principal é:

Dokvera

A empresa-mãe é:

Ruqzora

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/082e3069-4371-4634-b1cd-5ddbdc8b9914).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
