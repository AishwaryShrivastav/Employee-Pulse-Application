import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response, ResponseDocument } from './schemas/response.schema';
import { CreateResponseDto } from './dto/create-response.dto';

@Injectable()
export class ResponsesService {
  constructor(@InjectModel(Response.name) private responseModel: Model<ResponseDocument>) {}

  async create(createResponseDto: CreateResponseDto): Promise<ResponseDocument> {
    const createdResponse = new this.responseModel(createResponseDto);
    return createdResponse.save();
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
    return this.responseModel
      .find({ userId })
      .populate('surveyId', 'title')
      .exec();
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

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }
} 