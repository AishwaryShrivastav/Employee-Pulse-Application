import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SurveyResponse } from '../schemas/survey-response.schema';

@Injectable()
export class OpenAIService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    } else {
      this.logger.warn('OpenAI API key not configured');
    }
  }

  async generateSurveyInsights(surveyResponses: SurveyResponse[]): Promise<{ insights: string; isEnabled: boolean }> {
    if (!this.openai) {
      return { insights: '', isEnabled: false };
    }

    try {
      // Prepare survey data for analysis
      const surveyData = surveyResponses.map(response => ({
        satisfaction: response.satisfaction,
        workLifeBalance: response.workLifeBalance,
        teamCollaboration: response.teamCollaboration,
        feedback: response.feedback,
      }));

      const prompt = `Analyze this employee survey data and provide a concise 2-line insight about the overall employee sentiment and key areas of focus: ${JSON.stringify(surveyData)}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an HR analytics expert. Provide brief, actionable insights from employee survey data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return { 
        insights: completion.choices[0].message.content || 'No insights available.',
        isEnabled: true
      };
    } catch (error) {
      this.logger.error('Error generating insights:', error);
      return { 
        insights: 'Unable to generate insights at this time.',
        isEnabled: true
      };
    }
  }
} 