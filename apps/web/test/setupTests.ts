import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocks for modules that are internal or require env (so tests can import server)
vi.mock('@auth/create', () => {
	return {
		default: (opts: any) => ({ auth: {} }),
	};
});

vi.mock('@neondatabase/serverless', () => ({
	Pool: class {
		async query() {
			return { rowCount: 0, rows: [] };
		}
	},
	neonConfig: { webSocketConstructor: undefined },
}));

vi.mock('@auth/core/providers/credentials', () => ({
	default: (opts: any) => ({ id: opts?.id ?? 'credentials' }),
}));

vi.mock('argon2', () => ({
	hash: async (s: string) => 'hashed-' + s,
	verify: async () => true,
}));

// Mock the react-router-hono-server createHonoServer for tests so it doesn't rely on Vite env
vi.mock('react-router-hono-server', () => ({
	createHonoServer: async () => ({
		fetch: async (req: Request) => {
			const url = new URL(req.url);
			if (url.pathname === '/') return new Response('ok', { status: 200 });
			return new Response('not found', { status: 404 });
		},
	}),
	unstable_reactRouterServeConfig: {},
}));