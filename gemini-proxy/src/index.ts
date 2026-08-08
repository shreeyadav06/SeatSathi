export interface Env {
  GEMINI_API_KEY: string;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response('Missing GEMINI_API_KEY in environment', { status: 500 });
    }

    // D1 Rate Limiting Logic (Phase 6)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ONE_HOUR = 60 * 60 * 1000;
    const MAX_REQUESTS = 50; // Max 50 sessions per hour per IP

    if (env.DB) {
      try {
        const now = Date.now();
        // Fire-and-forget cleanup of old entries
        ctx.waitUntil(
          env.DB.prepare('DELETE FROM rate_limits WHERE timestamp < ?').bind(now - ONE_HOUR).run()
            .catch(e => console.error('Cleanup error:', e))
        );
        
        // Count recent requests from this IP
        const { results } = await env.DB.prepare('SELECT COUNT(*) as count FROM rate_limits WHERE ip = ?').bind(clientIP).all();
        const count = (results[0] as any)?.count || 0;
        
        if (count >= MAX_REQUESTS) {
          return new Response('Rate limit exceeded (50 sessions/hr). Please try again later.', { status: 429 });
        }
        
        // Record new session
        await env.DB.prepare('INSERT INTO rate_limits (ip, timestamp) VALUES (?, ?)').bind(clientIP, now).run();
      } catch (e) {
        console.error('Rate limiting error (table might not exist yet), bypassing:', e);
      }
    }

    // Connect to Gemini Live API
    const GEMINI_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${env.GEMINI_API_KEY}`;
    
    // Create the connection to Gemini
    const geminiWs = new WebSocket(GEMINI_URL);
    
    // Create the connection back to the browser
    const [clientWs, serverWs] = Object.values(new WebSocketPair());

    serverWs.accept();

    // Pipe Browser -> Gemini
    const messageQueue: Array<string | ArrayBuffer> = [];
    serverWs.addEventListener('message', (event) => {
      if (geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(event.data);
      } else if (geminiWs.readyState === WebSocket.CONNECTING) {
        messageQueue.push(event.data);
      }
    });

    geminiWs.addEventListener('open', () => {
      while (messageQueue.length > 0) {
        geminiWs.send(messageQueue.shift()!);
      }
    });

    // Pipe Gemini -> Browser
    geminiWs.addEventListener('message', (event) => {
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(event.data);
      }
    });

    // Handle closing Browser -> Gemini
    serverWs.addEventListener('close', () => {
      geminiWs.close();
    });

    // Handle closing Gemini -> Browser
    geminiWs.addEventListener('close', () => {
      serverWs.close();
    });
    
    // Handle errors
    serverWs.addEventListener('error', (e) => console.error('Server WS Error:', e));
    geminiWs.addEventListener('error', (e) => console.error('Gemini WS Error:', e));

    return new Response(null, {
      status: 101,
      webSocket: clientWs,
    });
  },
};
