import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null;
  private mockMode: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not found. Running in MOCK MODE for testing.');
      this.mockMode = true;
      this.genAI = null;
    } else {
      console.log('Gemini API key found, initializing real mode');
      this.mockMode = false;
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.mockMode) {
      const mock = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
      return mock;
    }

    try {
      const embedding = this.createTextEmbedding(text);
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  private createTextEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(768).fill(0);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + i * j) % 768;
        embedding[index] += Math.sin(charCode * 0.1) * Math.cos(i * 0.1);
      }
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  async generateResponse(messages: any[]): Promise<string> {
    if (this.mockMode) {
      const userMsg = messages.find(m => m.role === 'user')?.content || '';
      return this.createMockResponse(userMsg);
    }

    try {
      const model = this.genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemMsg = messages.find(m => m.role === 'system')?.content || '';
      const userMsg = messages.find(m => m.role === 'user')?.content || '';

      const prompt = systemMsg ? `${systemMsg}\n\nUser: ${userMsg}` : userMsg;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      throw error;
    }
  }

  private createMockResponse(userMsg: string): string {
    const lower = userMsg.toLowerCase();
    if (lower.includes('markdown') || lower.includes('blog')) {
      return `Based on the available documentation, Markdown is an excellent choice for blogging because:

1. **Simplicity**: Markdown uses simple, unobtrusive syntax that's easy to write and read
2. **Portability**: Plain text format works everywhere and is future-proof
3. **Version Control**: Git-friendly format perfect for tracking changes
4. **Focus**: Lets you concentrate on content rather than formatting

The documents show that many developers prefer Markdown for technical blogs because it integrates well with static site generators like Next.js, Jekyll, and Hugo. You can write content in any text editor and convert it to beautiful HTML automatically.

*Note: This is a mock response. Add your Gemini API key to get real AI-powered responses.*`;
    }

    if (lower.includes('weather')) {
      return `I can help you with weather information! However, I'm currently running in mock mode. To get real weather data and AI responses, please add your Gemini API key to the .env file.

*Mock response - add GEMINI_API_KEY for real functionality.*`;
    }

    if (lower.includes('calculate') || /\d+.*[\+\-\*\/].*\d+/.test(lower)) {
      return `I can help with calculations! However, I'm currently running in mock mode. The math plugin would normally process your calculation and provide the result.

*Mock response - add GEMINI_API_KEY for real functionality.*`;
    }

    return `Hello! I'm an AI agent powered by Google Gemini with access to markdown and blogging documentation. I can help you with:

- Markdown syntax and best practices
- Blog development with Next.js and React
- Static site generators like Jekyll and Hugo
- LLM-friendly content creation
- Technical writing and documentation

However, I'm currently running in **MOCK MODE** because no Gemini API key was found. To unlock full functionality:

1. Get an API key from https://aistudio.google.com/app/apikey
2. Add it to your .env file: GEMINI_API_KEY=your-key-here
3. Restart the server

*This is a mock response demonstrating the system architecture with Gemini integration.*`;
  }
}