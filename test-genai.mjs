import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'dummy', baseUrl: 'wss://test.com', httpOptions: { baseUrl: 'wss://test.com' } });
console.log(Object.keys(ai));
