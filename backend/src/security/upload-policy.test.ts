import {describe, expect, it} from 'vitest';
import {allowedImageType, safeImageExtension} from './upload-policy.js';

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
});
