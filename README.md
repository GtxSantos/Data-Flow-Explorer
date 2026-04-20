# Data Flow Explorer (S-ETL Pipeline) 🚀

Este projeto é uma solução completa de pipeline **ETL (Extract, Transform, Load)** desenvolvida para automatizar a geração de mensagens financeiras personalizadas. A aplicação utiliza uma arquitetura moderna de monorepo, focada em escalabilidade, tipagem forte e separação de responsabilidades.

## 📋 Visão Geral do Projeto

O sistema simula o fluxo de dados de um banco, onde informações de usuários são extraídas, processadas por uma Inteligência Artificial (OpenAI) para gerar conselhos financeiros personalizados e, por fim, carregadas de volta em um banco de dados para consulta.

### O Fluxo ETL:
1.  **Extração (Extract):** Recupera perfis de usuários e seus dados financeiros.
2.  **Transformação (Transform):** Envia os dados para a IA gerar insights personalizados baseados em saldo e conta.
3.  **Carga (Load):** Salva os resultados enriquecidos no banco de dados e atualiza o dashboard.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, Shadcn UI, TanStack Query.
- **Backend:** Node.js, Express, TypeScript.
- **Banco de Dados:** Drizzle ORM (PostgreSQL/SQLite).
- **API:** Especificação OpenAPI com geração automática de contratos via Zod.
- **IA:** Integração com OpenAI para processamento de linguagem natural.
- **Gestão de Pacotes:** pnpm Workspaces.

## 📂 Estrutura do Repositório

O projeto é organizado como um monorepo para facilitar o compartilhamento de lógica:

- **`artifacts/`**: Aplicações finais.
  - `api-server`: Servidor backend que gerencia a lógica de negócio e rotas.
  - `etl-pipeline`: Dashboard frontend interativo para controle do pipeline.
- **`lib/`**: Bibliotecas compartilhadas.
  - `api-spec`: Contrato da API em YAML (OpenAPI).
  - `db`: Esquemas de banco de dados e migrações.
  - `integrations`: Módulos de conexão com serviços externos (OpenAI).
- **`scripts/`**: Utilitários para automação e build.

## ✨ Funcionalidades principais

- **Dashboard de Controle:** Visualize métricas de execuções do pipeline e atividade recente.
- **Gestão de Usuários:** Interface CRUD completa para gerenciar os perfis que entrarão no pipeline.
- **Histórico de IA:** Seção dedicada para visualizar todas as mensagens geradas pela inteligência artificial.
- **Monitoramento de Saúde:** Rotas de health check para garantir que o sistema esteja operante.

## 🚀 Como Executar

1.  **Instale as dependências:**
    ```bash
    pnpm install
    ```
2.  **Configure o Ambiente:**
    Crie um arquivo `.env` com sua `OPENAI_API_KEY` e configurações de banco de dados.
3.  **Inicie o projeto:**
    ```bash
    pnpm dev
    ```

---
Desenvolvido como um projeto de portfólio para demonstrar habilidades em Engenharia de Software e Ciência de Dados.
