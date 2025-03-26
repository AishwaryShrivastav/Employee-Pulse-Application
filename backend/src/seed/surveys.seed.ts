import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey } from '../survey/schemas/survey.schema';

@Injectable()
export class SurveysSeedService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<Survey>) {}

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
        status: 'Pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
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
        status: 'Pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
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
        status: 'Pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        title: 'Work Environment Survey',
        description: 'Help us improve your workspace and environment',
        questions: [
          {
            text: 'How comfortable is your workspace?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What office amenities would you like to see?',
            type: 'text',
            required: false,
          },
          {
            text: 'How satisfied are you with the office location?',
            type: 'rating',
            required: true,
          },
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      {
        title: 'Technology Tools Survey',
        description: 'Help us understand your technology needs',
        questions: [
          {
            text: 'How satisfied are you with your current tools?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What software would help improve your productivity?',
            type: 'text',
            required: false,
          },
          {
            text: 'How would you rate IT support?',
            type: 'rating',
            required: true,
          },
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      // Submitted surveys
      {
        title: 'Previous Engagement Survey',
        description: 'Past survey for testing completed state',
        questions: [
          {
            text: 'How engaged do you feel at work?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What aspects of your work do you find most engaging?',
            type: 'text',
            required: true,
          },
        ],
        isActive: true,
        status: 'Submitted',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // Submitted 8 days ago
      },
      {
        title: 'Q1 Feedback Survey',
        description: 'Quarterly feedback survey',
        questions: [
          {
            text: 'How would you rate this quarter?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What were your key achievements?',
            type: 'text',
            required: true,
          },
          {
            text: 'What challenges did you face?',
            type: 'text',
            required: true,
          },
        ],
        isActive: true,
        status: 'Submitted',
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Submitted 15 days ago
      },
      // New open surveys
      {
        title: 'Remote Work Experience Survey',
        description: 'Help us understand your remote work experience and needs',
        questions: [
          {
            text: 'How productive do you feel working remotely?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What remote work tools would improve your productivity?',
            type: 'text',
            required: false,
          },
          {
            text: 'How well do you maintain work-life balance when working remotely?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What challenges do you face with remote work?',
            type: 'text',
            required: true,
          }
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      },
      {
        title: 'Mental Health and Wellness Survey',
        description: 'Help us support your mental health and well-being',
        questions: [
          {
            text: 'How would you rate your current stress levels?',
            type: 'rating',
            required: true,
          },
          {
            text: 'Do you feel you have a good work-life balance?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What wellness programs would you be interested in?',
            type: 'text',
            required: false,
          },
          {
            text: 'How supported do you feel by your team during challenging times?',
            type: 'rating',
            required: true,
          }
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      },
      {
        title: 'Professional Development Goals',
        description: 'Share your career aspirations and development needs',
        questions: [
          {
            text: 'What skills would you like to develop in the next 6 months?',
            type: 'text',
            required: true,
          },
          {
            text: 'How satisfied are you with your current growth opportunities?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What type of training would be most beneficial for you?',
            type: 'choice',
            options: ['Technical Skills', 'Leadership', 'Soft Skills', 'Industry Knowledge'],
            required: true,
          }
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      },
      {
        title: 'Office Equipment and Ergonomics',
        description: 'Help us ensure you have the right equipment for comfortable work',
        questions: [
          {
            text: 'How comfortable is your current work setup?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What equipment would improve your work setup?',
            type: 'text',
            required: true,
          },
          {
            text: 'Do you experience any physical discomfort while working?',
            type: 'rating',
            required: true,
          }
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      },
      {
        title: 'Team Communication Feedback',
        description: 'Help us improve team communication and collaboration',
        questions: [
          {
            text: 'How effective are our current communication channels?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What communication tools would you recommend?',
            type: 'text',
            required: false,
          },
          {
            text: 'How satisfied are you with the frequency of team meetings?',
            type: 'rating',
            required: true,
          },
          {
            text: 'What suggestions do you have for improving team collaboration?',
            type: 'text',
            required: true,
          }
        ],
        isActive: true,
        status: 'Pending',
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
      }
    ];

    const createdSurveys = await this.surveyModel.insertMany(surveys);
    console.log('Created surveys:', createdSurveys.length);
    return createdSurveys;
  }
}
