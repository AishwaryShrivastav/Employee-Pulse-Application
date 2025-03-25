import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response, ResponseDocument } from './schemas/response.schema';
import { Survey, SurveyDocument } from '../survey/schemas/survey.schema';
import { CreateResponseDto } from './dto/create-response.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  async create(createResponseDto: CreateResponseDto & { userId: string }): Promise<ResponseDocument> {
    try {
      // Validate userId and surveyId
      if (!Types.ObjectId.isValid(createResponseDto.userId)) {
        throw new BadRequestException('Invalid userId');
      }
      if (!Types.ObjectId.isValid(createResponseDto.surveyId)) {
        throw new BadRequestException('Invalid surveyId');
      }

      // Get the survey to validate questions
      const survey = await this.surveyModel.findById(createResponseDto.surveyId).exec();
      if (!survey) {
        throw new BadRequestException('Survey not found');
      }

      // Create a map of required questions
      const requiredQuestions = new Set(
        survey.questions
          .filter(q => q.required)
          .map((_, index) => index)
      );

      // Validate that all required questions are answered
      const answeredQuestions = new Set<number>(
        createResponseDto.answers.map(a => a.questionIndex)
      );

      const missingRequiredQuestions = Array.from(requiredQuestions)
        .filter(qIndex => !answeredQuestions.has(qIndex));

      if (missingRequiredQuestions.length > 0) {
        throw new BadRequestException('All required questions must be answered');
      }

      // Validate that all answered questions belong to the survey
      const validQuestionIndices = new Set(
        survey.questions.map((_, index) => index)
      );

      const invalidQuestions = createResponseDto.answers
        .filter(a => !validQuestionIndices.has(a.questionIndex));

      if (invalidQuestions.length > 0) {
        throw new BadRequestException('Invalid question indices provided');
      }

      // Create response with proper ObjectIds
      const createdResponse = new this.responseModel({
        userId: new Types.ObjectId(createResponseDto.userId),
        surveyId: new Types.ObjectId(createResponseDto.surveyId),
        answers: createResponseDto.answers.map(answer => ({
          questionIndex: answer.questionIndex,
          value: answer.value
        })),
        submittedAt: new Date()
      });

      return await createdResponse.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      console.error('Error creating response:', error);
      throw new BadRequestException('Failed to create survey response');
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [responses, total] = await Promise.all([
      this.responseModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('surveyId', 'title')
        .exec(),
      this.responseModel.countDocuments(),
    ]);

    return {
      responses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ResponseDocument> {
    const response = await this.responseModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('surveyId', 'title questions')
      .exec();

    if (!response) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }

    return response;
  }

  async findByUserId(userId: string): Promise<ResponseDocument[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    try {
      console.log(`Finding responses for user: ${userId}`);
      const responses = await this.responseModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate({
          path: 'surveyId',
          select: 'title questions',
          model: 'Survey'
        })
        .sort({ submittedAt: -1 }) // Sort by submission date, most recent first
        .exec();
      
      console.log(`Found ${responses.length} responses for user ${userId}`);
      
      // Ensure each response has the required fields
      const validResponses = responses.filter(response => {
        if (!response.surveyId) {
          console.warn(`Response ${response._id} has no surveyId`);
          return false;
        }
        return true;
      });

      return validResponses;
    } catch (error) {
      console.error('Error finding responses by userId:', error);
      throw new BadRequestException('Failed to fetch user responses');
    }
  }

  async findBySurveyId(surveyId: string): Promise<ResponseDocument[]> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new BadRequestException('Invalid survey ID');
    }
    try {
      console.log(`Finding responses for survey: ${surveyId}`);
      const responses = await this.responseModel
        .find({ surveyId: new Types.ObjectId(surveyId) })
        .populate({
          path: 'userId',
          select: 'name email',
          model: 'User'
        })
        .populate({
          path: 'surveyId',
          select: 'title questions',
          model: 'Survey'
        })
        .sort({ submittedAt: -1 }) // Sort by submission date, most recent first
        .exec();
      
      console.log(`Found ${responses.length} responses for survey ${surveyId}`);
      
      return responses;
    } catch (error) {
      console.error('Error finding responses by surveyId:', error);
      throw new BadRequestException('Failed to fetch survey responses');
    }
  }

  async exportToCSV(): Promise<string> {
    const responses = await this.responseModel
      .find()
      .populate('userId', 'name email')
      .populate('surveyId', 'title questions')
      .exec();

    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = ['User', 'Email', 'Survey', 'Submission Date', 'Answers'];
    const rows = responses.map(response => {
      const answers = response.answers
        .map(answer => {
          const question = response.surveyId['questions'][answer.questionIndex];
          return `${question?.text || 'Unknown Question'}: ${answer.value || 'No Answer'}`;
        })
        .join('; ');

      return [
        escapeCSV(response.userId?.['name'] || 'Unknown User'),
        escapeCSV(response.userId?.['email'] || 'Unknown Email'),
        escapeCSV(response.surveyId?.['title'] || 'Unknown Survey'),
        escapeCSV(response.submittedAt?.toISOString() || new Date().toISOString()),
        escapeCSV(answers),
      ];
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  async getSurveyStatusForUser(userId: string): Promise<Array<{ surveyId: string; submitted: boolean }>> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      const responses = await this.responseModel
        .find({ userId: new Types.ObjectId(userId) })
        .select('surveyId')
        .lean()
        .exec();

      const submittedSurveys = responses.map(response => ({
        surveyId: response.surveyId.toString(),
        submitted: true
      }));

      return submittedSurveys;
    } catch (error) {
      console.error('Error getting survey status:', error);
      throw new BadRequestException('Failed to get survey status');
    }
  }
}
