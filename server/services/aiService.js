/**
 * IBM watsonx.ai Service
 * Powered by IBM Granite model via IBM watsonx.ai platform.
 *
 * When USE_MOCK_AI=true (default in development), all methods return
 * realistic mock responses so you can build and demo without consuming credits.
 *
 * To switch to real IBM AI:
 *   1. Set USE_MOCK_AI=false in .env
 *   2. Provide IBM_API_KEY, IBM_PROJECT_ID, IBM_SERVICE_URL
 */

const AIRequest = require('../models/AIRequest');

// ─── IBM watsonx.ai client (only instantiated when NOT in mock mode) ─────────
let watsonxClient = null;

const getWatsonxClient = () => {
  if (watsonxClient) return watsonxClient;
  try {
    const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
    watsonxClient = WatsonXAI.newInstance({
      version: '2024-05-31',
      serviceUrl: process.env.IBM_SERVICE_URL || 'https://us-south.ml.cloud.ibm.com'
    });
    return watsonxClient;
  } catch (e) {
    console.error('Failed to initialize watsonx.ai client:', e.message);
    return null;
  }
};

// ─── Core IBM API call ────────────────────────────────────────────────────────
const callIBMWatsonx = async (prompt, maxTokens = 800) => {
  const client = getWatsonxClient();
  if (!client) throw new Error('IBM watsonx.ai client unavailable');

  const response = await client.generateText({
    modelId: process.env.IBM_MODEL_ID || 'ibm/granite-13b-instruct-v2',
    projectId: process.env.IBM_PROJECT_ID,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: maxTokens,
      min_new_tokens: 50,
      stop_sequences: [],
      repetition_penalty: 1.1
    }
  });

  const text = response.result?.results?.[0]?.generated_text || '';
  const tokens = response.result?.results?.[0]?.generated_token_count || 0;
  return { text: text.trim(), tokensUsed: tokens };
};

// ─── Log every AI request ─────────────────────────────────────────────────────
const logRequest = async (userId, type, prompt, response, tokens, usedMock, error = null, durationMs = 0) => {
  try {
    await AIRequest.create({
      userId,
      requestType: type,
      prompt: prompt.substring(0, 2000),
      response: (response || '').substring(0, 5000),
      tokensUsed: tokens,
      usedMock,
      error,
      durationMs
    });
  } catch (_) {
    // non-critical logging – never block the main flow
  }
};

// ─── MOCK RESPONSES ───────────────────────────────────────────────────────────

const mockStudyPlan = ({ subject, learningLevel, totalDays, dailyHours, topics }) => {
  const topicList = topics && topics.length > 0
    ? topics
    : getDefaultTopics(subject);

  const plan = [];
  const types = ['learn', 'learn', 'practice', 'revise', 'quiz'];
  const priorities = ['high', 'high', 'medium', 'medium', 'low'];

  for (let day = 1; day <= totalDays; day++) {
    const topicIndex = Math.floor(((day - 1) / totalDays) * topicList.length);
    const topicName = topicList[Math.min(topicIndex, topicList.length - 1)];
    const typeIndex = (day - 1) % types.length;

    plan.push({
      day,
      topic: topicName,
      subtopics: getSubtopics(topicName),
      duration: dailyHours,
      type: types[typeIndex],
      priority: day <= Math.ceil(totalDays * 0.4) ? 'high' : priorities[typeIndex],
      completed: false
    });
  }

  return {
    generatedPlan: plan,
    summary: `This ${totalDays}-day study plan for ${subject} (${learningLevel} level) covers ${topicList.length} key topics. Focus on the first half for building foundations and use the second half for practice and revision. Spend ${dailyHours} hours daily.`,
    priorityTopics: topicList.slice(0, 3)
  };
};

const mockExplanation = ({ topic, level }) => {
  return {
    simpleExplanation: `${topic} is a fundamental concept in computer science. At the ${level} level, it refers to a structured approach to solving problems by breaking them into smaller, manageable pieces.`,
    importantPoints: [
      `${topic} is widely used in real-world applications`,
      `Understanding ${topic} builds a strong foundation for advanced concepts`,
      `Practice is essential to master ${topic}`,
      `${topic} connects to many other areas of the subject`
    ],
    example: `Consider a real-world analogy: ${topic} works like a recipe book — you follow steps in order, and each step builds on the previous one. For example, when sorting numbers, you compare pairs and swap them systematically until the list is ordered.`,
    keyTerms: [
      { term: 'Algorithm', definition: 'A step-by-step procedure to solve a problem' },
      { term: 'Complexity', definition: 'How the time/space requirements grow with input size' },
      { term: 'Implementation', definition: 'Turning a concept into working code' }
    ],
    summary: `${topic} is an essential concept that every ${level} student should master. Focus on understanding the core idea first, then practice with examples. Regular revision will help solidify your understanding.`
  };
};

