import { similarity } from 'ml-distance';
import { Document, RetrievedChunk } from '../types';
import { GeminiService } from './gemini';

export class VectorStore {
  private static instance: VectorStore;
  private documents: Document[] = [];
  private geminiService: GeminiService;

  private constructor() {
    this.geminiService = new GeminiService();
  }

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  async addDocument(document: Omit<Document, 'embedding'>): Promise<void> {
    try {
      const embedding = await this.geminiService.generateEmbedding(document.content);
      this.documents.push({
        ...document,
        embedding,
      });
    } catch (error) {
      console.error('Error adding document to vector store:', error);
      throw error;
    }
  }

  async search(query: string, topK: number = 3): Promise<RetrievedChunk[]> {
    try {
      const queryEmbedding = await this.geminiService.generateEmbedding(query);
      
      const similarities = this.documents.map(doc => {
        if (!doc.embedding) return { doc, similarity: 0 };
        
        const cosineSimilarity = similarity.cosine(queryEmbedding, doc.embedding);
        return { doc, similarity: cosineSimilarity };
      });


      const topResults = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return topResults.map(({ doc, similarity }) => ({
        content: doc.content,
        similarity,
        metadata: {
          title: doc.metadata.title,
          source: doc.metadata.source,
        },
      }));
    } catch (error) {
      console.error('Error searching vector store:', error);
      throw error;
    }
  }

  getDocumentCount(): number {
    return this.documents.length;
  }
}