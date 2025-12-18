import { join } from 'node:path';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Base used to compute route paths from glob keys
const API_SRC_BASE = '../src/app/api';
if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Helper to transform glob key to Hono route path
function getHonoPathFromKey(key: string): { name: string; pattern: string }[] {
  const relativePath = key.replace(API_SRC_BASE, '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Import and register all routes via Vite glob (works in build)
async function registerRoutes() {
  const modules = import.meta.glob('../src/app/api/**/route.js', { eager: true });
  const entries = Object.entries(modules).sort((a, b) => b[0].length - a[0].length);

  // Clear existing routes
  api.routes = [];

  for (const [key, mod] of entries) {
    const route = mod as Record<string, unknown>;
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      const handlerExport = route[method];
      if (typeof handlerExport === 'function') {
        const parts = getHonoPathFromKey(key);
        const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
      const handler: Handler = async (c) => {
        const params = c.req.param();
        // In dev, re-import for HMR
        if (import.meta.env.DEV) {
          const specifier = `${key}`.replace(/ /g, '%20');
          const updated = await import(/* @vite-ignore */ `${specifier}?update=${Date.now()}`);
          return await updated[method](c.req.raw, { params });
        }
        return await (handlerExport as Function)(c.req.raw, { params });
      };
        const methodLowercase = method.toLowerCase();
        switch (methodLowercase) {
          case 'get':
            api.get(honoPath, handler);
            break;
          case 'post':
            api.post(honoPath, handler);
            break;
          case 'put':
            api.put(honoPath, handler);
            break;
          case 'delete':
            api.delete(honoPath, handler);
            break;
          case 'patch':
            api.patch(honoPath, handler);
            break;
          default:
            console.warn(`Unsupported method: ${method}`);
            break;
        }
      }
    }
  }
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };
