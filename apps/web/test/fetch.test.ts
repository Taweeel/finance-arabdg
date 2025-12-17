import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  process.env.NEXT_PUBLIC_PROJECT_GROUP_ID = '';
  delete process.env.NEXT_PUBLIC_CREATE_API_BASE_URL;
  delete process.env.NEXT_PUBLIC_CREATE_BASE_URL;
});

describe('fetchWithHeaders', () => {
  it('for same-origin adds x-createxyz-project-group-id header', async () => {
    process.env.NEXT_PUBLIC_PROJECT_GROUP_ID = 'test-group';
    const mockResp = new Response(null, { status: 200 });
    const mockFetch = vi.fn(async (_input, init) => {
      const headers = new Headers((init as any)?.headers ?? undefined);
      expect(headers.get('x-createxyz-project-group-id')).toBe('test-group');
      return mockResp;
    });

    // Stub global fetch BEFORE importing the module so its `originalFetch` captures the stub.
    vi.stubGlobal('fetch', mockFetch);
    const { default: fetchWithHeaders } = await import('../src/__create/fetch');

    const res = await fetchWithHeaders('/integrations/path');
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('does not add header for external URLs', async () => {
    process.env.NEXT_PUBLIC_PROJECT_GROUP_ID = 'test-group';
    const mockResp = new Response(null, { status: 200 });
    const mockFetch = vi.fn(async (_input, init) => {
      const headers = new Headers((init as any)?.headers ?? undefined);
      // for external fetch the header should not be set (we call original fetch directly)
      expect(headers.get('x-createxyz-project-group-id')).toBeNull();
      return mockResp;
    });

    vi.stubGlobal('fetch', mockFetch);
    const { default: fetchWithHeaders } = await import('../src/__create/fetch');

    const res = await fetchWithHeaders('https://example.com/resource');
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalled();
  });
});
