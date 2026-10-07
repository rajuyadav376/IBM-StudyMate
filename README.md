# IBM StudyMate – AI-Powered Personalized Learning Platform

> **Powered by IBM watsonx.ai** · Full-Stack College Project · IBM BOB Demonstration

---

## 🎯 Problem Statement

College students struggle with unstructured study habits, lack of personalized guidance, and no way to identify their knowledge gaps until exam time. Generic study resources do not adapt to individual schedules, learning levels, or weak areas.

## 💡 Proposed Solution

IBM StudyMate is an AI-powered learning platform that:
- Analyzes a student's subject, knowledge level, exam date, and available study hours
- Generates a **day-by-day personalized study plan** using IBM watsonx.ai
- Explains any topic at Beginner / Intermediate / Advanced level
- Creates **AI-generated quizzes** and tracks performance
- Automatically detects **weak topics** from quiz results
- Provides a conversational **AI Study Assistant** for personalized advice

---

## ✨ Features

### 👩‍🎓 Student Features
| Feature | Description |
|---|---|
| 🔐 Authentication | Register, Login, JWT-protected routes |
| 📚 Subjects | Add subjects with topics, exam dates, learning level |
| 🗓️ AI Study Plans | Generate personalized day-by-day schedule using IBM AI |
| 🔍 Topic Explainer | Get beginner/intermediate/advanced explanations |
| ✏️ Quiz | AI-generated 5-question MCQ quizzes |
| 📊 Progress Dashboard | Charts showing subject progress and quiz scores |
| 🎯 Weak Topics | AI-detected weak areas with study recommendations |
| 🤖 AI Assistant | Chat with AI using your personal study context |
| 👤 Profile | Update profile, learning level, study hours |

### ⚙️ Admin Features
| Feature | Description |
|---|---|
| 📊 Stats Dashboard | Total students, study plans, quizzes, AI usage |
| 👥 User Management | View all students, deactivate if needed |
| 📋 Activity Log | Recent quiz attempts across all students |
| ⚡ AI Usage Monitoring | Track IBM API calls vs. mock/cached responses |

---

## 🏗️ Architecture

```
Browser (React)
     │
     ▼
Express.js REST API (Node.js)
     │
     ├── JWT Authentication
     ├── Protected Routes
     │
     ├── MongoDB (Mongoose)
     │     ├── Users
     │     ├── Subjects
     │     ├── StudyPlans
     │     ├── Quizzes
     │     ├── QuizAttempts
     │     ├── Progress
     │     └── AIRequests (audit log)
     │
     └── IBM watsonx.ai Service
           ├── Study Plan Generation
           ├── Topic Explanation
           ├── Quiz Generation
           └── Chat Assistant
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Chart.js |
| Backend | Node.js, Express.js, REST APIs |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT, bcryptjs |
| AI Platform | **IBM watsonx.ai** (Granite 13B Instruct) |
| Validation | express-validator |
| Styling | Custom CSS (IBM Design Language inspired) |

---

## ⚡ IBM Technology Used

| IBM Service | Usage |
|---|---|
| **IBM watsonx.ai** | Study plan generation, topic explanation, quiz generation, AI chat assistant |
| **IBM Granite 13B Instruct** | Default language model for all AI features |
| **IBM watsonx.ai Node SDK** | `@ibm-cloud/watsonx-ai` npm package |

**Credit Optimization Strategy:**
- `USE_MOCK_AI=true` in development (zero credits used)
- Results are cached by MD5 hash in MongoDB — same request reuses stored result
- AI is called **only** when user explicitly triggers it (never in background)
- Mock responses provide realistic data for demo without any API cost

---

## 📁 Folder Structure

```
ibm-studymate/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── IBMBadge.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/                   # All page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Subjects.jsx
│   │   │   ├── StudyPlans.jsx
│   │   │   ├── CreateStudyPlan.jsx
│   │   │   ├── StudyPlanDetail.jsx
│   │   │   ├── TopicExplorer.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── QuizResult.jsx
│   │   │   ├── ProgressDashboard.jsx
│   │   │   ├── WeakTopics.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js               # All Axios API calls
│   │   ├── App.jsx                  # Router + layout
│   │   └── index.css                # Global styles
│   └── package.json
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subjectController.js
│   │   ├── studyPlanController.js
│   │   ├── aiController.js          # AI endpoint handlers + caching
│   │   ├── quizController.js
│   │   ├── progressController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + authorize
│   │   └── validate.js              # express-validator middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── StudyPlan.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js
│   │   ├── Progress.js
│   │   └── AIRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── subjects.js
│   │   ├── studyPlans.js
│   │   ├── ai.js
│   │   ├── quizzes.js
│   │   ├── progress.js
│   │   └── admin.js
│   ├── services/
│   │   └── aiService.js             # IBM watsonx.ai + mock service
│   ├── utils/
│   │   └── seed.js                  # Demo data seeder
│   ├── server.js                    # Express app entry point
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm

### 1. Clone / navigate to project

```bash
cd ibm-studymate
```

### 2. Setup Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables below)
```

### 3. Setup Client

```bash
cd ../client
npm install
```

---

## 🔐 Environment Variables

Create `server/.env` (copy from `server/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ibm_studymate
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=7d

