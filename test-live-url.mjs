import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ 
  apiKey: 'dummy',
  httpOptions: { baseUrl: 'https://test.com' }
});

try {
  await ai.live.connect({ model: 'gemini-2.0-flash' });
} catch (e) {
  console.log(e.message);
}
