import { AgentRequest, AgentResponse, Message, RetrievedChunk, PluginResult } from '../types';
import { GeminiService } from './gemini';
import { SessionManager } from './sessionManager';
import { VectorStore } from './vectorStore';
import { PluginManager } from '../plugins/pluginManager';

export class AgentService {
  private geminiService: GeminiService;
  private sessionManager: SessionManager;
  private vectorStore: VectorStore;
  private pluginManager: PluginManager;

  constructor() {
    this.geminiService = new GeminiService();
    this.sessionManager = SessionManager.getInstance();
    this.vectorStore = VectorStore.getInstance();
    this.pluginManager = PluginManager.getInstance();
  }

  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    const { message, sessionId } = request;

    const userMsg: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.sessionManager.addMessage(sessionId, userMsg);

    const context = await this.vectorStore.search(message, 3);
    const plugins = await this.pluginManager.executePlugins(message);
    const history = this.sessionManager.getRecentMessages(sessionId, 4);

    const prompt = this.buildSystemPrompt(history, context, plugins);

    const msgs = [
      { role: 'system', content: prompt },
      { role: 'user', content: message },
    ];

    const reply = await this.geminiService.generateResponse(msgs);

    const botMsg: Message = {
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    };
    this.sessionManager.addMessage(sessionId, botMsg);

    return {
      reply,
      sessionId,
      pluginsUsed: plugins.filter(p => p.success).map(p => p.name),
      context: context,
    };
  }

  private buildSystemPrompt(
    history: Message[],
    context: RetrievedChunk[],
    plugins: PluginResult[]
  ): string {
    let prompt = `You are an intelligent AI assistant with access to contextual information and various tools.

CORE INSTRUCTIONS:
- Be helpful, accurate, and conversational
- Use the provided context and plugin results to enhance your responses
- If plugin results are available, incorporate them naturally into your answer
- Maintain conversation continuity using the message history
- Be concise but informative

`;

    if (history.length > 0) {
      prompt += `RECENT CONVERSATION HISTORY:
`;
      const recent = history.slice(-2);
      recent.forEach(msg => {
        prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    if (context.length > 0) {
      prompt += `RELEVANT CONTEXT FROM KNOWLEDGE BASE:
`;
      context.forEach((chunk, index) => {
        prompt += `[Context ${index + 1}] ${chunk.metadata.title}:
${chunk.content}

`;
      });
    }

    if (plugins.length > 0) {
      prompt += `PLUGIN EXECUTION RESULTS:
`;
      plugins.forEach(result => {
        if (result.success) {
          prompt += `${result.name.toUpperCase()} PLUGIN:
${JSON.stringify(result.result, null, 2)}

`;
        }
      });
    }

    prompt += `Please provide a helpful response based on the user's message, incorporating the above context and plugin results where relevant.`;

    return prompt;
  }
}