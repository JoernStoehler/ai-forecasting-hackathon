interface Env {
  SHARES: KVNamespace;
  ALLOWED_ORIGINS: string;
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function corsHeaders(origin: string, env: Env): HeadersInit {
  const allowed = env.ALLOWED_ORIGINS.split(',');
  const allowedOrigin = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // POST /share - store game state, return ID
    if (request.method === 'POST' && url.pathname === '/share') {
      try {
        const body = await request.text();
        // Basic validation: must be valid JSON
        JSON.parse(body);

        const id = generateId();
        // Store for 30 days
        await env.SHARES.put(id, body, { expirationTtl: 60 * 60 * 24 * 30 });

        return new Response(JSON.stringify({ id }), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // GET /share/:id - retrieve game state
    const match = url.pathname.match(/^\/share\/([a-z0-9]+)$/);
    if (request.method === 'GET' && match) {
      const id = match[1];
      const data = await env.SHARES.get(id);

      if (!data) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      return new Response(data, {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
