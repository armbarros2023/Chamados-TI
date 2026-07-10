CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    requester JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by JSONB,
    attachment_url TEXT,
    unread_by_admin BOOLEAN DEFAULT FALSE,
    unread_by_requester BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    author JSONB NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_ticket
        FOREIGN KEY(ticket_id) 
        REFERENCES tickets(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Usuário')), -- <-- ALTERADO AQUI
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS requester_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_requester_user_id ON tickets (requester_user_id);
UPDATE tickets t SET requester_user_id = u.id
FROM users u
WHERE t.requester_user_id IS NULL AND t.created_by->>'username' = u.username;
SELECT setval('ticket_number_seq', GREATEST(COALESCE((SELECT MAX(NULLIF(regexp_replace(ticket_number, '\D', '', 'g'), '')::BIGINT) FROM tickets), 0), 1), true);

CREATE TABLE IF NOT EXISTS refresh_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id ON refresh_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_expires_at ON refresh_sessions (expires_at);

-- Adicionando comentários para documentação da tabela e colunas
COMMENT ON TABLE users IS 'Armazena as informações dos usuários do sistema (usuários, administradores, etc).';
COMMENT ON COLUMN users.id IS 'ID único do usuário (UUID).';
COMMENT ON COLUMN users.username IS 'Nome de login único para o usuário.';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário.';
COMMENT ON COLUMN users.email IS 'Endereço de e-mail único do usuário.';
COMMENT ON COLUMN users.role IS 'Função do usuário no sistema. Atualmente: Administrador ou Usuário.'; -- <-- ALTERADO AQUI
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário, gerado com bcrypt.';
COMMENT ON COLUMN users.avatar_url IS 'Caminho para a imagem de avatar do usuário.';
COMMENT ON COLUMN users.created_at IS 'Data e hora em que o usuário foi cadastrado.';

-- Criando um índice na coluna de username para otimizar as buscas de login
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

COMMENT ON COLUMN comments.ticket_id IS 'ID do ticket ao qual este comentário pertence.';
COMMENT ON COLUMN comments.author IS 'JSON object com dados do autor (name, role, avatarUrl).';

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments (ticket_id);

COMMENT ON COLUMN tickets.id IS 'ID único para o chamado, gerado pela aplicação.';
COMMENT ON COLUMN tickets.ticket_number IS 'Número sequencial ou formatado do chamado.';
COMMENT ON COLUMN tickets.requester IS 'JSON object contendo informações do solicitante (name, role, email, avatar).';
COMMENT ON COLUMN tickets.created_by IS 'Usuário que criou o chamado, armazenando um objeto como { "username": "...", "name": "..." }';

CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_requester_name ON tickets ((requester->>'name'));
