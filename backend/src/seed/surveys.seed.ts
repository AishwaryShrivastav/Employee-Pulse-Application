import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey } from '../survey/schemas/survey.schema';

@Injectable()
export class SurveysSeedService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<Survey>,
  ) {}

  async seed() {
    // Check if surveys already exist
    const existingSurveys = await this.surveyModel.find().exec();
    if (existingSurveys.length > 0) {
      console.log('Surveys already exist, skipping seed...');
      return existingSurveys;
    }

    const surveys = [
      {
        title: 'Employee Satisfaction Survey',
        description: 'Help us understand your satisfaction with your role and work environment',
        questions: [
          {
            text: 'How satisfied are you with your current role?',
            type: 'rating',
            required: true,
          },
          {
            text: 'How would you rate your work-life balance?',
            type: 'rating',
            required: true,
          },
          {
            text: 'Do you feel supported by your manager?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What improvements would you suggest for the workplace?',
            type: 'text',
            required: false,
          },
          {
            text: 'How likely are you to recommend working here to others?',
            type: 'rating',
            required: true,
          },
        ],
        isActive: true,
      },
      {
        title: 'Team Collaboration Survey',
        description: 'Help us understand how well teams are collaborating',
        questions: [
          {
            text: 'How would you rate team communication?',
            type: 'rating',
            required: true,
          },
          {
            text: 'How effective are team meetings?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What tools would help improve team collaboration?',
            type: 'text',
            required: false,
          },
          {
            text: 'How well does your team handle conflicts?',
            type: 'rating',
            required: true,
          },
        ],
        isActive: true,
      },
      {
        title: 'Career Development Survey',
        description: 'Help us understand your career development needs',
        questions: [
          {
            text: 'How satisfied are you with your career growth opportunities?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What skills would you like to develop?',
            type: 'text',
            required: false,
          },
          {
            text: 'How would you rate the training and development programs?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What career path interests you most?',
            type: 'choice',
            options: ['Technical', 'Management', 'Project Management', 'Other'],
            required: true,
          },
        ],
        isActive: true,
      },
    ];

    const createdSurveys = await this.surveyModel.insertMany(surveys);
    console.log('Created surveys:', createdSurveys.length);
    return createdSurveys;
  }
} 