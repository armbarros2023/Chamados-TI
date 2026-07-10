import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import dotenv from 'dotenv';
import {postgresEnvironment} from './database-env.mjs';

dotenv.config({path: process.env.ENV_FILE || resolve(process.cwd(), '.env.staging')});

const backupPath = resolve(process.argv[2] || '');
if (!process.argv[2] || !existsSync(backupPath)) throw new Error('Informe um arquivo .dump existente.');
if (process.env.CONFIRM_RESTORE !== 'staging') throw new Error('Defina CONFIRM_RESTORE=staging para autorizar a restauração.');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL de staging não está definida.');
if (process.env.NODE_ENV !== 'staging') throw new Error('Restauração permitida somente com NODE_ENV=staging.');

const result = spawnSync('pg_restore', [
  '--clean',
  '--if-exists',
  '--no-owner',
  '--no-privileges',
  '--exit-on-error',
  backupPath,
], {env: {...process.env, ...postgresEnvironment(process.env.DATABASE_URL)}, stdio: 'inherit'});

if (result.status !== 0) throw new Error(`Restauração falhou com código ${result.status ?? 'desconhecido'}.`);
console.log('Restauração de staging concluída.');
