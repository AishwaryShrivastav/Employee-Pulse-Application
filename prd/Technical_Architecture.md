# Employee Pulse Application - Technical Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         Client Devices                              │
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐       │
│  │  Web Browser  │    │  Web Browser  │    │  Web Browser  │       │
│  │   (Employee)  │    │    (Admin)    │    │     (HR)      │       │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘       │
│          │                    │                    │               │
└──────────┼────────────────────┼────────────────────┼───────────────┘
           │                    │                    │
           │      HTTPS/SSL     │                    │
           │                    │                    │
┌──────────┼────────────────────┼────────────────────┼───────────────┐
│          │                    │                    │               │
│  ┌───────▼────────────────────▼────────────────────▼───────┐       │
│  │                                                          │       │
│  │                    Frontend Application                  │       │
│  │                  (React.js + TypeScript)                 │       │
│  │                                                          │       │
│  └────────────────────────────┬─────────────────────────────┘       │
│                               │                                     │
│                        REST API Calls                               │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                               │                                     │
│  ┌────────────────────────────▼─────────────────────────────┐       │
│  │                                                          │       │
│  │                   Backend Application                    │       │
│  │                    (NestJS + Node.js)                    │       │
│  │                                                          │       │
│  └──┬─────────────────┬─────────────────┬─────────────────┬─┘       │
│     │                 │                 │                 │         │
│     │                 │                 │                 │         │
│  ┌──▼──────────┐  ┌───▼────────┐   ┌───▼────────┐   ┌────▼───────┐ │
│  │ Auth Module │  │ User Module│   │Survey Module│   │Response Module│
│  └─────┬───────┘  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘ │
│        │                │                │                │        │
│        │                │                │                │        │
└────────┼────────────────┼────────────────┼────────────────┼────────┘
         │                │                │                │
         │                │                │                │
┌────────┼────────────────┼────────────────┼────────────────┼────────┐
│        │                │                │                │        │
│  ┌─────▼────────────────▼────────────────▼────────────────▼─────┐  │
│  │                                                              │  │
│  │                      MongoDB Database                        │  │
│  │                                                              │  │
│  └──────────┬───────────────┬────────────────┬─────────────────┘  │
│             │               │                │                    │
│  ┌──────────▼──┐    ┌───────▼───────┐   ┌────▼──────────┐         │
│  │ Users Collection│ │Surveys Collection│ │Responses Collection│   │
│  └───────────────┘  └─────────────────┘ └─────────────────┘       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Container Architecture (Docker)

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Environment                      │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────┐  │
│  │                 │    │                 │    │         │  │
│  │  Frontend       │    │  Backend        │    │ MongoDB │  │
│  │  Container      │    │  Container      │    │Container│  │
│  │  (React)        │◄───┤  (NestJS)       │◄───┤         │  │
│  │  Port: 3000     │    │  Port: 3001     │    │Port:27017  │
│  │                 │    │                 │    │         │  │
│  └─────────────────┘    └─────────────────┘    └─────────┘  │
│                                                             │
│                    Docker Compose                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                  ┌──────────┐                  ┌───────────┐
│  Client  │                  │  Server  │                  │  Database │
└────┬─────┘                  └────┬─────┘                  └─────┬─────┘
     │                             │                              │
     │      1. Login Request       │                              │
     │ (email, password)           │                              │
     │ --------------------------> │                              │
     │                             │                              │
     │                             │  2. Validate Credentials     │
     │                             │ ----------------------------> │
     │                             │                              │
     │                             │  3. Return User if Valid     │
     │                             │ <--------------------------- │
     │                             │                              │
     │                             │  4. Generate JWT Token       │
     │                             │----┐                         │
     │                             │    │                         │
     │                             │<---┘                         │
     │                             │                              │
     │   5. Return Token & User    │                              │
     │ <--------------------------- │                              │
     │                             │                              │
     │  6. Store Token in LocalStorage                            │
     │----┐                        │                              │
     │    │                        │                              │
     │<---┘                        │                              │
     │                             │                              │
     │  7. Subsequent API Requests │                              │
     │  with Authorization Header  │                              │
     │ --------------------------> │                              │
     │                             │                              │
     │                             │  8. Validate Token           │
     │                             │----┐                         │
     │                             │    │                         │
     │                             │<---┘                         │
     │                             │                              │
     │     9. Return Response      │                              │
     │ <--------------------------- │                              │
     │                             │                              │
