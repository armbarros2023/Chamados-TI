import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import dotenv from 'dotenv';
import {postgresEnvironment} from './database-env.mjs';

process.umask(0o077);
dotenv.config({path: process.env.ENV_FILE || resolve(process.cwd(), '.env')});

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL não está definida.');

const backupDir = resolve(process.env.BACKUP_DIR || resolve(process.cwd(), '..', 'backups'));
mkdirSync(backupDir, {recursive: true, mode: 0o700});

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const finalPath = resolve(backupDir, `chamados-ti-${timestamp}.dump`);
const temporaryPath = `${finalPath}.partial`;
const result = spawnSync('pg_dump', [
  '--format=custom',
  '--no-owner',
  '--no-privileges',
  '--file', temporaryPath,
], {
  env: {...process.env, ...postgresEnvironment(databaseUrl)},
  stdio: ['ignore', 'inherit', 'inherit'],
});

if (result.status !== 0) {
  if (existsSync(temporaryPath)) rmSync(temporaryPath);
  throw new Error(`pg_dump falhou com código ${result.status ?? 'desconhecido'}.`);
}
renameSync(temporaryPath, finalPath);

const checksum = createHash('sha256').update(readFileSync(finalPath)).digest('hex');
writeFileSync(`${finalPath}.sha256`, `${checksum}  ${basename(finalPath)}\n`, {mode: 0o600});
console.log(finalPath);
