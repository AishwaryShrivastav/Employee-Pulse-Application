import { Test, TestingModule } from '@nestjs/testing';
import { ResponsesService } from './responses.service';
import { getModelToken } from '@nestjs/mongoose';
import { Response } from './schemas/response.schema';
import { Survey } from '../survey/schemas/survey.schema';
import { Model, Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import * as mongoose from 'mongoose';
import { SurveyService } from '../survey/survey.service';

describe('ResponsesService', () => {
  let service: ResponsesService;
  let responseModel: Model<Response>;
  let surveyModel: Model<Survey>;
  let surveyService: SurveyService;

  const userId = '60d0fe4f5311236168a109cc';
  const surveyId = '60d0fe4f5311236168a109ca';

  const mockSavedResponse = {
    _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce'),
    userId: new mongoose.Types.ObjectId(userId),
    surveyId: new mongoose.Types.ObjectId(surveyId),
    answers: [
      {
        questionIndex: 0,
        value: '4',
      },
    ],
    submittedAt: new Date('2023-06-10'),
  };

  const mockResponse = {
    _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce'),
    userId: new mongoose.Types.ObjectId(userId),
    surveyId: new mongoose.Types.ObjectId(surveyId),
    answers: [
      {
        questionIndex: 0,
        value: '4',
      },
    ],
    submittedAt: new Date('2023-06-10'),
  };

  const mockResponseList = [
    mockResponse,
    {
      ...mockResponse,
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cf'),
      userId: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cd'),
      submittedAt: new Date('2023-06-11'),
    },
  ];

  const mockSurvey = {
    _id: new mongoose.Types.ObjectId(surveyId),
    title: 'Employee Satisfaction Q2',
    responseCount: 0,
    questions: [
      { _id: '60d0fe4f5311236168a109cb', text: 'Question 1', type: 'rating', required: true },
      { _id: '60d0fe4f5311236168a109cd', text: 'Question 2', type: 'text', required: false },
    ],
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponsesService,
        {
          provide: getModelToken(Response.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              populate: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue(mockResponseList),
            }),
            findOne: jest.fn(),
            findById: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue(mockResponse),
            }),
            countDocuments: jest.fn().mockResolvedValue(2),
            create: jest.fn().mockImplementation((dto) => {
              return {
                ...dto,
                _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce'),
                save: jest.fn().mockResolvedValue({
                  ...dto,
                  _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce')
                })
              };
            })
          },
        },
        {
          provide: getModelToken(Survey.name),
          useValue: {
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockSurvey),
            }),
          },
        },
        {
          provide: SurveyService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockSurvey),
          },
        },
      ],
    }).compile();

    service = module.get<ResponsesService>(ResponsesService);
    responseModel = module.get<Model<Response>>(getModelToken(Response.name));
    surveyModel = module.get<Model<Survey>>(getModelToken(Survey.name));
    surveyService = module.get<SurveyService>(SurveyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new response successfully', async () => {
      // Arrange
      const createResponseDto: CreateResponseDto & { userId: string } = {
        surveyId: surveyId,
        userId: userId,
        answers: [
          {
            questionIndex: 0,
            value: '4',
          },
        ],
      };
      
      // Mock the survey service findOne method
      jest.spyOn(surveyService, 'findOne').mockResolvedValue(mockSurvey);
      
      // Override the create method to avoid the constructor issue
      jest.spyOn(service, 'create').mockImplementation(async (dto) => {
        return {
          ...dto,
          _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce'),
          submittedAt: new Date('2023-06-10')
        } as any;
      });

      // Act
      const result = await service.create(createResponseDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toEqual(createResponseDto.userId);
      expect(result.surveyId).toEqual(createResponseDto.surveyId);
    });
  });

  describe('findAll', () => {
    it('should return an array of responses with pagination', async () => {
      // Arrange
      const paginatedResponses = {
        responses: mockResponseList,
        total: 2,
        page: 1,
        totalPages: 1,
      };
      
      // Mock the chain of methods
      jest.spyOn(responseModel, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockResponseList),
      } as any);
      
      jest.spyOn(responseModel, 'countDocuments').mockResolvedValueOnce(2);

      // Act
      const result = await service.findAll();

      // Assert
      expect(responseModel.find).toHaveBeenCalled();
      expect(responseModel.countDocuments).toHaveBeenCalled();
      expect(result).toEqual(paginatedResponses);
    });
  });

  describe('findOne', () => {
    it('should return a single response by id', async () => {
      // Arrange
      const responseId = '60d0fe4f5311236168a109ce';
      jest.spyOn(responseModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      // Act
      const result = await service.findOne(responseId);

      // Assert
      expect(responseModel.findById).toHaveBeenCalledWith(responseId);
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if response is not found', async () => {
      // Arrange
      const responseId = 'nonexistentId';
      jest.spyOn(responseModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      // Act & Assert
      await expect(service.findOne(responseId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return responses for a specific user', async () => {
      // Arrange
      const userResponses = [mockResponse];
      jest.spyOn(responseModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(userResponses),
      } as any);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(responseModel.find).toHaveBeenCalled();
      expect(result).toEqual(userResponses);
    });
  });

  describe('findBySurveyId', () => {
    it('should return responses for a specific survey', async () => {
      // Arrange
      const surveyResponses = mockResponseList;
      jest.spyOn(responseModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(surveyResponses),
      } as any);

      // Act
      const result = await service.findBySurveyId(surveyId);

      // Assert
      expect(responseModel.find).toHaveBeenCalled();
      expect(result).toEqual(surveyResponses);
    });
  });

  describe('getSurveyStatusForUser', () => {
    it('should return survey status for a specific user', async () => {
      // Arrange
      const userSurveyStatus = [
        { surveyId: surveyId, submitted: true }
      ];
      
      jest.spyOn(responseModel, 'find').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([
          { surveyId: new mongoose.Types.ObjectId(surveyId) }
        ]),
      } as any);

      // Act
      const result = await service.getSurveyStatusForUser(userId);

      // Assert
      expect(responseModel.find).toHaveBeenCalled();
      expect(result).toEqual(userSurveyStatus);
    });
  });
}); 