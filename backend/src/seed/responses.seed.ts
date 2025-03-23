import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from '../responses/schemas/response.schema';
import { User } from '../users/schemas/user.schema';
import { Survey } from '../survey/schemas/survey.schema';

interface Question {
  text: string;
  type: string;
  options?: string[];
  required: boolean;
}

@Injectable()
export class ResponsesSeedService {
  constructor(
    @InjectModel(Response.name) private responseModel: Model<Response>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Survey.name) private surveyModel: Model<Survey>,
  ) {}

  async seed(): Promise<void> {
    // Check if responses already exist
    const existingResponses = await this.responseModel.find().exec();
    if (existingResponses.length > 0) {
      console.log('Responses already exist, skipping seed...');
      return;
    }

    // Get users and surveys
    const users = await this.userModel.find().exec();
    const surveys = await this.surveyModel.find().exec();

    const responses: any[] = [];
    const employeeUsers = users.filter(user => user.role === 'employee');

    // Create responses for each survey from each employee
    for (const survey of surveys) {
      for (const user of employeeUsers) {
        // Generate random answers based on question type
        const answers = survey.questions.map((question: Question, index: number) => {
          let value: string | number;

          switch (question.type) {
            case 'rating':
              value = Math.floor(Math.random() * 5) + 1; // Random rating 1-5
              break;
            case 'choice':
              if (question.options && question.options.length > 0) {
                value = question.options[Math.floor(Math.random() * question.options.length)];
              } else {
                value = 'No options available';
              }
              break;
            case 'text':
              value = `Sample response for ${question.text}`;
              break;
            default:
              value = '';
          }

          return {
            questionIndex: index,
            value,
          };
        });

        responses.push({
          userId: user._id,
          surveyId: survey._id,
          answers,
          submittedAt: new Date(),
        });
      }
    }

    const createdResponses = await this.responseModel.insertMany(responses);
    console.log('Created responses:', createdResponses.length);
  }
}
