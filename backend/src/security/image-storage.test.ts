import {afterEach, describe, expect, it} from 'vitest';
import {mkdtemp, readFile, rm, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {deletePrivateAttachment, writeAttachment, writeOptimizedImage} from './image-storage.js';

let directory = '';
afterEach(async () => directory && rm(directory, {recursive: true, force: true}));

describe('writeOptimizedImage', () => {
  it('decodifica e regrava a imagem em formato seguro', async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'chamados-image-'));
    const source = await sharp({create: {width: 20, height: 20, channels: 3, background: '#ffffff'}}).png().toBuffer();
    const filename = await writeOptimizedImage(source, 'image/png', directory, 'avatar');
    const metadata = await sharp(await readFile(path.join(directory, filename))).metadata();
    expect(filename.endsWith('.png')).toBe(true);
    expect(metadata.format).toBe('png');
  });

  it('rejeita conteúdo inválido mesmo com MIME permitido', async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'chamados-image-'));
    await expect(writeOptimizedImage(Buffer.from('<script>alert(1)</script>'), 'image/png', directory, 'avatar')).rejects.toThrow();
  });

  it('guarda vídeo privado somente com assinatura válida e o remove depois', async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'chamados-video-'));
    const video = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.alloc(16)]);
    const filename = await writeAttachment(video, 'video/mp4', directory, 'ticket');
    expect((await stat(path.join(directory, filename))).mode & 0o777).toBe(0o600);
    await deletePrivateAttachment(filename, directory);
    await expect(readFile(path.join(directory, filename))).rejects.toThrow();
  });

  it('recusa vídeo sem assinatura reconhecida', async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'chamados-video-'));
    await expect(writeAttachment(Buffer.from('conteúdo inválido'), 'video/mp4', directory, 'ticket')).rejects.toThrow('vídeo enviado');
  });
});
