import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
  const uri = 'mongodb://root:example@mongodb:27017/employee-pulse?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('employee-pulse');
    const users = db.collection('users');

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if user already exists
    const existingUser = await users.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Insert the test user
    const result = await users.insertOne(testUser);
    console.log('Test user created with ID:', result.insertedId);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await client.close();
  }
}

createTestUser(); 