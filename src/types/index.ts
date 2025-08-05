export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    source: string;
    type: string;
  };
  embedding?: number[];
}

export interface RetrievedChunk {
  content: string;
  similarity: number;
  metadata: {
    title: string;
    source: string;
  };
}

export interface PluginResult {
  name: string;
  result: any;
  success: boolean;
  error?: string;
}

export interface AgentRequest {
  message: string;
  sessionId: string;
}

export interface AgentResponse {
  reply: string;
  sessionId: string;
  pluginsUsed?: string[];
  context?: RetrievedChunk[];
}