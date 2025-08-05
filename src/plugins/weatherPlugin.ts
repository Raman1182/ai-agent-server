import axios from 'axios';
import { BasePlugin } from './basePlugin';

export class WeatherPlugin extends BasePlugin {
  name = 'weather';
  description = 'Get weather information for a location';

  canHandle(message: string): boolean {
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate'];
    const locationKeywords = ['in', 'at', 'for'];
    
    const hasWeatherKeyword = weatherKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    const hasLocationKeyword = locationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    return hasWeatherKeyword && hasLocationKeyword;
  }

  async execute(message: string): Promise<any> {
    try {
      const location = this.extractLocation(message);
      if (!location) {
        return { error: 'Could not extract location from message' };
      }

      const key = process.env.OPENWEATHER_API_KEY;
      if (!key) {
        return this.getMockWeatherData(location);
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}&units=metric`
      );

      const data = response.data;
      return {
        location: data.name,
        temperature: `${data.main.temp}°C`,
        description: data.weather[0].description,
        humidity: `${data.main.humidity}%`,
        windSpeed: `${data.wind.speed} m/s`,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData(this.extractLocation(message) || 'Unknown');
    }
  }

  private extractLocation(message: string): string | null {
    const patterns = [
      /weather (?:in|at|for) ([^?.,!]+)/i,
      /(?:in|at|for) ([^?.,!]+) weather/i,
      /temperature (?:in|at|for) ([^?.,!]+)/i,
    ];
    
    const location = this.extractQuery(message, patterns);
    return location?.trim() || null;
  }

  private getMockWeatherData(location: string) {
    const mockData: Record<string, { temp: number; desc: string; humidity: number }> = {
      'bangalore': { temp: 24, desc: 'partly cloudy', humidity: 65 },
      'mumbai': { temp: 28, desc: 'humid and warm', humidity: 78 },
      'delhi': { temp: 22, desc: 'clear sky', humidity: 45 },
      'default': { temp: 25, desc: 'pleasant weather', humidity: 60 }
    };

    const data = mockData[location.toLowerCase()] || mockData.default;
    
    return {
      location: location,
      temperature: `${data.temp}°C`,
      description: data.desc,
      humidity: `${data.humidity}%`,
      windSpeed: '3.2 m/s',
      note: 'Mock data - set OPENWEATHER_API_KEY for real data'
    };
  }
}