# IBM watsonx.ai (get from cloud.ibm.com)
IBM_API_KEY=your_ibm_api_key
IBM_PROJECT_ID=your_project_id
IBM_SERVICE_URL=https://us-south.ml.cloud.ibm.com
IBM_MODEL_ID=ibm/granite-13b-instruct-v2

# Set false to use real IBM AI, true for development (no credits used)
USE_MOCK_AI=true

NODE_ENV=development
```

> ⚠️ **Never commit `.env` to GitHub.** It is already in `.gitignore`.

---

## 🗄️ Database Setup

### Local MongoDB
```bash
# Start MongoDB
mongod
```

### MongoDB Atlas (Cloud)
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string
3. Set `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ibm_studymate`

### Seed Demo Data
```bash
cd server
npm run seed
```

This creates:
- **Admin:** `admin@studymate.ibm` / `Admin@123`
- **Student 1:** `arjun@demo.com` / `Student@123` (with subjects, study plan, quizzes)
- **Student 2:** `priya@demo.com` / `Student@123`

---

## ⚡ IBM AI Setup

### Option A: Mock Mode (Development — 0 credits)
```env
USE_MOCK_AI=true
```
All AI features work with realistic mock responses. No IBM account needed.

### Option B: Real IBM watsonx.ai

1. Create IBM Cloud account at [cloud.ibm.com](https://cloud.ibm.com)
2. Create a **Watson Machine Learning** service instance
3. Create a **watsonx.ai project**
4. Get your API key from IAM
5. Get your Project ID from the watsonx.ai project settings
6. Update `.env`:

```env
USE_MOCK_AI=false
IBM_API_KEY=your_actual_api_key
IBM_PROJECT_ID=your_actual_project_id
IBM_SERVICE_URL=https://us-south.ml.cloud.ibm.com
IBM_MODEL_ID=ibm/granite-13b-instruct-v2
```

---

## 🚀 Running the Application

### Start Backend
```bash
cd server
npm run dev          # Development with nodemon
# or
npm start            # Production
```
Server runs on: http://localhost:5000

### Start Frontend
```bash
cd client
npm start
```
App runs on: http://localhost:3000

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register student | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Get my profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

### Subjects
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/subjects` | Get my subjects | Yes |
| POST | `/api/subjects` | Add subject | Yes |
| PUT | `/api/subjects/:id` | Update subject | Yes |
| DELETE | `/api/subjects/:id` | Remove subject | Yes |
| POST | `/api/subjects/:id/topics` | Add topic to subject | Yes |

### AI (IBM watsonx.ai)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/ai/study-plan` | Generate study plan | Yes |
| POST | `/api/ai/explain` | Explain a topic | Yes |
| POST | `/api/ai/quiz` | Generate quiz | Yes |
| POST | `/api/ai/chat` | AI assistant chat | Yes |

### Study Plans
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/study-plans` | Get all my plans | Yes |
| GET | `/api/study-plans/:id` | Get plan details | Yes |
| POST | `/api/study-plans` | Create plan | Yes |
| PUT | `/api/study-plans/:id/complete-day` | Mark day complete | Yes |
| DELETE | `/api/study-plans/:id` | Delete plan | Yes |

### Quizzes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/quizzes` | Get my quizzes | Yes |
| GET | `/api/quizzes/:id` | Get quiz | Yes |
| POST | `/api/quizzes/:id/submit` | Submit answers | Yes |
| GET | `/api/quizzes/attempts` | My quiz history | Yes |

### Progress
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/progress` | Get all progress | Yes |
| GET | `/api/progress/summary` | Overall summary | Yes |
| GET | `/api/progress/weak-topics` | Weak topics list | Yes |
| PUT | `/api/progress` | Update progress | Yes |

### Admin (Admin role only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All students |
| GET | `/api/admin/activity` | Recent activity |
| PUT | `/api/admin/users/:id/deactivate` | Deactivate user |

---

## 🎬 Demo Flow

```
1. Open http://localhost:3000
2. Click "Get Started" → Register or use demo account
3. Student Login: arjun@demo.com / Student@123
4. Dashboard → See subjects, progress, study plan
5. Subjects → Add a new subject with topics and exam date
6. Study Plans → "Generate AI Study Plan" → Fill form → Click Generate
7. View day-by-day plan → Mark days as complete
8. Topic Explorer → Select a topic → Choose level → "Explain"
9. Quiz → Select subject & topic → Generate → Answer → See results
10. Weak Topics → View detected weak areas with recommendations
11. AI Assistant → Ask "What should I study today?"
12. Progress → View charts and quiz history
13. Admin: admin@studymate.ibm / Admin@123 → Admin Dashboard
```

---

## 🔮 Future Improvements

- [ ] Email notifications for upcoming exams
- [ ] Collaborative study groups
- [ ] PDF study plan export
- [ ] Voice-based AI assistant (IBM Watson Speech)
- [ ] Pomodoro timer integration
- [ ] Flashcard generation from topics
- [ ] Mobile app (React Native)
- [ ] Teacher/Instructor role
- [ ] Integration with IBM Skills Network courses

---

## 📸 Screenshots

> Add screenshots here after running the application.

---

## ⚖️ Disclaimer

IBM StudyMate is a student project created to demonstrate IBM watsonx.ai integration. It is **not an official IBM product** and is not affiliated with or endorsed by IBM Corporation.

---

*Made with ❤️ using IBM watsonx.ai*
