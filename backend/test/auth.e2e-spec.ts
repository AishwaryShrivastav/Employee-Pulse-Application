import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtToken: string;
  
  // Test user credentials
  const testUser = {
    name: 'E2E Test User',
    email: 'e2e-test@example.com',
    password: 'test123',
    hashedPassword: '',
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
    
    // Hash the password
    testUser.hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Clean test data before tests
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await connection.close();
    await app.close();
  });

  async function cleanupTestData() {
    // Remove test user if exists
    if (connection) {
      const userCollection = connection.collection('users');
      await userCollection.deleteOne({ email: testUser.email });
    }
  }

  describe('POST /api/auth/register', () => {
    it('should register a new user and return JWT token with user info', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('role', 'EMPLOYEE');
      expect(response.body.user).not.toHaveProperty('password');
      
      // Save token for subsequent auth tests
      jwtToken = response.body.access_token;
    });

    it('should return 409 when trying to register with existing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: testUser.email, // Same email as already registered user
          password: 'password123',
        })
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 when missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Incomplete User',
          // Missing email
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate a user and return JWT token with user info', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Save token for subsequent auth tests (refresh it)
      jwtToken = response.body.access_token;
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 for non-existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return the authenticated user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('role', 'EMPLOYEE');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Unauthorized');
    });
  });
}); 