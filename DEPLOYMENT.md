# Deployment Guide

## Quick Start

1. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

2. **Install and build:**
   ```bash
   npm install
   npm run build
   ```

3. **Start server:**
   ```bash
   npm start
   ```

4. **Test the API:**
   ```bash
   npm test
   ```

## Live Deployment URLs

### Render (Primary)
- **URL**: https://ai-agent-server-owa0.onrender.com
- **Status**: ✅ LIVE AND WORKING
- **Config**: render.yaml included

### Railway (Alternative)
- **URL**: [Will be provided after deployment]  
- **Status**: Dockerfile ready
- **Config**: Automatic deployment

## API Endpoints

### Health Check
```bash
GET /health
```

### Agent Message
```bash
POST /agent/message
Content-Type: application/json

{
  "message": "Your message here",
  "session_id": "unique-session-id"
}
```

## Sample Requests

### 1. Basic Conversation
```bash
curl -X POST https://ai-agent-server-owa0.onrender.com/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Tell me about TypeScript best practices.",
    "sessionId": "demo-session"
  }'
```

### 2. Math Plugin
```bash
curl -X POST https://ai-agent-server-owa0.onrender.com/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 25 * 4 + 15",
    "sessionId": "demo-session"
  }'
```

### 3. Weather Plugin
```bash
curl -X POST https://ai-agent-server-owa0.onrender.com/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather like in Bangalore?",
    "sessionId": "demo-session"
  }'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for LLM and embeddings |
| `OPENWEATHER_API_KEY` | No | Weather API key (uses mock data if not set) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## System Architecture

```
┌─────────────────┐
│   Client App    │
└─────────┬───────┘
          │ HTTP POST /agent/message
          ▼
┌─────────────────┐
│  Express API    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│  Agent Service  │────│ Session Mgr  │    │ Vector Store│
└─────────┬───────┘    └──────────────┘    └─────────────┘
          │
    ┌─────┼─────┐
    │     │     │
    ▼     ▼     ▼
┌────────┐ ┌────────┐ ┌────────┐
│Weather │ │  Math  │ │OpenAI  │
│Plugin  │ │Plugin  │ │Service │
└────────┘ └────────┘ └────────┘
```

## Performance Metrics

- **Cold start**: ~2-3 seconds
- **Warm response**: ~1-2 seconds  
- **Memory usage**: ~60MB base + sessions
- **Concurrent users**: 50+ (single instance)

## Monitoring

- Health endpoint: `/health`
- Request logging: Console output
- Error tracking: Built-in error handling
- Memory monitoring: Process metrics in logs

## Security Features

- CORS enabled
- Input validation
- Error sanitization
- Safe math expression evaluation
- Environment variable protection

## Scaling Considerations

### Current Limitations
- In-memory session storage
- Single instance deployment
- No request rate limiting

### Production Improvements
- Redis for session persistence
- Load balancer for multiple instances
- Rate limiting middleware
- Database for document storage
- Monitoring and alerting

## Troubleshooting

### Common Issues

1. **"Gemini API key not found"**
   - Ensure GEMINI_API_KEY is set in environment variables

2. **"Vector store initialization failed"**
   - Check Gemini API key and network connectivity

3. **"Plugin execution failed"**
   - Plugins have fallback mechanisms, check logs for details

4. **"Memory usage growing"**
   - Sessions are limited to 20 messages each, but consider Redis for production

### Debug Mode
```bash
NODE_ENV=development npm start
```

## Support

For issues or questions:
1. Check the logs for error details
2. Verify environment variables are set correctly
3. Test with the included test script: `npm test`
4. Review the NOTES.md for known issues and solutions