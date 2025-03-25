import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../src/users/schemas/user.schema';

describe('SurveyController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminJwtToken: string;
  let employeeJwtToken: string;
  let createdSurveyId: string;
  
  // Test users
  const adminUser = {
    name: 'Admin Test User',
    email: 'admin-test@example.com',
    password: 'admin123',
    role: UserRole.ADMIN,
  };
  
  const employeeUser = {
    name: 'Employee Test User',
    email: 'employee-test@example.com',
    password: 'employee123',
    role: UserRole.EMPLOYEE,
  };
  
  // Test survey
  const testSurvey = {
    title: 'E2E Test Survey',
    description: 'A survey created for E2E testing',
    questions: [
      {
        text: 'How would you rate your experience with our product?',
        type: 'RATING',
        options: ['1', '2', '3', '4', '5'],
        required: true,
      },
      {
        text: 'Any additional comments?',
        type: 'TEXT',
        options: [],
        required: false,
      },
    ],
    isActive: true,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = await moduleFixture.get(getConnectionToken());
    
    // Clean test data before tests
    await cleanupTestData();
    
    // Create test users
    await createTestUsers();
    
    // Get tokens for both users
    await getAuthTokens();
  });

  afterAll(async () => {
    await cleanupTestData();
    await connection.close();
    await app.close();
  });

  async function cleanupTestData() {
    if (connection) {
      // Remove test users if they exist
      const userCollection = connection.collection('users');
      await userCollection.deleteMany({ 
        email: { $in: [adminUser.email, employeeUser.email] } 
      });
      
      // Remove test surveys
      const surveyCollection = connection.collection('surveys');
      await surveyCollection.deleteMany({ title: testSurvey.title });
    }
  }

  async function createTestUsers() {
    const userCollection = connection.collection('users');
    
    // Create admin user
    await userCollection.insertOne({
      name: adminUser.name,
      email: adminUser.email,
      password: await bcrypt.hash(adminUser.password, 10),
      role: adminUser.role,
    });
    
    // Create employee user
    await userCollection.insertOne({
      name: employeeUser.name,
      email: employeeUser.email,
      password: await bcrypt.hash(employeeUser.password, 10),
      role: employeeUser.role,
    });
  }

  async function getAuthTokens() {
    // Get admin token
    const adminResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });
    
    adminJwtToken = adminResponse.body.access_token;
    
    // Get employee token
    const employeeResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: employeeUser.email,
        password: employeeUser.password,
      });
    
    employeeJwtToken = employeeResponse.body.access_token;
  }

  describe('Survey CRUD operations', () => {
    it('should create a new survey (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/surveys')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(testSurvey)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', testSurvey.title);
      expect(response.body).toHaveProperty('description', testSurvey.description);
      expect(response.body).toHaveProperty('questions');
      expect(response.body.questions.length).toBe(2);
      expect(response.body).toHaveProperty('isActive', true);
      expect(response.body).toHaveProperty('status', 'ACTIVE');
      expect(response.body).toHaveProperty('responseCount', 0);
      
      // Save created survey ID for subsequent tests
      createdSurveyId = response.body._id;
    });

    it('should return 403 when non-admin tries to create a survey', async () => {
      await request(app.getHttpServer())
        .post('/api/surveys')
        .set('Authorization', `Bearer ${employeeJwtToken}`)
        .send(testSurvey)
        .expect(403);
    });

    it('should get all surveys', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/surveys')
        .set('Authorization', `Bearer ${employeeJwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Find our test survey in the response
      const foundSurvey = response.body.find(s => s.title === testSurvey.title);
      expect(foundSurvey).toBeDefined();
      expect(foundSurvey._id).toBe(createdSurveyId);
    });

    it('should get a specific survey by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/surveys/${createdSurveyId}`)
        .set('Authorization', `Bearer ${employeeJwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', createdSurveyId);
      expect(response.body).toHaveProperty('title', testSurvey.title);
      expect(response.body.questions.length).toBe(2);
    });

    it('should update a survey (admin only)', async () => {
      const updateData = {
        title: 'Updated E2E Test Survey',
        description: 'This survey has been updated',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/surveys/${createdSurveyId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('_id', createdSurveyId);
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
      // Original fields should be preserved
      expect(response.body.questions.length).toBe(2);
    });

    it('should return 403 when non-admin tries to update a survey', async () => {
      await request(app.getHttpServer())
        .patch(`/api/surveys/${createdSurveyId}`)
        .set('Authorization', `Bearer ${employeeJwtToken}`)
        .send({ title: 'Attempted update' })
        .expect(403);
    });

    it('should delete a survey (admin only)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/surveys/${createdSurveyId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);

      // Verify survey is actually deleted
      await request(app.getHttpServer())
        .get(`/api/surveys/${createdSurveyId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(404);
    });

    it('should return 403 when non-admin tries to delete a survey', async () => {
      // First, create a new survey to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/surveys')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({
          ...testSurvey,
          title: 'Another Test Survey',
        })
        .expect(201);

      const newSurveyId = createResponse.body._id;

      // Attempt to delete as employee (should fail)
      await request(app.getHttpServer())
        .delete(`/api/surveys/${newSurveyId}`)
        .set('Authorization', `Bearer ${employeeJwtToken}`)
        .expect(403);

      // Verify survey still exists
      await request(app.getHttpServer())
        .get(`/api/surveys/${newSurveyId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);
        
      // Clean up - delete as admin
      await request(app.getHttpServer())
        .delete(`/api/surveys/${newSurveyId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);
    });
  });
}); 