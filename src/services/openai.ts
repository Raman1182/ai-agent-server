import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI | null;
  private mockMode: boolean;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'sk-your-actual-openai-api-key-here') {
      console.warn('OpenAI API key not found. Running in MOCK MODE for testing.');
      this.mockMode = true;
      this.client = null;
    } else {
      this.mockMode = false;
      this.client = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.mockMode) {
      const mock = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
      return mock;
    }

    try {
      const response = await this.client!.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async generateResponse(messages: any[]): Promise<string> {
    if (this.mockMode) {
      const userMsg = messages.find(m => m.role === 'user')?.content || '';
      const systemMsg = messages.find(m => m.role === 'system')?.content || '';

      return this.createMockResponse(userMsg, systemMsg);
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  private createMockResponse(userMsg: string, systemMsg: string): string {
    const lower = userMsg.toLowerCase();

    if (lower.includes('markdown') || lower.includes('blog')) {
      return `Based on the available documentation, Markdown is an excellent choice for blogging because:

1. **Simplicity**: Markdown uses simple, unobtrusive syntax that's easy to write and read
2. **Portability**: Plain text format works everywhere and is future-proof
3. **Version Control**: Git-friendly format perfect for tracking changes
4. **Focus**: Lets you concentrate on content rather than formatting

The documents show that many developers prefer Markdown for technical blogs because it integrates well with static site generators like Next.js, Jekyll, and Hugo. You can write content in any text editor and convert it to beautiful HTML automatically.

*Note: This is a mock response. Add your OpenAI API key to get real AI-powered responses.*`;
    }

    if (lower.includes('weather')) {
      return `I can help you with weather information! However, I'm currently running in mock mode. To get real weather data and AI responses, please add your OpenAI API key to the .env file.

*Mock response - add OPENAI_API_KEY for real functionality.*`;
    }

    if (lower.includes('calculate') || /\d+.*[\+\-\*\/].*\d+/.test(lower)) {
      return `I can help with calculations! However, I'm currently running in mock mode. The math plugin would normally process your calculation and provide the result.

*Mock response - add OPENAI_API_KEY for real functionality.*`;
    }

    return `Hello! I'm an AI agent with access to markdown and blogging documentation. I can help you with:

- Markdown syntax and best practices
- Blog development with Next.js and React
- Static site generators like Jekyll and Hugo
- LLM-friendly content creation
- Technical writing and documentation

However, I'm currently running in **MOCK MODE** because no OpenAI API key was found. To unlock full functionality:

1. Get an API key from https://platform.openai.com/api-keys
2. Add it to your .env file: OPENAI_API_KEY=sk-your-key-here
3. Restart the server

*This is a mock response demonstrating the system architecture.*`;
  }
}