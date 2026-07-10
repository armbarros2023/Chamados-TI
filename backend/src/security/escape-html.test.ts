import {describe, expect, it} from 'vitest';
import {escapeHtml} from './escape-html.js';

describe('escapeHtml', () => {
  it('neutraliza marcação e atributos em conteúdo de e-mail', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">&')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;');
  });
});
