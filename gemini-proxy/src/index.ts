export interface Env {
  GEMINI_API_KEY: string;
  DB: D1Database;
}

// In-memory fallback rate limiter for when D1 is unavailable
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    const host = url.host.toLowerCase();
    
    // Local dev origins (any localhost / loopback port)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return true;
    }
    
    // Production and Cloudflare Pages origins
    if (host === 'seatsathi.com' || host === 'www.seatsathi.com' || host === 'seatsathi.pages.dev') {
      return true;
    }
    
    // Pages preview branches (*.seatsathi.pages.dev)
    if (host.endsWith('.seatsathi.pages.dev')) {
      return true;
    }

    // Vercel deployment origins (support both seatsathi and seat-sathi)
    if (
      host === 'seatsathi.vercel.app' || 
      host === 'seat-sathi.vercel.app' || 
      host.endsWith('.seatsathi.vercel.app') ||
      host.endsWith('.seat-sathi.vercel.app')
    ) {
      return true;
    }

    // Vercel preview branches for SeatSathi (*.vercel.app)
    if (host.endsWith('.vercel.app') && (host.includes('seatsathi') || host.includes('seat-sathi'))) {
      return true;
    }
  } catch {
    return false;
  }
  
  return false;
}

function checkMemoryRateLimit(clientIP: string, oneHour: number): boolean {
  const now = Date.now();
  
  // Prune expired records to prevent unbounded memory growth
  if (memoryRateLimits.size > 1000) {
    for (const [ip, rec] of memoryRateLimits.entries()) {
      if (now > rec.resetAt) {
        memoryRateLimits.delete(ip);
      }
    }
  }

  const record = memoryRateLimits.get(clientIP);
  if (!record || now > record.resetAt) {
    memoryRateLimits.set(clientIP, { count: 1, resetAt: now + oneHour });
    return false;
  }
  record.count++;
  return record.count > 30; // Max 30 sessions per hour per IP on memory limiter
}

function verifyFirebaseJwtClaims(token: string): boolean {
  if (!token || token.length < 30) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const header = JSON.parse(atob(parts[0]));
    if (header.alg !== 'RS256') return false;

    const payload = JSON.parse(atob(parts[1]));
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= nowSec) return false;
    if (!payload.sub || typeof payload.sub !== 'string') return false;
    if (payload.aud !== 'seatsathi-981f8' && !payload.iss?.includes('seatsathi-981f8')) return false;
    return true;
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // Phase 1.1: Origin validation against Cross-Site WebSocket Hijacking (CSWSH)
    const origin = request.headers.get('Origin');
    if (!isOriginAllowed(origin)) {
      return new Response('Forbidden: Unauthorized origin', { status: 403 });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response('Missing GEMINI_API_KEY in environment', { status: 500 });
    }

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ONE_HOUR = 60 * 60 * 1000;
    const MAX_REQUESTS = 50; // Max 50 sessions per hour per IP

    // D1 Rate Limiting Logic with In-Memory Safe Fallback
    let rateLimited = false;
    if (env.DB) {
      try {
        const now = Date.now();
        // Fire-and-forget cleanup of old entries
        ctx.waitUntil(
          env.DB.prepare('DELETE FROM rate_limits WHERE timestamp < ?').bind(now - ONE_HOUR).run()
            .catch(e => console.error('Cleanup error:', e))
        );
        
        // Count requests from this IP in the last hour
        const { results } = await env.DB.prepare('SELECT COUNT(*) as count FROM rate_limits WHERE ip = ? AND timestamp >= ?')
          .bind(clientIP, now - ONE_HOUR).all();
        const count = (results[0] as any)?.count || 0;
        
        if (count >= MAX_REQUESTS) {
          rateLimited = true;
        } else {
          // Record new session
          await env.DB.prepare('INSERT INTO rate_limits (ip, timestamp) VALUES (?, ?)').bind(clientIP, now).run();
        }
      } catch (e) {
        console.error('D1 rate limiting error, falling back to in-memory limiter:', e);
        rateLimited = checkMemoryRateLimit(clientIP, ONE_HOUR);
      }
    } else {
      // In-memory rate limiting when D1 is not bound
      rateLimited = checkMemoryRateLimit(clientIP, ONE_HOUR);
    }

    if (rateLimited) {
      return new Response('Rate limit exceeded (sessions/hr). Please try again later.', { status: 429 });
    }

    // Determine max session duration based on verified user authentication
    const reqUrl = new URL(request.url);
    const mode = reqUrl.searchParams.get('mode') || 'guest';
    const token = reqUrl.searchParams.get('token') || '';
    const isVerifiedAuth = mode === 'authenticated' && verifyFirebaseJwtClaims(token);
    const MAX_SESSION_DURATION = isVerifiedAuth ? 10 * 60 * 1000 : 2 * 60 * 1000; // 10 min for verified auth, 2 min for guest

    // Connect to Gemini Live API
    const GEMINI_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${env.GEMINI_API_KEY}`;
    
    // Create the connection to Gemini
    const geminiWs = new WebSocket(GEMINI_URL);
    
    // Create the connection back to the browser
    const [clientWs, serverWs] = Object.values(new WebSocketPair());

    serverWs.accept();

    // Server-side session duration timer
    const sessionTimer = setTimeout(() => {
      try {
        serverWs.close(1000, "Session time limit reached");
        geminiWs.close(1000, "Session time limit reached");
      } catch (err) {
        console.error("Error closing session on timeout:", err);
      }
    }, MAX_SESSION_DURATION);

    // Frame throttle tracking (max 40 frames/sec from client)
    let frameCount = 0;
    let lastFrameReset = Date.now();

    // Pipe Browser -> Gemini with flood protection
    const messageQueue: Array<string | ArrayBuffer> = [];
    serverWs.addEventListener('message', (event) => {
      // Reject oversized frames (> 512KB) to prevent worker memory exhaustion
      const frameSize = typeof event.data === 'string' 
        ? event.data.length 
        : (event.data instanceof ArrayBuffer ? event.data.byteLength : 0);
      if (frameSize > 512 * 1024) {
        console.warn(`Client IP ${clientIP} sent oversized frame (${frameSize} bytes)`);
        serverWs.close(1009, "Message too big");
        geminiWs.close(1009, "Message too big");
        clearTimeout(sessionTimer);
        return;
      }

      const now = Date.now();
      if (now - lastFrameReset > 1000) {
        frameCount = 0;
        lastFrameReset = now;
      }
      frameCount++;
      if (frameCount > 40) {
        console.warn(`Client IP ${clientIP} exceeded frame throttle (${frameCount}/s)`);
        serverWs.close(1008, "Rate limit exceeded (too many frames)");
        geminiWs.close(1008, "Rate limit exceeded");
        clearTimeout(sessionTimer);
        return;
      }

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
      clearTimeout(sessionTimer);
      geminiWs.close();
    });

    // Handle closing Gemini -> Browser
    geminiWs.addEventListener('close', () => {
      clearTimeout(sessionTimer);
      serverWs.close();
    });
    
    // Handle errors
    serverWs.addEventListener('error', (e) => {
      clearTimeout(sessionTimer);
      console.error('Server WS Error:', e);
    });
    geminiWs.addEventListener('error', (e) => {
      clearTimeout(sessionTimer);
      console.error('Gemini WS Error:', e);
    });

    return new Response(null, {
      status: 101,
      webSocket: clientWs,
    });
  },
};
