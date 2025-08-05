import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRouter } from './routes/agent';
import { VectorStore } from './services/vectorStore';
import { seedDocuments } from './utils/seedData';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const setup = async () => {
  try {
    const store = VectorStore.getInstance();
    await seedDocuments(store);
    console.log('Vector store initialized and documents seeded');
  } catch (error) {
    console.error('Failed to initialize vector store:', error);
  }
};

app.use('/agent', agentRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`AI Agent Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Agent endpoint: http://localhost:${port}/agent/message`);
  setup();
});