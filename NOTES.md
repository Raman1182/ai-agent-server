# Development Notes

## Deployment Success

**Live URL**: https://ai-agent-server-owa0.onrender.com

The AI Agent Server has been successfully deployed and is fully operational with all features working:
- Health endpoint responding correctly
- Agent message processing with RAG and plugins
- Math plugin calculating expressions accurately
- Session management maintaining conversation context
- Vector store retrieving relevant document chunks

## Development Approach

### Code Architecture
All core components were designed and implemented from scratch:
- **Agent orchestration system**: Custom flow management in `agentService.ts`
- **Vector store with similarity search**: Built using ml-distance for cosine similarity
- **Session management**: In-memory storage with message limits and cleanup
- **Plugin system**: Extensible architecture with intent detection
- **Dynamic prompt engineering**: Context-aware system prompt assembly
- **API design**: RESTful endpoints with proper validation and error handling
- **Knowledge base**: Curated 5 technical documents focused on markdown and blogging

### External Libraries Used
- **ml-distance**: For vector similarity calculations
- **express**: Web framework
- **axios**: HTTP client for external APIs
- **@google/generative-ai**: Gemini API integration

## Bugs Faced and Solutions

### 1. Vector Similarity Search Issues
**Problem**: Initial implementation using basic dot product gave poor relevance scores.
**Solution**: Switched to cosine similarity using ml-distance library, which normalizes vectors and provides better semantic matching.

### 2. Memory Management
**Problem**: Sessions growing indefinitely, causing memory leaks.
**Solution**: Implemented message limit (20 per session) and only use last 4 messages for context.

### 3. Plugin Detection Logic
**Problem**: Plugins were triggering on irrelevant messages.
**Solution**: Improved pattern matching with multiple regex patterns and keyword combinations for better intent detection.

### 4. Gemini API Rate Limiting
**Problem**: Concurrent requests causing rate limit errors during testing.
**Solution**: Added proper error handling and fallback responses. In production, would implement request queuing.

### 5. Environment Variable Handling
**Problem**: App crashing when optional API keys (weather) weren't provided.
**Solution**: Implemented graceful fallbacks with mock data when external APIs aren't available.

### 6. Environment Variable Loading Order
**Problem**: Gemini API key showing as undefined even though it was in .env file.
**Solution**: The issue was that `GeminiService` was being instantiated at module load time (when routes were imported) before `dotenv.config()` was called. Fixed by implementing lazy initialization of the service in the route handler.

## Agent Architecture Flow

### Detailed Agent Routing & Context Embedding Process

#### 1. Request Processing (`/agent/message`)
```typescript
POST /agent/message → Input validation → getAgentService().processMessage()
```

#### 2. Agent Service Orchestration (`agentService.ts`)
```typescript
async processMessage(request: AgentRequest): Promise<AgentResponse> {
  this.sessionManager.addMessage(sessionId, userMsg);
  const context = await this.vectorStore.search(message, 3);
  const plugins = await this.pluginManager.executePlugins(message);
  const history = this.sessionManager.getRecentMessages(sessionId, 4);
  const prompt = this.buildSystemPrompt(history, context, plugins);
  const reply = await this.geminiService.generateResponse([
    { role: 'system', content: prompt },
    { role: 'user', content: message }
  ]);
  this.sessionManager.addMessage(sessionId, botMsg);
  return { reply, sessionId, pluginsUsed, context };
}
```

#### 3. Plugin Routing Logic (`pluginManager.ts`)
```typescript
async executePlugins(message: string): Promise<PluginResult[]> {
  const results: PluginResult[] = [];
  for (const plugin of this.plugins) {
    if (plugin.canHandle(message)) {
      try {
        const result = await plugin.execute(message);
        results.push({ name: plugin.name, success: true, result });
      } catch (error) {
        results.push({ name: plugin.name, success: false, error: error.message });
      }
    }
  }
  return results;
}
```

**Plugin Intent Detection Examples:**
- **Weather Plugin**: Regex patterns for `/(weather|temperature|forecast).*in\s+([a-zA-Z\s]+)/i`
- **Math Plugin**: Patterns for `/(calculate|compute|\d+.*[\+\-\*\/].*\d+)/i`

