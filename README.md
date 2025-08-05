# AI Agent Server with RAG & Plugin System

A TypeScript-based AI agent server featuring Retrieval-Augmented Generation (RAG), plugin execution system, and session-based memory management.

## Features

- **LLM Integration**: OpenAI GPT-4 powered responses
- **RAG System**: Vector-based document retrieval with custom similarity search
- **Plugin System**: Extensible plugin architecture with weather and math plugins
- **Session Memory**: Persistent conversation history per session
- **TypeScript**: Fully typed codebase for reliability and maintainability

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Routes    │────│  Agent Service   │────│  OpenAI Service │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼────┐ ┌────▼────┐ ┌────▼──────┐
            │Vector Store│ │ Session │ │  Plugin   │
            │    (RAG)   │ │Manager  │ │ Manager   │
            └────────────┘ └─────────┘ └───────────┘
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd ai-agent-server
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. **Development:**
```bash
npm run dev
```

4. **Production build:**
```bash
npm run build
npm start
```

## API Usage

### Send Message to Agent
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are TypeScript best practices?",
    "session_id": "user-123"
  }'
```

### Weather Plugin Example
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather in Bangalore?",
    "session_id": "user-123"
  }'
```

### Math Plugin Example
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 2 + 2 * 5",
    "session_id": "user-123"
  }'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Plugin System

The agent supports extensible plugins that can be triggered based on message content:

### Available Plugins

1. **Weather Plugin** (`weatherPlugin.ts`)
   - Triggers on: weather-related queries with location
   - Example: "weather in Mumbai", "temperature in Delhi"
   - Uses OpenWeatherMap API (falls back to mock data)

2. **Math Plugin** (`mathPlugin.ts`)
   - Triggers on: mathematical expressions and calculations
   - Example: "2 + 2 * 5", "calculate 15 / 3"
   - Supports: +, -, *, /, %, parentheses

### Adding New Plugins

1. Extend `BasePlugin` class
2. Implement `canHandle()` and `execute()` methods
3. Register in `PluginManager`

## RAG System

The system includes 5 pre-seeded documents covering:
- Lightweight markup language overview and syntax comparison
- LLM-friendly content creation with Markdown best practices
- Building blogs with Next.js and React Markdown
- Custom markdown blog architecture and development
- Comprehensive markdown blogging guide with tools and techniques

### Vector Search Process
1. User message is embedded using OpenAI embeddings
2. Cosine similarity search finds top 3 relevant chunks
3. Retrieved context is injected into the LLM prompt

## Session Management

- Each session maintains conversation history
- Last 20 messages are kept per session
- Recent context (last 4 messages) is included in prompts
- Sessions are stored in-memory (consider Redis for production)

## Deployment

### Quick Deploy Options

#### Render (Recommended)
1. Fork this repository
2. Connect to Render
3. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: production
4. Deploy with build command: `npm run build` and start command: `npm start`

#### Railway
1. Connect repository to Railway
2. Set environment variables
3. Deploy automatically with included Dockerfile

#### Local Docker
```bash
docker build -t ai-agent-server .
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key ai-agent-server
```

### Environment Variables for Production
```bash
OPENAI_API_KEY=your_key_here          # Required
OPENWEATHER_API_KEY=optional_key      # Optional (uses mock data if not set)
PORT=3000                             # Optional (default: 3000)
NODE_ENV=production                   # Recommended for production
```

### Testing Deployment
```bash
# Install dependencies and test locally
npm install
npm run build
npm start

# In another terminal, run API tests
node test-api.js
```

## Response Format

```json
{
  "reply": "AI generated response incorporating context and plugin results",
  "session_id": "user-123",
  "plugins_used": ["weather", "math"],
  "retrieved_context": [
    {
      "content": "Relevant document chunk...",
      "similarity": 0.85,
      "metadata": {
        "title": "Document Title",
        "source": "document-source"
      }
    }
  ]
}
```

## System Monitoring

- Health check endpoint: `/health`
- Memory usage tracking in session manager
- Plugin execution success/failure tracking
- Vector store document count monitoring

## Development

### Project Structure
```
src/
├── index.ts              # Server entry point
├── types/               # TypeScript type definitions
├── services/            # Core business logic
│   ├── agentService.ts  # Main orchestration
│   ├── openai.ts        # LLM integration
│   ├── vectorStore.ts   # RAG implementation
│   └── sessionManager.ts # Memory management
├── plugins/             # Plugin system
│   ├── basePlugin.ts    # Plugin interface
│   ├── weatherPlugin.ts # Weather functionality
│   ├── mathPlugin.ts    # Math calculations
│   └── pluginManager.ts # Plugin orchestration
├── routes/              # API endpoints
└── utils/               # Utilities and seed data
```

### Key Design Decisions
- **In-memory storage**: Fast development, consider persistence for production
- **Custom vector search**: Using ml-distance for cosine similarity
- **Plugin architecture**: Easy to extend with new capabilities
- **Session-based memory**: Maintains conversation context
- **TypeScript throughout**: Type safety and better developer experience