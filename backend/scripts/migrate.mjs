import {existsSync} from 'node:fs';
import {extname, resolve, sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import dotenv from 'dotenv';
import {postgresEnvironment} from './database-env.mjs';

dotenv.config({path: process.env.ENV_FILE || resolve(process.cwd(), '.env')});

const input = process.argv[2];
if (!input) throw new Error('Informe uma migration SQL em backend/scripts/.');
const scriptsDirectory = `${resolve(process.cwd(), 'scripts')}${sep}`;
const migrationPath = resolve(input);
if (!migrationPath.startsWith(scriptsDirectory) || extname(migrationPath) !== '.sql' || !existsSync(migrationPath)) {
  throw new Error('Migration inválida ou fora de backend/scripts/.');
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não está definida.');

const result = spawnSync('psql', ['--set', 'ON_ERROR_STOP=1', '--file', migrationPath], {
  env: {...process.env, ...postgresEnvironment(process.env.DATABASE_URL)},
  stdio: 'inherit',
});
if (result.status !== 0) throw new Error(`Migration falhou com código ${result.status ?? 'desconhecido'}.`);
console.log(`Migration aplicada: ${migrationPath}`);
