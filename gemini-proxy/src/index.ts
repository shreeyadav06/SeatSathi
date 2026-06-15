export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response('Missing GEMINI_API_KEY in environment', { status: 500 });
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
