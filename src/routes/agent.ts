import { Router, Request, Response } from 'express';
import { AgentService } from '../services/agentService';
import { AgentRequest } from '../types';

const router = Router();
let service: AgentService | null = null;

const getService = () => {
  if (!service) {
    service = new AgentService();
  }
  return service;
};

router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, sessionId }: AgentRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        error: 'Session ID is required and must be a string',
      });
    }

    const response = await getService().processMessage({ message, sessionId });

    res.json(response);
  } catch (error) {
    console.error('Error processing agent message:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as agentRouter };