#### 4. Memory & Context Embedding (`buildSystemPrompt`)
```typescript
private buildSystemPrompt(
  recentMessages: Message[],
  retrievedContext: RetrievedChunk[],
  pluginResults: PluginResult[]
): string {
  let prompt = `You are an intelligent AI assistant...`;
  
  if (history.length > 0) {
    prompt += `RECENT CONVERSATION HISTORY:\n`;
    history.slice(-2).forEach(msg => {
      prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    });
  }
  
  if (context.length > 0) {
    prompt += `RELEVANT CONTEXT FROM KNOWLEDGE BASE:\n`;
    context.forEach((chunk, index) => {
      prompt += `[Context ${index + 1}] ${chunk.metadata.title}:\n${chunk.content}\n\n`;
    });
  }
  
  if (plugins.length > 0) {
    prompt += `PLUGIN EXECUTION RESULTS:\n`;
    plugins.forEach(result => {
      if (result.success) {
        prompt += `${result.name.toUpperCase()} PLUGIN:\n${JSON.stringify(result.result, null, 2)}\n\n`;
      }
    });
  }
  
  return prompt;
}
```

#### 5. Vector Store RAG Implementation (`vectorStore.ts`)
```typescript
async search(query: string, topK: number = 3): Promise<RetrievedChunk[]> {
  const queryEmbedding = await this.geminiService.generateEmbedding(query);
  const similarities = this.chunks.map(chunk => ({
    chunk,
    similarity: similarity.cosine(queryEmbedding, chunk.embedding)
  }));
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => ({
      content: item.chunk.content,
      similarity: item.similarity,
      metadata: item.chunk.metadata
    }));
}
```

#### 6. Session Memory Management (`sessionManager.ts`)
```typescript
class SessionManager {
  private sessions = new Map<string, Message[]>();
  private readonly MAX_MESSAGES_PER_SESSION = 20;
  
  addMessage(sessionId: string, message: Message): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    
    const messages = this.sessions.get(sessionId)!;
    messages.push(message);
    
    if (messages.length > this.MAX_MESSAGES_PER_SESSION) {
      messages.splice(0, messages.length - this.MAX_MESSAGES_PER_SESSION);
    }
  }
  
  getRecentMessages(sessionId: string, count: number = 4): Message[] {
    const messages = this.sessions.get(sessionId) || [];
    return messages.slice(-count); // Last N messages for context
  }
}
```

### Context Flow Summary
```
User Message
    ↓
┌─────────────────────────────────────────────────────────┐
│ Agent Service (Parallel Execution)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   RAG       │  │  Plugins    │  │  Session    │     │
│  │ (Vector     │  │ (Intent     │  │ (Memory     │     │
│  │  Search)    │  │ Detection)  │  │ Retrieval)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
    ↓
System Prompt Assembly
    ↓
Gemini API Call
    ↓
Response + Session Update
```

## Technical Decisions

### Vector Store Implementation
- **Choice**: Custom implementation with ml-distance
- **Reasoning**: Avoid external dependencies, full control over similarity logic
- **Trade-off**: Less optimized than specialized vector DBs, but simpler deployment

### Plugin System Design
- **Choice**: Class-based inheritance with canHandle/execute pattern
- **Reasoning**: Easy to extend, clear separation of concerns
- **Trade-off**: More boilerplate than functional approach, but better type safety

### Session Management
- **Choice**: In-memory Map storage
- **Reasoning**: Fast access, simple implementation for demo
- **Trade-off**: Not persistent across restarts, memory usage grows

### Prompt Engineering Strategy
- **Choice**: Dynamic prompt building with structured sections
- **Reasoning**: Flexible context injection, clear separation of information types
- **Trade-off**: Longer prompts = higher token costs, but better context utilization

## Deployment Considerations

### Current Setup
- Stateless server design (except for in-memory sessions)
- Environment-based configuration
- Health check endpoints for monitoring
- Graceful error handling

### Production Improvements Needed
- Redis for session persistence
- Database for document storage
- Rate limiting middleware
- Request logging and monitoring
- Horizontal scaling support

## Testing Strategy

### Manual Testing Performed
- Basic message processing with various inputs
- Plugin triggering with weather and math queries
- Session continuity across multiple messages
- RAG context retrieval with technical queries
- Error handling with invalid inputs

### Automated Testing (Recommended)
- Unit tests for plugin logic
- Integration tests for agent service
- Vector similarity accuracy tests
- API endpoint testing with various payloads

## Performance Observations

### Response Times (Local Testing)
- Simple queries: ~1-2 seconds
- Plugin-triggered queries: ~2-3 seconds  
- RAG-heavy queries: ~2-4 seconds
- Math calculations: ~1-2 seconds

### Memory Usage
- Base application: ~50MB
- With 5 documents + embeddings: ~60MB
- After 100 messages across 10 sessions: ~65MB

### Bottlenecks Identified
1. Gemini API latency (network bound)
2. Embedding generation for new queries
3. Vector similarity computation (CPU bound)

## Future Enhancements

### Short Term
- Add more plugin types (web search, file operations)
- Implement conversation summarization for long sessions
- Add request caching for repeated queries

### Long Term  
- Multi-modal support (images, audio)
- Fine-tuned models for specific domains
- Advanced RAG with document chunking strategies
- Real-time streaming responses