import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from '../responses/schemas/response.schema';
import { Survey } from '../survey/schemas/survey.schema';
import { User } from '../users/schemas/user.schema';
import { subMonths, subDays } from 'date-fns';

@Injectable()
export class ResponsesSeedService {
  constructor(
    @InjectModel(Response.name) private responseModel: Model<Response>,
    @InjectModel(Survey.name) private surveyModel: Model<Survey>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async seed() {
    const count = await this.responseModel.countDocuments();
    if (count > 0) {
      console.log('Responses collection is not empty. Skipping seed.');
      return;
    }

    const surveys = await this.surveyModel.find().exec();
    if (surveys.length === 0) {
      console.log('No surveys found for seeding responses');
      return;
    }

    const users = await this.userModel.find().exec();
    const employeeUsers = users.filter(user => user.role === 'employee');
    
    if (employeeUsers.length === 0) {
      console.log('No employee users found for seeding responses');
      return;
    }

    console.log(`Seeding responses with ${surveys.length} surveys and ${employeeUsers.length} employees`);

    // Distribution of responses across time (last 6 months)
    // Create more responses for recent months to show increasing engagement
    const timeDistribution = [
      { months: 5, count: 3 },  // 5 months ago
      { months: 4, count: 5 },  // 4 months ago
      { months: 3, count: 8 },  // 3 months ago
      { months: 2, count: 12 }, // 2 months ago
      { months: 1, count: 15 }, // 1 month ago
      { months: 0, count: 20 }  // Current month
    ];

    let totalCreated = 0;

    // Create responses across the time distribution
    for (const timeSlot of timeDistribution) {
      console.log(`Creating responses for ${timeSlot.months} months ago`);
      
      // Generate base date for this time slot
      const baseDate = subMonths(new Date(), timeSlot.months);
      
      // Select a subset of surveys active during this period
      // For simplicity, we'll assume all surveys were active across all time periods
      const activeUsers = employeeUsers.sort(() => Math.random() - 0.5);
      
      // Create the desired number of responses for this time period
      for (let i = 0; i < timeSlot.count; i++) {
        // Rotate through users to ensure each user gets some responses
        const userId = activeUsers[i % activeUsers.length]._id;
        
        // Rotate through surveys
        const survey = surveys[i % surveys.length];
        
        // Randomize the day within the month
        const randomDay = Math.floor(Math.random() * 28); // Avoiding month end issues
        const submittedAt = subDays(baseDate, randomDay);
        
        // Generate realistic answers based on question type
        const answers = survey.questions.map((question, index) => {
          let value = '';
          
          // Generate different answer values based on question type
          if (question.type === 'rating') {
            // Generate a random rating between 1-5
            value = String(Math.floor(Math.random() * 5) + 1);
          } else if (question.type === 'choice' && question.options && question.options.length > 0) {
            // Select a random option from the available choices
            const randomIndex = Math.floor(Math.random() * question.options.length);
            value = question.options[randomIndex];
          } else {
            // Generate a text response
            const responses = [
              "Very satisfied with this aspect.",
              "Could use some improvement.",
              "Neutral feelings about this.",
              "This is working well for me.",
              "I think we need to reconsider this approach."
            ];
            value = responses[Math.floor(Math.random() * responses.length)];
          }
          
          return {
            questionIndex: index,
            value,
          };
        });

        const response = new this.responseModel({
          userId,
          surveyId: survey._id,
          answers,
          submittedAt,
        });

        try {
          const savedResponse = await response.save();
          totalCreated++;
          
          if (totalCreated % 10 === 0) {
            console.log(`Created ${totalCreated} responses so far...`);
          }
        } catch (error) {
          console.error(`Error creating response: ${error.message}`);
        }
      }
    }

    // Create a few responses from the last week for the "recent activity" metric
    const recentResponseCount = 8;
    console.log(`Creating ${recentResponseCount} very recent responses for the past week`);
    
    for (let i = 0; i < recentResponseCount; i++) {
      const userId = employeeUsers[i % employeeUsers.length]._id;
      const survey = surveys[i % surveys.length];
      const daysAgo = Math.floor(Math.random() * 7); // Within the last week
      const submittedAt = subDays(new Date(), daysAgo);
      
      const answers = survey.questions.map((question, index) => {
        return {
          questionIndex: index,
          value: question.type === 'rating' 
            ? String(Math.floor(Math.random() * 5) + 1) 
            : "Recent feedback response."
        };
      });

      const response = new this.responseModel({
        userId,
        surveyId: survey._id,
        answers,
        submittedAt,
      });

      try {
        await response.save();
        totalCreated++;
      } catch (error) {
        console.error(`Error creating recent response: ${error.message}`);
      }
    }

    const finalCount = await this.responseModel.countDocuments();
    console.log(`Responses seeded successfully. Created ${finalCount} responses.`);
  }
}
