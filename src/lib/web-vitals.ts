export type Vital = { name: 'LCP' | 'INP' | 'CLS'; value: number; page: '/' | '/blog' | '/blog/article' };

export function parseVital(value: unknown): Vital | null {
    if (!value || typeof value !== 'object') return null;
    const input = value as Record<string, unknown>;
    if (!['LCP', 'INP', 'CLS'].includes(String(input.name)) || !['/', '/blog', '/blog/article'].includes(String(input.page))) return null;
    if (typeof input.value !== 'number' || !Number.isFinite(input.value) || input.value < 0 || input.value > (input.name === 'CLS' ? 100 : 300000)) return null;
    return { name: input.name as Vital['name'], value: input.value, page: input.page as Vital['page'] };
}
