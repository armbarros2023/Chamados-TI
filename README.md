# Chemisch Suporte - Sistema de Helpdesk

Este é um sistema de helpdesk completo, construído com o objetivo de fornecer uma solução robusta e escalável para gerenciamento de tickets de suporte. A aplicação é dividida em um frontend moderno e reativo e um backend poderoso e seguro.

## Visão Geral da Arquitetura

O projeto segue uma arquitetura cliente-servidor:

-   **Frontend:** Uma Single Page Application (SPA) construída com React, utilizando Vite para um desenvolvimento rápido e eficiente.
-   **Backend:** Uma API RESTful desenvolvida com Node.js e Express, utilizando TypeScript para garantir um código mais seguro e manutenível.
-   **Banco de Dados:** Utiliza PostgreSQL para persistência dos dados.

## Funcionalidades

-   **Autenticação de Usuários:** Sistema de login seguro com JSON Web Tokens (JWT).
-   **Gerenciamento de Tickets:** Crie, visualize, atualize e delete tickets de suporte.
-   **Comentários:** Adicione comentários aos tickets para facilitar a comunicação.
-   **Notificações por Email:** Envio de emails para notificar sobre novos tickets e atualizações.
-   **Gerenciamento de Usuários:** Crie, edite e remova usuários do sistema.
-   **Upload de Arquivos:** Anexe arquivos aos tickets e atualize o avatar do usuário.

## Tecnologias Utilizadas

### Frontend

-   **React:** Biblioteca para construção de interfaces de usuário.
-   **Vite:** Ferramenta de build para desenvolvimento frontend moderno.
-   **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
-   **React Router:** Para gerenciamento de rotas na aplicação.

### Backend

-   **Node.js:** Ambiente de execução para JavaScript no servidor.
-   **Express:** Framework para construção de APIs RESTful.
-   **TypeScript:** Para um desenvolvimento mais robusto e seguro.
-   **PostgreSQL:** Banco de dados relacional.
-   **pg:** Driver do PostgreSQL para Node.js.
-   **JWT (jsonwebtoken):** Para autenticação baseada em tokens.
-   **Bcrypt:** Para hash de senhas.
-   **Nodemailer:** Para envio de emails.
-   **Multer:** Para upload de arquivos.

## Como Iniciar o Projeto

Siga os passos abaixo para configurar e rodar a aplicação em seu ambiente de desenvolvimento.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/)
-   [PostgreSQL](https://www.postgresql.org/)

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd <nome-do-repositorio>
```

### 2. Configurar o Backend

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Crie o arquivo `.env` a partir do exemplo:
    ```bash
    cp .env.example .env
    ```

4.  Edite o arquivo `.env` com as suas configurações:
    -   `DATABASE_URL`: A URL de conexão do seu banco de dados PostgreSQL.
    -   `JWT_SECRET`: Uma chave secreta para a geração de tokens JWT.
    -   Configure as variáveis de email (`SMTP_HOST`, `SMTP_PORT`, etc.).

5.  Execute as migrações do banco de dados. Você pode usar um cliente de banco de dados para executar o script em `scripts/001-create-tickets-table.sql`.

6.  Inicie o servidor de desenvolvimento do backend:
    ```bash
    npm run dev
    ```

### 3. Configurar o Frontend

1.  Em outro terminal, navegue até a raiz do projeto (se você estiver na pasta `backend`, use `cd ..`).

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Crie o arquivo `.env` a partir do exemplo:
    ```bash
    cp .env.example .env
    ```

4.  Edite o arquivo `.env` se o seu backend estiver rodando em uma porta diferente da padrão (`3002`).

5.  Inicie o servidor de desenvolvimento do frontend:
    ```bash
    npm run dev
    ```

A aplicação frontend estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

## Scripts Disponíveis

### Backend

-   `npm run dev`: Inicia o servidor em modo de desenvolvimento com watch.
-   `npm run build`: Compila o código TypeScript para JavaScript.
-   `npm run start`: Inicia o servidor em modo de produção (requer build prévio).

### Frontend

-   `npm run dev`: Inicia o servidor de desenvolvimento do Vite.
-   `npm run build`: Gera a build de produção da aplicação.
```
