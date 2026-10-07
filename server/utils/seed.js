/**
 * Seed script – populates IBM StudyMate with demo data.
 * Run: npm run seed
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ibm_studymate');
  console.log('Connected to MongoDB');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    StudyPlan.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Progress.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@studymate.ibm',
    password: 'Admin@123',
    role: 'admin',
    course: 'Administration',
    semester: 'N/A'
  });

  // Create demo students
  const student1 = await User.create({
    name: 'Arjun Kumar',
    email: 'arjun@demo.com',
    password: 'Student@123',
    role: 'student',
    course: 'B.Tech Computer Science',
    semester: '4th Semester',
    learningLevel: 'intermediate',
    dailyStudyHours: 3,
    studyStreak: 5
  });

  const student2 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    password: 'Student@123',
    role: 'student',
    course: 'BCA',
    semester: '2nd Semester',
    learningLevel: 'beginner',
    dailyStudyHours: 2
  });

  console.log('Users created');

  // Create subjects for student1
  const pythonSubject = await Subject.create({
    userId: student1._id,
    name: 'Python Programming',
    description: 'Core Python programming language concepts and applications',
    examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    learningLevel: 'intermediate',
    dailyStudyHours: 3,
    topics: [
      { name: 'Variables & Data Types', description: 'Basic Python types', order: 1, estimatedHours: 2 },
      { name: 'Control Flow', description: 'if/else, loops', order: 2, estimatedHours: 2 },
      { name: 'Functions', description: 'Defining and calling functions', order: 3, estimatedHours: 3 },
      { name: 'Lists & Dictionaries', description: 'Python data structures', order: 4, estimatedHours: 3 },
      { name: 'OOP', description: 'Classes, objects, inheritance', order: 5, estimatedHours: 4 },
      { name: 'File Handling', description: 'Reading and writing files', order: 6, estimatedHours: 2 },
      { name: 'Error Handling', description: 'try/except blocks', order: 7, estimatedHours: 2 },
      { name: 'Recursion', description: 'Recursive functions and algorithms', order: 8, estimatedHours: 3 }
    ],
    color: '#3b82f6',
    icon: '🐍'
  });

  const dsSubject = await Subject.create({
    userId: student1._id,
    name: 'Data Structures',
    description: 'Fundamental data structures and algorithms',
    examDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    learningLevel: 'intermediate',
    dailyStudyHours: 2,
    topics: [
      { name: 'Arrays', description: 'Array operations', order: 1, estimatedHours: 2 },
      { name: 'Linked Lists', description: 'Singly and doubly linked lists', order: 2, estimatedHours: 3 },
      { name: 'Stacks & Queues', description: 'LIFO and FIFO structures', order: 3, estimatedHours: 2 },
      { name: 'Trees', description: 'Binary trees and traversals', order: 4, estimatedHours: 4 },
      { name: 'Graphs', description: 'Graph representations and algorithms', order: 5, estimatedHours: 4 },
      { name: 'Sorting Algorithms', description: 'QuickSort, MergeSort, etc.', order: 6, estimatedHours: 3 },
      { name: 'Hashing', description: 'Hash tables and collision handling', order: 7, estimatedHours: 2 }
    ],
    color: '#8b5cf6',
    icon: '🌲'
  });

  const cnSubject = await Subject.create({
    userId: student2._id,
    name: 'Computer Networks',
    description: 'Networking concepts, protocols and architectures',
    examDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    learningLevel: 'beginner',
    dailyStudyHours: 2,
    topics: [
      { name: 'OSI Model', description: '7 layer model', order: 1, estimatedHours: 2 },
      { name: 'TCP/IP', description: 'Internet protocol suite', order: 2, estimatedHours: 3 },
      { name: 'IP Addressing', description: 'IPv4 and IPv6', order: 3, estimatedHours: 2 },
      { name: 'Routing', description: 'Routing protocols', order: 4, estimatedHours: 3 },
      { name: 'DNS', description: 'Domain Name System', order: 5, estimatedHours: 2 },
      { name: 'Network Security', description: 'Firewalls, VPN', order: 6, estimatedHours: 3 }
    ],
    color: '#10b981',
    icon: '🌐'
  });

  console.log('Subjects created');

  // Create a study plan for student1
  const studyPlan = await StudyPlan.create({
    userId: student1._id,
    subjectId: pythonSubject._id,
    subject: 'Python Programming',
    learningLevel: 'intermediate',
    examDate: pythonSubject.examDate,
    dailyHours: 3,
    totalDays: 30,
    topics: ['Variables & Data Types', 'Functions', 'OOP', 'Recursion'],
    learningGoal: 'Master Python for exam',
    generatedPlan: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const topics = ['Variables & Data Types', 'Control Flow', 'Functions', 'Lists & Dictionaries', 'OOP', 'File Handling', 'Error Handling', 'Recursion'];
      const topicIndex = Math.floor((i / 30) * topics.length);
      return {
        day,
        topic: topics[Math.min(topicIndex, topics.length - 1)],
        subtopics: ['Theory', 'Practice exercises'],
        duration: 3,
        type: day % 7 === 0 ? 'quiz' : day % 5 === 0 ? 'revise' : 'learn',
        priority: day <= 10 ? 'high' : 'medium',
        completed: day <= 8
      };
    }),
    summary: 'A comprehensive 30-day Python study plan covering all core topics from basics to advanced OOP.',
    priorityTopics: ['Functions', 'OOP', 'Recursion'],
    aiGenerated: true,
    completionPercentage: 27
  });

  console.log('Study plan created');

  // Create sample quizzes
  const pythonQuiz = await Quiz.create({
    userId: student1._id,
    subject: 'Python Programming',
    topic: 'Functions',
    difficulty: 'medium',
    aiGenerated: true,
    questions: [
      {
        question: 'What keyword is used to define a function in Python?',
        options: [{ label: 'A', text: 'func' }, { label: 'B', text: 'def' }, { label: 'C', text: 'function' }, { label: 'D', text: 'define' }],
        correctAnswer: 'B',
        explanation: 'In Python, the "def" keyword is used to define a function.',
        topic: 'Functions',
        difficulty: 'easy'
      },
      {
        question: 'What does a function return if no return statement is provided?',
        options: [{ label: 'A', text: '0' }, { label: 'B', text: 'False' }, { label: 'C', text: 'None' }, { label: 'D', text: 'Error' }],
        correctAnswer: 'C',
        explanation: 'Python functions return None by default when no return statement is specified.',
        topic: 'Functions',
        difficulty: 'easy'
      },
      {
        question: 'Which of the following is a valid way to call a Python function with keyword arguments?',
        options: [{ label: 'A', text: 'greet(name="Alice")' }, { label: 'B', text: 'greet["Alice"]' }, { label: 'C', text: 'greet{name: "Alice"}' }, { label: 'D', text: 'greet(Alice)' }],
        correctAnswer: 'A',
        explanation: 'Keyword arguments are passed using the parameter name followed by "=" and the value.',
        topic: 'Functions',
        difficulty: 'medium'
      },
      {
        question: 'What is the purpose of *args in a Python function?',
        options: [{ label: 'A', text: 'To define keyword arguments' }, { label: 'B', text: 'To accept any number of positional arguments' }, { label: 'C', text: 'To make arguments optional' }, { label: 'D', text: 'To return multiple values' }],
        correctAnswer: 'B',
        explanation: '*args allows a function to accept any number of positional arguments as a tuple.',
        topic: 'Functions',
        difficulty: 'medium'
      },
      {
        question: 'What is a lambda function in Python?',
        options: [{ label: 'A', text: 'A recursive function' }, { label: 'B', text: 'A function without a name (anonymous)' }, { label: 'C', text: 'A function that returns multiple values' }, { label: 'D', text: 'A built-in Python function' }],
        correctAnswer: 'B',
        explanation: 'A lambda function is an anonymous (unnamed) function defined with the lambda keyword.',
        topic: 'Functions',
        difficulty: 'hard'
      }
    ],
    totalQuestions: 5,
    cacheKey: 'seed_python_functions_medium'
  });

  // Create sample quiz attempt for student1
  const attempt = await QuizAttempt.create({
    userId: student1._id,
    quizId: pythonQuiz._id,
    subject: 'Python Programming',
    topic: 'Functions',
    answers: [
      { questionIndex: 0, selectedAnswer: 'B', correctAnswer: 'B', isCorrect: true, topic: 'Functions' },
      { questionIndex: 1, selectedAnswer: 'C', correctAnswer: 'C', isCorrect: true, topic: 'Functions' },
      { questionIndex: 2, selectedAnswer: 'A', correctAnswer: 'A', isCorrect: true, topic: 'Functions' },
      { questionIndex: 3, selectedAnswer: 'A', correctAnswer: 'B', isCorrect: false, topic: 'Functions' },
      { questionIndex: 4, selectedAnswer: 'D', correctAnswer: 'B', isCorrect: false, topic: 'Functions' }
    ],
    score: 60,
    correctCount: 3,
    totalQuestions: 5,
    weakTopics: ['Functions'],
    strongTopics: [],
    timeTaken: 240
  });

  console.log('Quizzes and attempts created');

  // Create progress records
  await Progress.create({
    userId: student1._id,
    subjectId: pythonSubject._id,
    subject: 'Python Programming',
    topics: pythonSubject.topics.map(t => ({
      topicName: t.name,
      completed: ['Variables & Data Types', 'Control Flow', 'Functions'].includes(t.name),
      isWeak: t.name === 'Recursion' || t.name === 'OOP'
    })),
    completedTopics: ['Variables & Data Types', 'Control Flow', 'Functions'],
    weakTopics: ['Recursion', 'OOP'],
    strongTopics: ['Variables & Data Types', 'Control Flow'],
    progressPercentage: 38,
    quizAttempts: 1,
    quizAverage: 60,
    totalStudyMinutes: 540,
    lastStudied: new Date()
  });

  await Progress.create({
    userId: student1._id,
    subjectId: dsSubject._id,
    subject: 'Data Structures',
    topics: dsSubject.topics.map(t => ({
      topicName: t.name,
      completed: ['Arrays', 'Linked Lists'].includes(t.name),
      isWeak: t.name === 'Graphs'
    })),
    completedTopics: ['Arrays', 'Linked Lists'],
    weakTopics: ['Graphs'],
    strongTopics: ['Arrays'],
    progressPercentage: 29,
    quizAttempts: 0,
    quizAverage: 0,
    totalStudyMinutes: 180,
    lastStudied: new Date()
  });

  await Progress.create({
    userId: student2._id,
    subjectId: cnSubject._id,
    subject: 'Computer Networks',
    topics: cnSubject.topics.map(t => ({
      topicName: t.name,
      completed: ['OSI Model'].includes(t.name),
      isWeak: t.name === 'Routing'
    })),
    completedTopics: ['OSI Model'],
    weakTopics: ['Routing'],
    strongTopics: ['OSI Model'],
    progressPercentage: 17,
    quizAttempts: 0,
    quizAverage: 0,
    totalStudyMinutes: 90
  });

  console.log('Progress records created');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@studymate.ibm  / Admin@123');
  console.log('  Student1: arjun@demo.com       / Student@123');
  console.log('  Student2: priya@demo.com       / Student@123');
  console.log('\nRun the server: npm run dev\n');

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
