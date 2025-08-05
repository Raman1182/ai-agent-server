import { BasePlugin } from './basePlugin';
import { WeatherPlugin } from './weatherPlugin';
import { MathPlugin } from './mathPlugin';
import { PluginResult } from '../types';

export class PluginManager {
  private static instance: PluginManager;
  private plugins: BasePlugin[] = [];

  private constructor() {
    this.registerPlugins();
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  private registerPlugins(): void {
    this.plugins = [
      new WeatherPlugin(),
      new MathPlugin(),
    ];
  }

  async executePlugins(message: string): Promise<PluginResult[]> {
    const results: PluginResult[] = [];

    for (const plugin of this.plugins) {
      if (plugin.canHandle(message)) {
        try {
          const result = await plugin.execute(message);
          results.push({
            name: plugin.name,
            result,
            success: true,
          });
        } catch (error) {
          results.push({
            name: plugin.name,
            result: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return results;
  }

  getAvailablePlugins(): { name: string; description: string }[] {
    return this.plugins.map(plugin => ({
      name: plugin.name,
      description: plugin.description,
    }));
  }
}