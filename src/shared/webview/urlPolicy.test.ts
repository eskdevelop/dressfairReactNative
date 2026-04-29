import { isAllowedUrl } from './urlPolicy';

describe('url policy', () => {
  it('allows known dressfair domains', () => {
    expect(isAllowedUrl('https://www.dressfair.com/p/model-a')).toBe(true);
  });

  it('blocks unknown domains', () => {
    expect(isAllowedUrl('https://malicious.example.com/')).toBe(false);
  });
});
