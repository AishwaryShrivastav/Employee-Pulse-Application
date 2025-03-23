import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey } from './schemas/survey.schema';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { QuestionType } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<Survey>) {}

  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const createdSurvey = new this.surveyModel(createSurveyDto);
    return createdSurvey.save();
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyModel.find().exec();
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyModel.findById(id).exec();
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
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

  async remove(id: string): Promise<Survey> {
    const survey = await this.surveyModel.findByIdAndDelete(id).exec();
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
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
        }
      ],
    };

    const existingSurvey = await this.surveyModel.findOne({ title: defaultSurvey.title });
    if (!existingSurvey) {
      return this.create(defaultSurvey);
    }
    return existingSurvey;
  }
} 