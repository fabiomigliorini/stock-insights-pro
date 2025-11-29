# Stock Insights Pro

Ferramenta de consolidação e análise de vendas, estoque e predições de vendas. Permite visualizar dados individualmente por SKU e por classe, além de sugerir quantidades mínimas e máximas de estoque por filial e CD para cada item.

## 🚀 Stack Tecnológica

- *React* + *TypeScript* + *Vite* 
- *React Router* 
- *Tailwind CSS*
- *React Context API* - Gerenciamento de estado

## 📋 Pré-requisitos

- Node.js 18+
- npm ou bun

## 🛠️ Instalação Rápida

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev


Acesse `http://localhost:8080`

## 📜 Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Executa o linter
- `npm run preview` - Preview do build

## 🎯 Funcionalidades

- *Importação de Excel* - Upload de base de dados
- *Dashboard* - KPIs, gráficos e visão geral
- *Gestão de Produtos* - Listagem, busca e análise detalhada por produto
- *Análise de Demanda* - Analise geral de demanda
- *Gestão de Filiais* - Estatísticas por localização

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── pages/          # Páginas/rotas da aplicação
├── contexts/       # Estado global (Auth, Data)
├── lib/            # Utilitários e lógica de negócio
├── hooks/          # Hooks customizados
└── integrations/   # Integrações externas (Supabase)
```

## 🔧 Decisões Técnicas

*Objetivo*: Prototipação rápida e validação com cliente através de testes de usabilidade e experiência.

*Justificativas*:

- *React + TypeScript + Vite*: Desenvolvimento rápido com hot reload e type-safety
- *Lovable*: Plataforma de prototipação para testes iterativos e validação com cliente
- *Supabase*: Backend como serviço para facilitar deploy sem gerenciar infraestrutura
- *Tailwind CSS*: Estilização e componentes prontos para acelerar desenvolvimento
- *Build simplificado*: Deploy fácil em plataformas estáticas (Vercel, Netlify) para testes rápidos
- *Importação de Excel*: Validação imediata de dados reais e requisitos analíticos com o cliente