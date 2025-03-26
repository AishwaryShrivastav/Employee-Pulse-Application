db = db.getSiblingDB('admin')

try {
  db.createUser({
    user: 'admin',
    pwd: 'secure_password_here',
    roles: [
      { role: 'root', db: 'admin' },
      { role: 'userAdminAnyDatabase', db: 'admin' },
      { role: 'readWriteAnyDatabase', db: 'admin' }
    ]
  })
} catch (error) {
  if (!error.message.includes('already exists')) {
    throw error;
  }
}

db = db.getSiblingDB('employee_pulse')

// Create sample users
const user1Id = new ObjectId();
const user2Id = new ObjectId();
const user3Id = new ObjectId();
const adminId = new ObjectId();
const surveyId = new ObjectId();

try {
  // Create admin user first
  db.users.insertOne({
    _id: adminId,
    name: "Admin User",
    email: "admin@example.com",
    // Using a pre-hashed password for 'admin123'
    password: "$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/S6XxjJFJTau.K6",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Create sample employee users
  db.users.insertMany([
    {
      _id: user1Id,
      name: "John Smith",
      email: "john.smith@example.com",
      // Pre-hashed password for 'employee123'
      password: "$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/S6XxjJFJTau.K6",
      role: "employee",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: user2Id,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/S6XxjJFJTau.K6",
      role: "employee",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: user3Id,
      name: "Bob Wilson",
      email: "bob.wilson@example.com",
      password: "$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/S6XxjJFJTau.K6",
      role: "employee",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Create sample surveys
  db.surveys.insertMany([
    {
      _id: surveyId,
      title: "Employee Satisfaction Survey",
      description: "Monthly employee satisfaction survey",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Create sample survey responses
  db.surveyresponses.insertMany([
    {
      userId: user1Id.toString(),
      surveyId: surveyId.toString(),
      satisfaction: 4,
      workLifeBalance: 3,
      teamCollaboration: 5,
      feedback: "Great work environment but could use more flexible hours",
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      userId: user2Id.toString(),
      surveyId: surveyId.toString(),
      satisfaction: 5,
      workLifeBalance: 4,
      teamCollaboration: 4,
      feedback: "Love the team spirit and collaborative culture",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      userId: user3Id.toString(),
      surveyId: surveyId.toString(),
      satisfaction: 3,
      workLifeBalance: 2,
      teamCollaboration: 4,
      feedback: "Project deadlines are tight, need better work-life balance",
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Create indexes
  db.surveyresponses.createIndex({ userId: 1 });
  db.surveyresponses.createIndex({ surveyId: 1 });
  db.surveyresponses.createIndex({ submittedAt: -1 });
  db.users.createIndex({ email: 1 }, { unique: true });

  print('Successfully initialized database with sample data');
} catch (error) {
  print('Error initializing database:', error.message);
  throw error;
} 