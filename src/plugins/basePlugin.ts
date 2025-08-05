export abstract class BasePlugin {
  abstract name: string;
  abstract description: string;

  abstract canHandle(message: string): boolean;
  abstract execute(message: string): Promise<any>;

  protected extractQuery(message: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return null;
  }
}