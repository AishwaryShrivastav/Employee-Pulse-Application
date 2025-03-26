import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SurveyResponse } from '../schemas/survey-response.schema';

interface ProcessedSurveyData {
  satisfaction: number;
  workLifeBalance: number;
  teamCollaboration: number;
  feedback?: string;
  submittedAt: string;
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(OpenAIService.name);
  private readonly MAX_RESPONSES = 10; // Maximum number of responses to analyze at once
  private readonly MAX_FEEDBACK_LENGTH = 200; // Maximum length of feedback text
  private readonly MAX_TOKENS = 4096; // GPT-3.5-turbo context window
  private readonly RESPONSE_TOKENS = 100; // Reserved tokens for response

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.logger.debug(`OpenAI API key status: ${apiKey ? 'Present' : 'Not found'}`);
    
    if (!apiKey) {
      this.logger.warn('OpenAI API key is not set in environment variables');
      return;
    }

    if (apiKey === 'your_openai_api_key_here') {
      this.logger.warn('OpenAI API key is set to default placeholder value');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.logger.log('OpenAI service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI service:', error);
    }
  }

  // Estimate tokens in a string (rough approximation)
  private estimateTokens(text: string): number {
    // GPT models typically use ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  // Prepare survey data with token limits in mind
  private prepareSurveyData(surveyResponses: SurveyResponse[]): ProcessedSurveyData[] {
    try {
      // Take only the most recent responses if there are too many
      const limitedResponses = surveyResponses
        .filter(response => 
          response.satisfaction && 
          response.workLifeBalance && 
          response.teamCollaboration
        )
        .sort((a, b) => {
          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, this.MAX_RESPONSES);

      return limitedResponses.map(response => ({
        satisfaction: Number(response.satisfaction) || 0,
        workLifeBalance: Number(response.workLifeBalance) || 0,
        teamCollaboration: Number(response.teamCollaboration) || 0,
        feedback: response.feedback?.substring(0, this.MAX_FEEDBACK_LENGTH),
        submittedAt: response.submittedAt 
          ? new Date(response.submittedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      }));
    } catch (error) {
      this.logger.error('Error preparing survey data:', error);
      return [];
    }
  }

  async generateSurveyInsights(surveyResponses: SurveyResponse[]): Promise<{ insights: string; isEnabled: boolean }> {
    if (!this.openai) {
      this.logger.warn('OpenAI service is not initialized, insights will be disabled');
      return { insights: '', isEnabled: false };
    }

    if (!Array.isArray(surveyResponses) || surveyResponses.length === 0) {
      this.logger.warn('No survey responses available for analysis');
      return { insights: 'No survey responses available for analysis.', isEnabled: true };
    }

    try {
      // Prepare survey data with limits
      const surveyData = this.prepareSurveyData(surveyResponses);
      
      if (surveyData.length === 0) {
        this.logger.warn('No valid survey responses after processing');
        return { insights: 'No valid survey responses available for analysis.', isEnabled: true };
      }

      const totalResponses = surveyResponses.length;
      this.logger.debug(`Analyzing ${surveyData.length} out of ${totalResponses} survey responses`);

      // Construct the prompt with response count context
      const promptContext = totalResponses > this.MAX_RESPONSES 
        ? `Analyze the ${surveyData.length} most recent responses out of ${totalResponses} total responses` 
        : `Analyze these ${surveyData.length} survey responses`;

      const prompt = `${promptContext} and provide a concise 2-line insight about the overall employee sentiment and key areas of focus: ${JSON.stringify(surveyData)}`;

      // Check if prompt might exceed token limit
      const estimatedTokens = this.estimateTokens(prompt) + this.RESPONSE_TOKENS;
      if (estimatedTokens > this.MAX_TOKENS) {
        this.logger.warn(`Estimated tokens (${estimatedTokens}) exceeds limit, reducing data`);
        // Reduce the data further if needed
        surveyData.length = Math.floor(surveyData.length / 2);
        const reducedPrompt = `${promptContext} and provide a concise 2-line insight about the overall employee sentiment and key areas of focus: ${JSON.stringify(surveyData)}`;
        
        if (this.estimateTokens(reducedPrompt) + this.RESPONSE_TOKENS > this.MAX_TOKENS) {
          throw new Error('Token limit would be exceeded even with reduced data');
        }
      }

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
        max_tokens: this.RESPONSE_TOKENS,
        temperature: 0.7,
      });

      const insights = completion.choices[0]?.message?.content || 'No insights available.';
      this.logger.debug('Successfully generated insights');
      return { insights, isEnabled: true };
    } catch (error: any) {
      this.logger.error('Error generating insights:', error);
      
      // Handle rate limit errors specifically
      if (error?.error?.type === 'insufficient_quota' || error?.error?.code === 'insufficient_quota') {
        return { 
          insights: 'AI insights are temporarily unavailable due to API quota limits. Please try again later.',
          isEnabled: false
        };
      }

      // Handle token limit errors
      if (error.message === 'Token limit would be exceeded even with reduced data') {
        return {
          insights: 'Unable to generate insights due to data size limitations. Please try again later.',
          isEnabled: false
        };
      }
      
      // Handle other errors
      return { 
        insights: 'Unable to generate insights at this time. Please try again later.',
        isEnabled: true
      };
    }
  }
} 