```

## Survey Creation and Response Flow

```
┌──────────┐             ┌──────────┐             ┌───────────┐
│   Admin  │             │  Server  │             │  Database │
└────┬─────┘             └────┬─────┘             └─────┬─────┘
     │                        │                         │
     │  1. Create Survey      │                         │
     │ (title, questions, etc)│                         │
     │ ---------------------> │                         │
     │                        │                         │
     │                        │  2. Store Survey        │
     │                        │ ----------------------> │
     │                        │                         │
     │                        │  3. Confirm Storage     │
     │                        │ <---------------------- │
     │                        │                         │
     │ 4. Survey Created      │                         │
     │ <--------------------- │                         │
     │                        │                         │
     │                        │                         │
     
┌──────────┐             ┌──────────┐             ┌───────────┐
│ Employee │             │  Server  │             │  Database │
└────┬─────┘             └────┬─────┘             └─────┬─────┘
     │                        │                         │
     │ 5. Request Available   │                         │
     │    Surveys             │                         │
     │ ---------------------> │                         │
     │                        │                         │
     │                        │ 6. Fetch Available      │
     │                        │    Surveys              │
     │                        │ ----------------------> │
     │                        │                         │
     │                        │ 7. Return Surveys       │
     │                        │ <---------------------- │
     │                        │                         │
     │ 8. Display Surveys     │                         │
     │ <--------------------- │                         │
     │                        │                         │
     │ 9. Submit Survey       │                         │
     │    Response            │                         │
     │ ---------------------> │                         │
     │                        │                         │
     │                        │ 10. Validate & Store    │
     │                        │     Response            │
     │                        │ ----------------------> │
     │                        │                         │
     │                        │ 11. Confirm Storage     │
     │                        │ <---------------------- │
     │                        │                         │
     │ 12. Confirmation       │                         │
     │ <--------------------- │                         │
     │                        │                         │
```

## Database Schema Relationships

```
┌───────────────────┐           ┌───────────────────┐
│      User         │           │     Survey        │
├───────────────────┤           ├───────────────────┤
│ _id: ObjectId     │           │ _id: ObjectId     │
│ name: String      │           │ title: String     │
│ email: String     │◄──────────┤ description: String│
│ password: String  │           │ questions: Array  │
│ role: Enum        │           │ isActive: Boolean │
│ createdAt: Date   │           │ status: String    │
│ updatedAt: Date   │           │ createdAt: Date   │
└───────────────────┘           │ updatedAt: Date   │
                                │ dueDate: Date     │
                                │ responseCount: Number│
                                └─────────┬─────────┘
                                          │
                                          │
                                          │
                                          │
┌───────────────────┐           ┌─────────▼─────────┐
│     Question      │           │     Response      │
│  (Embedded in     │           ├───────────────────┤
│     Survey)       │           │ _id: ObjectId     │
├───────────────────┤           │ userId: ObjectId  │──────► User
│ _id: ObjectId     │           │ surveyId: ObjectId│──────► Survey
│ text: String      │◄──────────┤ answers: Array    │
│ type: String      │           │ submittedAt: Date │
│ options: Array    │           │ isCompleted: Boolean│
│ required: Boolean │           └───────────────────┘
└───────────────────┘                     │
                                          │
                                          │
                                    ┌─────▼──────────┐
                                    │     Answer     │
                                    │  (Embedded in  │
                                    │    Response)   │
                                    ├────────────────┤
                                    │ questionIndex: Number│
                                    │ value: String  │
                                    └────────────────┘
```

## AI Insights Architecture

### Overview
The AI insights feature uses OpenAI's GPT-3.5-turbo model to analyze survey responses and generate actionable insights for administrators. The implementation follows best practices for token management, error handling, and rate limiting.

### Components

#### OpenAI Service
- Initialization with environment-based API key configuration
- Token limit management (4096 tokens for GPT-3.5-turbo)
- Response processing with configurable limits:
  - Maximum of 10 responses per analysis
  - Feedback text truncation to 200 characters
  - Reserved tokens for AI response (100 tokens)

#### Data Processing
- Survey response filtering and sorting
- Recent-first analysis prioritization
- Automatic data reduction for token limit compliance
- Structured data preparation with ProcessedSurveyData interface

#### Error Handling
- API quota management
- Token limit exceeded scenarios
- Service initialization failures
- Network and API errors
- Graceful degradation with informative messages

#### Integration Points
- Admin dashboard integration
- Real-time insight generation
- Caching mechanisms (planned)
- Rate limiting controls

### Security Considerations
- API key management through environment variables
- Input sanitization before API calls
- Error message sanitization
- Rate limiting implementation

### Performance Optimization
- Token estimation for request optimization
- Batch processing of survey responses
- Data truncation strategies
- Response caching (planned)
``` 