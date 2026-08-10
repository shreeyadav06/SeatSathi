const WebSocket = require('ws');
const modelsToTest = ['models/gemini-2.5-flash-native-audio-preview-12-2025', 'models/gemini-2.5-flash'];

async function testModel(modelName) {
  return new Promise((resolve) => {
    const ws = new WebSocket('wss://seatsathi-proxy.seatsathi.workers.dev/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent');
    
    ws.on('open', () => {
      ws.send(JSON.stringify({setup: {model: modelName}}));
    });

    ws.on('message', (data) => {
      console.log(`[${modelName}] Message received:`, data.toString().slice(0, 100));
      ws.close();
      resolve(true);
    });

    ws.on('error', (err) => {
      console.log(`[${modelName}] Error:`, err.message);
      resolve(false);
    });

    ws.on('close', (code, reason) => {
      console.log(`[${modelName}] Closed: ${code} - ${reason.toString()}`);
      resolve(false);
    });
  });
}

(async () => {
  for (const model of modelsToTest) {
    await testModel(model);
  }
})();
