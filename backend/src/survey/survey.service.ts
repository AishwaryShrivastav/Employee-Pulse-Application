import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Survey } from './schemas/survey.schema';
import { Response } from '../responses/schemas/response.schema';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { QuestionType } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<Survey>,
    @InjectModel(Response.name) private responseModel: Model<Response>,
  ) {}

  async findAll(): Promise<Survey[]> {
    return this.surveyModel.find().exec();
  }

  async findAllWithStats(): Promise<any[]> {
    const surveys = await this.surveyModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return surveys.map(survey => ({
      id: survey._id,
      title: survey.title,
      description: survey.description,
      questionCount: survey.questions.length,
      isActive: survey.isActive,
      createdAt: survey.createdAt,
    }));
  }

  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const createdSurvey = new this.surveyModel({
      ...createSurveyDto,
      createdAt: new Date(),
    });
    return createdSurvey.save();
  }

  async findOne(id: string): Promise<any> {
    console.log(`[SurveyService] Finding survey with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      console.error(`[SurveyService] Invalid ObjectId format: ${id}`);
      throw new BadRequestException(`Invalid survey ID format: ${id}`);
    }

    try {
      console.log(`[SurveyService] Querying database for ID: ${id}`);
      const survey = await this.surveyModel
        .findById(id)
        .select('title description questions createdAt isActive')
        .lean()
        .exec();

      if (!survey) {
        console.error(`[SurveyService] Survey not found for ID: ${id}`);
        throw new NotFoundException(`Survey with ID ${id} not found`);
      }

      console.log(`[SurveyService] Found survey: ${survey.title}`);
      
      // Map the questions with null checks
      const mappedQuestions = survey.questions.map((question: any, index: number) => {
        // Make sure question._id exists before calling toString()
        const questionId = question._id ? question._id.toString() : `question_${index}`;
        
        return {
          _id: questionId,
          id: questionId,
          index: index,
          text: question.text || `Question ${index + 1}`,
          type: question.type || 'text',
          options: question.options || [],
          required: question.required || false
        };
      });
      
      return {
        _id: survey._id.toString(),
        id: survey._id.toString(),
        title: survey.title,
        description: survey.description,
        createdAt: survey.createdAt,
        isActive: survey.isActive,
        totalQuestions: survey.questions.length,
        questions: mappedQuestions
      };
    } catch (error) {
      console.error(`[SurveyService] Error finding survey with ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch survey');
    }
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.surveyModel
      .findByIdAndUpdate(id, updateSurveyDto, { new: true })
      .exec();
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
  }

  async updateStatus(id: string, isActive: boolean): Promise<Survey> {
    const survey = await this.surveyModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
  }

  async remove(id: string): Promise<Survey> {
    const survey = await this.surveyModel.findByIdAndDelete(id).exec();
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
  }

  async getAvailableSurveysForUser(userId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      // Get all surveys
      const surveys = await this.surveyModel
        .find()
        .select('title description createdAt isActive questions')
        .lean()
        .exec();

      // Get user's responses
      const responses = await this.responseModel
        .find({ userId: new Types.ObjectId(userId) })
        .select('surveyId submittedAt')
        .lean()
        .exec();

      // Create a map of survey responses
      const responseMap = new Map(
        responses.map(response => [
          response.surveyId.toString(),
          {
            submitted: true,
            submittedAt: response.submittedAt,
          },
        ]),
      );

      // Combine surveys with response status
      return surveys.map(survey => {
        const response = responseMap.get(survey._id.toString());
        return {
          id: survey._id.toString(),
          title: survey.title,
          description: survey.description,
          createdAt: survey.createdAt,
          isActive: survey.isActive,
          questionCount: survey.questions.length,
          status: response ? 'Submitted' : 'Pending',
          submittedAt: response?.submittedAt || null,
        };
      });
    } catch (error) {
      console.error('Error getting available surveys:', error);
      throw new BadRequestException('Failed to fetch available surveys');
    }
  }

  async createDefaultSurvey(): Promise<Survey> {
    const defaultSurvey: CreateSurveyDto = {
      title: 'Employee Pulse Survey',
      description: 'Monthly employee satisfaction and engagement survey',
      questions: [
        {
          text: 'How satisfied are you with your current role?',
          type: QuestionType.RATING,
        },
        {
          text: 'How would you rate your work-life balance?',
          type: QuestionType.RATING,
        },
        {
          text: 'Do you feel supported by your manager?',
          type: QuestionType.RATING,
        },
        {
          text: 'What improvements would you suggest for the workplace?',
          type: QuestionType.TEXT,
        },
        {
          text: 'How likely are you to recommend working here to others?',
          type: QuestionType.RATING,
        },
      ],
    };

    const existingSurvey = await this.surveyModel.findOne({ title: defaultSurvey.title });
    if (!existingSurvey) {
      return this.create(defaultSurvey);
    }
    return existingSurvey;
  }
}
