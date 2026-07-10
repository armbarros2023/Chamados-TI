import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const input = process.argv[2];
if (!input) throw new Error('Informe o arquivo .dump: npm run backup:verify -- <arquivo>.');

const backupPath = resolve(input);
const checksumPath = `${backupPath}.sha256`;
if (!existsSync(backupPath) || !existsSync(checksumPath)) throw new Error('Backup ou checksum não encontrado.');

const expected = readFileSync(checksumPath, 'utf8').trim().split(/\s+/)[0];
const actual = createHash('sha256').update(readFileSync(backupPath)).digest('hex');
if (expected !== actual) throw new Error('Checksum inválido; o backup pode estar corrompido.');

const result = spawnSync('pg_restore', ['--list', backupPath], {stdio: ['ignore', 'ignore', 'inherit']});
if (result.status !== 0) throw new Error('pg_restore não conseguiu ler o catálogo do backup.');
console.log('Backup íntegro e catálogo legível.');
