import { Session, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, Session> = new Map();

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  getOrCreateSession(sessionId: string): Session {
    if (!this.sessions.has(sessionId)) {
      const session: Session = {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sessions.set(sessionId, session);
    }
    return this.sessions.get(sessionId)!;
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.getOrCreateSession(sessionId);
    session.messages.push(message);
    session.updatedAt = new Date();
    

    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }
  }

  getRecentMessages(sessionId: string, count: number = 4): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    
    return session.messages.slice(-count);
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}