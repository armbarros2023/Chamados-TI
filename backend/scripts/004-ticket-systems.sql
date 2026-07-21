ALTER TABLE tickets ADD COLUMN IF NOT EXISTS system VARCHAR(50);

UPDATE tickets
SET system = 'Não classificado'
WHERE system IS NULL;

ALTER TABLE tickets
  ALTER COLUMN system SET DEFAULT 'Não classificado',
  ALTER COLUMN system SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_system_allowed'
  ) THEN
    ALTER TABLE tickets
      ADD CONSTRAINT tickets_system_allowed
      CHECK (system IN ('AceData', 'Computador', 'Fluig', 'Internet', 'Protheus', 'WebMail', 'Windows 11', 'Não classificado'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_system_closed_at ON tickets (system, closed_at DESC);