const mockQuiz = ({ subject, topic, difficulty }) => {
  return {
    questions: [
      {
        question: `What is the primary purpose of ${topic} in ${subject}?`,
        options: [
          { label: 'A', text: `To organize and structure data efficiently` },
          { label: 'B', text: `To display output to the user` },
          { label: 'C', text: `To connect to the internet` },
          { label: 'D', text: `To manage memory allocation` }
        ],
        correctAnswer: 'A',
        explanation: `${topic} is primarily used to organize and structure data efficiently, making it easier to process and retrieve information.`,
        topic,
        difficulty: difficulty === 'mixed' ? 'medium' : difficulty
      },
      {
        question: `Which of the following best describes ${topic}?`,
        options: [
          { label: 'A', text: `A hardware component` },
          { label: 'B', text: `A software design approach` },
          { label: 'C', text: `A network protocol` },
          { label: 'D', text: `A database query language` }
        ],
        correctAnswer: 'B',
        explanation: `${topic} is a software design approach used to solve specific types of problems systematically.`,
        topic,
        difficulty: 'easy'
      },
      {
        question: `In the context of ${subject}, when would you apply ${topic}?`,
        options: [
          { label: 'A', text: `Only for small datasets` },
          { label: 'B', text: `Only in production environments` },
          { label: 'C', text: `When you need an efficient, structured solution` },
          { label: 'D', text: `When other methods have failed` }
        ],
        correctAnswer: 'C',
        explanation: `${topic} is applied when you need an efficient, structured solution regardless of the environment or dataset size.`,
        topic,
        difficulty: 'medium'
      },
      {
        question: `What is the time complexity of a basic ${topic} operation?`,
        options: [
          { label: 'A', text: `O(1) – constant time` },
          { label: 'B', text: `O(n) – linear time` },
          { label: 'C', text: `O(n²) – quadratic time` },
          { label: 'D', text: `It depends on the implementation` }
        ],
        correctAnswer: 'D',
        explanation: `The time complexity of ${topic} depends on the specific implementation and use case, which is why understanding the underlying algorithm is important.`,
        topic,
        difficulty: 'hard'
      },
      {
        question: `Which statement about ${topic} is INCORRECT?`,
        options: [
          { label: 'A', text: `It can improve code maintainability` },
          { label: 'B', text: `It always guarantees the fastest execution` },
          { label: 'C', text: `It follows defined rules and patterns` },
          { label: 'D', text: `It is used in many programming languages` }
        ],
        correctAnswer: 'B',
        explanation: `${topic} does NOT always guarantee the fastest execution — the best approach depends on the specific problem and constraints.`,
        topic,
        difficulty: 'hard'
      }
    ]
  };
};

const mockChatResponse = ({ message, userContext }) => {
  const msg = message.toLowerCase();

  if (msg.includes('weak') || msg.includes('improve')) {
    const weak = userContext.weakTopics?.length > 0
      ? userContext.weakTopics.join(', ')
      : 'No weak topics detected yet — take some quizzes first!';
    return `Based on your quiz performance, your weak topics are: **${weak}**. I recommend spending extra time on these before your exam. Try the AI Topic Explainer for detailed explanations on each topic.`;
  }

  if (msg.includes('study') && (msg.includes('today') || msg.includes('now') || msg.includes('time'))) {
    const hours = userContext.dailyStudyHours || 2;
    const subject = userContext.recentSubject || 'your current subject';
    return `With ${hours} hours today, here's what I recommend: Spend the first ${Math.floor(hours * 0.6)} hour(s) on new topics in ${subject}, then use the remaining ${(hours * 0.4).toFixed(1)} hour(s) for revision and practice quizzes. Focus on high-priority topics first!`;
  }

  if (msg.includes('revise') || msg.includes('revision') || msg.includes('exam')) {
    return `For effective exam revision: (1) Review your weak topics identified in quizzes, (2) Use spaced repetition — revise day 1 topics on day 3, day 3 topics on day 7, (3) Take a full mock quiz on each subject, (4) Focus on understanding concepts rather than memorizing answers. You've got this! 💪`;
  }

  if (msg.includes('explain') || msg.includes('what is') || msg.includes('how does')) {
    return `Great question! For detailed topic explanations, use the **AI Topic Explainer** feature — it provides beginner to advanced explanations with examples and key terms. Would you like me to help you navigate there, or do you have a specific concept you want explained here?`;
  }

  if (msg.includes('progress') || msg.includes('doing')) {
    const pct = userContext.progressPercentage || 0;
    return `Your current overall progress is at **${pct}%**. ${pct < 30 ? "You're just getting started — keep going!" : pct < 70 ? "Good progress! Stay consistent." : "Excellent work! You're almost there!"} Check the Progress Dashboard for detailed stats on each subject.`;
  }

  return `I'm your IBM StudyMate AI Assistant! I can help you with:
  
• **Study planning** — "What should I study today?"
• **Weak topic review** — "What are my weak areas?"
• **Exam prep** — "How should I revise before my exam?"
• **Progress tracking** — "How am I doing?"
• **Topic explanations** — "Explain recursion simply"

What would you like help with today?`;
};

