interface Env {
  SHARES: KVNamespace;
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Allow all origins - this worker only stores/retrieves game state (no sensitive data)
// This enables the game to work from any hosting environment (AI Studio, artifacts, etc.)
function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

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
