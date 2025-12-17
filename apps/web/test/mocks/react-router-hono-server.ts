export async function createHonoServer() {
  return {
    fetch: async (req: Request) => {
      const url = new URL(req.url);
      if (url.pathname === '/') return new Response('ok', { status: 200 });
      return new Response('not found', { status: 404 });
    },
  };
}
export const unstable_reactRouterServeConfig = {};