// ─── Topic helpers ────────────────────────────────────────────────────────────

const SUBJECT_TOPICS = {
  'python': ['Variables & Data Types', 'Control Flow', 'Functions', 'Lists & Dictionaries', 'OOP', 'File Handling', 'Modules', 'Error Handling', 'Recursion', 'Algorithms'],
  'computer networks': ['OSI Model', 'TCP/IP', 'IP Addressing', 'Subnetting', 'Routing', 'DNS', 'HTTP/HTTPS', 'Network Security', 'Wireless Networks', 'Firewalls'],
  'database management': ['ER Diagrams', 'Relational Model', 'SQL Basics', 'Normalization', 'Transactions', 'Indexing', 'Joins', 'Stored Procedures', 'NoSQL', 'Database Security'],
  'data structures': ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Binary Search Trees', 'Heaps', 'Graphs', 'Hashing', 'Sorting Algorithms', 'Searching Algorithms'],
  'artificial intelligence': ['Introduction to AI', 'Search Algorithms', 'Machine Learning Basics', 'Neural Networks', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning', 'Expert Systems', 'Ethics in AI', 'AI Applications']
};

const getDefaultTopics = (subject) => {
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_TOPICS)) {
    if (key.includes(k)) return v;
  }
  return ['Introduction', 'Core Concepts', 'Advanced Topics', 'Applications', 'Practice Problems', 'Revision'];
};

const getSubtopics = (topic) => {
  return [`${topic} - Theory`, `${topic} - Examples`, `${topic} - Practice`];
};

// ─── Public API ───────────────────────────────────────────────────────────────

const useMock = () => process.env.USE_MOCK_AI === 'true';

const generateStudyPlan = async (userId, params) => {
  const start = Date.now();
  const useMockMode = useMock();

  try {
    if (useMockMode) {
      const result = mockStudyPlan(params);
      await logRequest(userId, 'study-plan', JSON.stringify(params), JSON.stringify(result), 0, true, null, Date.now() - start);
      return result;
    }

    const { subject, learningLevel, totalDays, dailyHours, topics, learningGoal } = params;
    const topicList = topics?.length > 0 ? topics.join(', ') : 'main topics';
    const prompt = `You are an expert academic tutor. Create a detailed ${totalDays}-day study plan for a ${learningLevel} student studying ${subject}.

Details:
- Daily study time: ${dailyHours} hours
- Topics to cover: ${topicList}
- Learning goal: ${learningGoal || 'Pass the exam with good understanding'}

Generate a JSON study plan with this exact structure:
{
  "generatedPlan": [
    {"day": 1, "topic": "Topic Name", "subtopics": ["subtopic1", "subtopic2"], "duration": ${dailyHours}, "type": "learn", "priority": "high", "completed": false}
  ],
  "summary": "Overall plan summary",
  "priorityTopics": ["topic1", "topic2", "topic3"]
}

Types: learn, practice, revise, quiz. Priority: high, medium, low.
Return only valid JSON, no extra text.`;

    const { text, tokensUsed } = await callIBMWatsonx(prompt, 1200);

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    const result = JSON.parse(jsonMatch[0]);

    await logRequest(userId, 'study-plan', prompt, text, tokensUsed, false, null, Date.now() - start);
    return result;
  } catch (err) {
    console.error('AI study plan error, falling back to mock:', err.message);
    const result = mockStudyPlan(params);
    await logRequest(userId, 'study-plan', JSON.stringify(params), 'FALLBACK', 0, true, err.message, Date.now() - start);
    return result;
  }
};

