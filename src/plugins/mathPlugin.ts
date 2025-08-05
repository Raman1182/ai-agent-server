import { BasePlugin } from './basePlugin';

export class MathPlugin extends BasePlugin {
  name = 'math';
  description = 'Evaluate mathematical expressions';

  canHandle(message: string): boolean {
    const patterns = [
      /\d+\s*[\+\-\*\/\%]\s*\d+/,
      /calculate|compute|solve|math|evaluate/i,
      /what\s+is\s+\d+/i,
    ];
    
    return patterns.some(pattern => pattern.test(message));
  }

  async execute(message: string): Promise<any> {
    try {
      const expr = this.extractExpression(message);
      if (!expr) {
        return { error: 'Could not extract mathematical expression' };
      }

      const result = this.evaluate(expr);
      
      return {
        expression: expr,
        result: result,
        explanation: `${expr} = ${result}`
      };
    } catch (error) {
      return { 
        error: 'Failed to evaluate mathematical expression',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractExpression(message: string): string | null {
    const patterns = [
      /(?:calculate|compute|solve|what\s+is)\s+(.+?)(?:\?|$)/i,
      /(\d+(?:\.\d+)?\s*[\+\-\*\/\%\^]\s*\d+(?:\.\d+)?(?:\s*[\+\-\*\/\%\^]\s*\d+(?:\.\d+)?)*)/,
      /(\d+\s*[\+\-\*\/\%]\s*\d+)/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private evaluate(expression: string): number {
    const clean = expression
      .replace(/[^0-9+\-*/().\s]/g, '')
      .replace(/\s+/g, '');

    if (!/^[0-9+\-*/().\s]+$/.test(clean)) {
      throw new Error('Invalid mathematical expression');
    }

    try {
      let safe = clean
        .replace(/\^/g, '**')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      const result = new Function('return ' + safe)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }

      return Math.round(result * 1000000) / 1000000;
    } catch (error) {
      throw new Error('Failed to evaluate expression');
    }
  }
}