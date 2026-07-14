ALTER TABLE tickets ADD COLUMN IF NOT EXISTS department VARCHAR(100) NOT NULL DEFAULT 'Não informado';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets (department);
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON tickets (closed_at);
