import {describe, expect, it} from 'vitest';
import {allowedImageType, hasValidVideoSignature, safeImageExtension} from './upload-policy.js';

describe('upload policy', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('aceita %s', (mime) => {
    expect(allowedImageType(mime)).toBe(true);
  });

  it.each(['image/svg+xml', 'text/html', 'application/javascript', 'image/gif'])('rejeita %s', (mime) => {
    expect(allowedImageType(mime)).toBe(false);
  });

  it('deriva extensão somente do tipo validado', () => {
    expect(safeImageExtension('image/jpeg')).toBe('.jpg');
    expect(safeImageExtension('image/png')).toBe('.png');
    expect(safeImageExtension('image/webp')).toBe('.webp');
  });

  it('aceita somente vídeos com assinatura ISO Base Media', () => {
    const validVideo = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.alloc(16)]);
    expect(hasValidVideoSignature(validVideo)).toBe(true);
    expect(hasValidVideoSignature(Buffer.from('<script>alert(1)</script>'))).toBe(false);
  });
});