const explainTopic = async (userId, params) => {
  const start = Date.now();
  const useMockMode = useMock();

  try {
    if (useMockMode) {
      const result = mockExplanation(params);
      await logRequest(userId, 'explain', JSON.stringify(params), JSON.stringify(result), 0, true, null, Date.now() - start);
      return result;
    }

    const { topic, subject, level } = params;
    const prompt = `You are an expert educator. Explain "${topic}" from ${subject || 'computer science'} to a ${level} student.

Return JSON with this exact structure:
{
  "simpleExplanation": "Clear explanation in simple language",
  "importantPoints": ["point1", "point2", "point3", "point4"],
  "example": "A practical example or real-world analogy",
  "keyTerms": [{"term": "term1", "definition": "definition1"}],
  "summary": "A short 2-sentence summary"
}

Return only valid JSON.`;

    const { text, tokensUsed } = await callIBMWatsonx(prompt, 800);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    const result = JSON.parse(jsonMatch[0]);

    await logRequest(userId, 'explain', prompt, text, tokensUsed, false, null, Date.now() - start);
    return result;
  } catch (err) {
    console.error('AI explain error, falling back to mock:', err.message);
    const result = mockExplanation(params);
    await logRequest(userId, 'explain', JSON.stringify(params), 'FALLBACK', 0, true, err.message, Date.now() - start);
    return result;
  }
};

const generateQuiz = async (userId, params) => {
  const start = Date.now();
  const useMockMode = useMock();

  try {
    if (useMockMode) {
      const result = mockQuiz(params);
      await logRequest(userId, 'quiz', JSON.stringify(params), JSON.stringify(result), 0, true, null, Date.now() - start);
      return result;
    }

    const { subject, topic, difficulty, numQuestions = 5 } = params;
    const prompt = `Generate ${numQuestions} multiple-choice questions about "${topic}" in ${subject} for a student.
Difficulty: ${difficulty}

Return JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": [
        {"label": "A", "text": "Option A"},
        {"label": "B", "text": "Option B"},
        {"label": "C", "text": "Option C"},
        {"label": "D", "text": "Option D"}
      ],
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "topic": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

Return only valid JSON.`;

    const { text, tokensUsed } = await callIBMWatsonx(prompt, 1000);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    const result = JSON.parse(jsonMatch[0]);

    await logRequest(userId, 'quiz', prompt, text, tokensUsed, false, null, Date.now() - start);
    return result;
  } catch (err) {
    console.error('AI quiz error, falling back to mock:', err.message);
    const result = mockQuiz(params);
    await logRequest(userId, 'quiz', JSON.stringify(params), 'FALLBACK', 0, true, err.message, Date.now() - start);
    return result;
  }
};

const chat = async (userId, message, userContext) => {
  const start = Date.now();
  const useMockMode = useMock();

  try {
    if (useMockMode) {
      const response = mockChatResponse({ message, userContext });
      await logRequest(userId, 'chat', message, response, 0, true, null, Date.now() - start);
      return response;
    }

    const prompt = `You are IBM StudyMate AI Assistant, a friendly and knowledgeable academic tutor.

Student context:
- Name: ${userContext.name || 'Student'}
- Current subjects: ${userContext.subjects?.join(', ') || 'None'}
- Learning level: ${userContext.learningLevel || 'beginner'}
- Daily study hours: ${userContext.dailyStudyHours || 2}
- Weak topics: ${userContext.weakTopics?.join(', ') || 'None identified'}
- Progress: ${userContext.progressPercentage || 0}%

Student question: "${message}"

Provide a helpful, encouraging, and concise response (2-4 sentences max). Be specific to their context when relevant.`;

    const { text, tokensUsed } = await callIBMWatsonx(prompt, 300);
    await logRequest(userId, 'chat', message, text, tokensUsed, false, null, Date.now() - start);
    return text;
  } catch (err) {
    console.error('AI chat error, falling back to mock:', err.message);
    const response = mockChatResponse({ message, userContext });
    await logRequest(userId, 'chat', message, response, 0, true, err.message, Date.now() - start);
    return response;
  }
};

module.exports = { generateStudyPlan, explainTopic, generateQuiz, chat };
