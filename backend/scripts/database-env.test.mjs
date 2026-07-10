import test from 'node:test';
import assert from 'node:assert/strict';
import {postgresEnvironment} from './database-env.mjs';

test('converte URL PostgreSQL em variáveis sem manter a URL nos argumentos', () => {
  const result = postgresEnvironment('postgresql://user%40corp:secret%21@db.example:5433/chamados_staging');

  assert.deepEqual(result, {
    PGHOST: 'db.example',
    PGPORT: '5433',
    PGUSER: 'user@corp',
    PGPASSWORD: 'secret!',
    PGDATABASE: 'chamados_staging',
  });
});

test('rejeita protocolo que não seja PostgreSQL', () => {
  assert.throws(() => postgresEnvironment('https://db.example/database'), /PostgreSQL inválida/i);
});
