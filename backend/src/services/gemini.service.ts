import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('WARNING: GEMINI_API_KEY is not defined. Using mock AI service responses instead.');
}

// Helper to clean Markdown json blocks
const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

export class GeminiService {
  /**
   * Parse resume text and evaluate against a target role
   */
  static async analyzeResume(resumeText: string, targetRole: string) {
    if (!genAI) {
      return this.getMockResumeAnalysis(targetRole);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are an expert ATS (Applicant Tracking System) recruiter.
        Analyze the following resume text for a candidate applying for the role: "${targetRole}".
        
        Evaluate:
        1. An overall score (0 to 100).
        2. Extracted key skills found in the resume.
        3. Missing keywords/skills that are highly relevant to this role.
        4. Clear, actionable improvement tips.
        5. A raw summary feedback.

        Return ONLY a valid JSON object with the following structure, and no additional text or formatting:
        {
          "score": 75,
          "skillsExtracted": ["React", "TypeScript", "Node.js"],
          "missingKeywords": ["Docker", "Redux", "CI/CD"],
          "improvementTips": ["Highlight experience with Docker and CI/CD tools.", "Include metrics in bullet points."],
          "rawFeedback": "The resume shows strong fundamentals in frontend/backend development, but lacks DevOps and containerization credentials."
        }

        Resume Text:
        ${resumeText}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = cleanJsonResponse(responseText);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error with Gemini analyzeResume, falling back to mock:', error);
      return this.getMockResumeAnalysis(targetRole);
    }
  }

  /**
   * Generate interview questions for a given role, difficulty, and experience level
   */
  static async generateQuestions(jobRole: string, difficulty: string, experienceLevel: string): Promise<string[]> {
    if (!genAI) {
      return this.getMockQuestions(jobRole, difficulty, experienceLevel);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are an elite tech recruiter conducting a technical and behavioral interview.
        Generate exactly 5 interview questions for a candidate with the following profile:
        - Job Role: ${jobRole}
        - Difficulty: ${difficulty}
        - Experience Level: ${experienceLevel}

        Include a mix of core technical questions, systems/design concepts, and soft skills or situational/behavioral questions.
        Return ONLY a valid JSON string containing an array of 5 strings (the questions) and no other text:
        [
          "Question 1...",
          "Question 2...",
          "Question 3...",
          "Question 4...",
          "Question 5..."
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = cleanJsonResponse(responseText);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error with Gemini generateQuestions, falling back to mock:', error);
      return this.getMockQuestions(jobRole, difficulty, experienceLevel);
    }
  }

  /**
   * Evaluate a user's answer to an interview question
   */
  static async evaluateAnswer(question: string, userAnswer: string) {
    if (!genAI) {
      return this.getMockAnswerEvaluation(question, userAnswer);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are an interviewer evaluating a candidate's response.
        - Question Asked: "${question}"
        - Candidate's Answer: "${userAnswer}"

        Provide:
        1. An assessment score (0 to 100).
        2. Constructive feedback highlighting strengths, weaknesses, and what they could have mentioned to make their answer better.

        Return ONLY a valid JSON object matching this structure, with no markdown styling outside the JSON:
        {
          "score": 80,
          "feedback": "The answer was good and mentioned React hook concepts, but lacked details on rendering performance."
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = cleanJsonResponse(responseText);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error with Gemini evaluateAnswer, falling back to mock:', error);
      return this.getMockAnswerEvaluation(question, userAnswer);
    }
  }

  /**
   * Recommend career paths and roadmaps based on user profile
   */
  static async getCareerRecommendations(skills: string[], weaknesses: string[]) {
    if (!genAI) {
      return this.getMockCareerRecommendations(skills, weaknesses);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are a senior career advisor in the tech industry.
        Based on the candidate's list of current skills and identified weaknesses, recommend matching career paths and a learning roadmap.
        
        Candidate Skills: [${skills.join(', ')}]
        Candidate Weaknesses: [${weaknesses.join(', ')}]

        Evaluate:
        1. 2-3 suitable career paths.
        2. A structured learning roadmap checklist.
        3. Recommended reference resources or study topics.

        Return ONLY a valid JSON object with the following structure:
        {
          "recommendedPaths": ["Full Stack Developer", "DevOps Engineer"],
          "learningRoadmap": ["Master Docker and Docker Compose", "Learn CI/CD pipelines", "Build secure API Gateways"],
          "studyResources": ["The DevOps Handbook", "Kubernets official tutorials", "Web security fundamentals (OWASP Top 10)"]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = cleanJsonResponse(responseText);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error with Gemini getCareerRecommendations, falling back to mock:', error);
      return this.getMockCareerRecommendations(skills, weaknesses);
    }
  }

  /**
   * Dynamically generate a brand new coding question based on topic and difficulty
   */
  static async generateCodingQuestion(difficulty: string, topic: string) {
    if (!genAI) {
      return this.getMockGeneratedQuestion(difficulty, topic);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are a principal software engineer designing coding interview problems.
        Generate a brand new, unique coding challenge based on:
        - Difficulty: ${difficulty}
        - Topic: ${topic}

        Provide:
        1. A clear title.
        2. A descriptive explanation of the problem, using markdown formatting for backticks and lists.
        3. Clear constraints.
        4. Starter boilerplate template codes for javascript (function named "solution") and python (def named "solution").
        5. Exactly 3 distinct test cases containing inputs (as an array of arguments) and expected output values.

        Return ONLY a valid JSON object matching this structure, with no markdown code blocks formatting outside the JSON:
        {
          "title": "Reverse Words",
          "description": "Given a string s, reverse the order of characters in each word...",
          "constraints": "1 <= s.length <= 500",
          "starterCode": {
            "javascript": "function solution(s) {\\n  // Write code\\n}",
            "python": "def solution(s):\\n    pass"
          },
          "testCases": [
            {"input": ["Let's write code"], "output": "s'teL etirw edoc"},
            {"input": ["hello"], "output": "olleh"}
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = cleanJsonResponse(responseText);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error in generateCodingQuestion, falling back to mock:', error);
      return this.getMockGeneratedQuestion(difficulty, topic);
    }
  }

  // --- MOCK FALLBACKS ---

  private static getMockResumeAnalysis(targetRole: string) {
    return {
      score: 72,
      skillsExtracted: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Git', 'REST APIs', 'Node.js'],
      missingKeywords: ['TypeScript', 'Docker', 'Prisma', 'Unit Testing', 'CI/CD'],
      improvementTips: [
        `Convert simple JavaScript bullet points to emphasize TypeScript for modern ${targetRole} positions.`,
        'Add a dedicated Projects section displaying full-stack SaaS project achievements.',
        'Reference specific deployment hosting environments (like AWS, Vercel, or Render) you have used.'
      ],
      rawFeedback: `Your resume demonstrates good foundational frontend knowledge. However, to stand out as a ${targetRole}, you should explicitly show experience with strongly-typed languages, state management, databases, and Docker deployment.`
    };
  }

  private static getMockQuestions(role: string, difficulty: string, level: string): string[] {
    const techMap: Record<string, string[]> = {
      'frontend developer': [
        'Explain the virtual DOM and how React reconciles changes.',
        'How does the browser render engine process HTML, CSS, and JS? Detail the Critical Rendering Path.',
        'What is your approach to optimizing page performance in a React/Next.js application?',
        'Describe the difference between server-side rendering (SSR) and static site generation (SSG).',
        'Tell me about a time you had to resolve a complex CSS layout or responsive alignment bug.'
      ],
      'backend developer': [
        'What is database normalization and when would you intentionally denormalize data?',
        'Explain how JWT works. What is the difference between Access Tokens and Refresh Tokens?',
        'How do you design a scalable rate limiter for an Express.js API?',
        'Describe the Event Loop in Node.js. How does it handle asynchronous I/O requests?',
        'How would you handle a production database crash? Walk me through database scaling strategies.'
      ]
    };

    const key = role.toLowerCase();
    return techMap[key] || [
      `What are the most challenging technical decisions you've made in your recent projects as a ${role}?`,
      `How do you handle conflict or differing technical opinions within an engineering team?`,
      `What is the difference between SQL and NoSQL databases? When do you choose one over the other?`,
      `Explain the concept of REST APIs and how they differ from GraphQL.`,
      `Describe how you ensure security and enforce JWT validation rules in web APIs.`
    ];
  }

  private static getMockAnswerEvaluation(question: string, answer: string) {
    const length = answer.trim().length;
    let score = 50;
    let feedback = '';

    if (length < 20) {
      score = 35;
      feedback = 'The answer was too brief. Try to structure your answers using the STAR method: Situation, Task, Action, and Result. Provide concrete technical definitions and examples.';
    } else if (length < 100) {
      score = 65;
      feedback = 'A decent attempt, but lacks depth. Elaborate on the core mechanism behind the question and mention real-world libraries or past experience.';
    } else {
      score = 85;
      feedback = 'Good, comprehensive answer. You detailed the concept well and provided relevant context. To reach 95+, mention specific performance tradeoffs and edge cases.';
    }

    return { score, feedback };
  }

  private static getMockCareerRecommendations(skills: string[], weaknesses: string[]) {
    return {
      recommendedPaths: [
        'Full-Stack Developer (MERN/PERN)',
        'Backend Engineer',
        'Solutions Architect'
      ],
      learningRoadmap: [
        'Study relational databases, database indexes, and advanced SQL commands',
        'Learn Docker to containerize applications and manage development environments',
        'Implement authentication flows, JWT refresh tokens, and rate limit protections',
        'Deploy applications on AWS or Railway with continuous integration'
      ],
      studyResources: [
        'FullStackOpen course by University of Helsinki',
        'Docker & Kubernetes - The Practical Guide (Academind)',
        'Designing Data-Intensive Applications (book by Martin Kleppmann)',
        'Prisma & SQL Performance Optimization guides'
      ]
    };
  }

  private static getMockGeneratedQuestion(difficulty: string, topic: string) {
    const list = [
      {
        title: 'Reverse Words in a String',
        description: 'Given an input string `s`, reverse the order of the words.\n\nA word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space.\n\nReturn a string of the words in reverse order concatenated by a single space.',
        constraints: '1 <= s.length <= 10^4\ns contains English letters, digits, and spaces.',
        difficulty,
        category: topic,
        starterCode: {
          javascript: `function solution(s) {\n  // Write your code here\n  return s.trim().split(/\\s+/).reverse().join(' ');\n}`,
          python: `def solution(s):\n    # Write your code here\n    return " ".join(s.split()[::-1])`
        },
        testCases: [
          { input: ['the sky is blue'], output: 'blue is sky the' },
          { input: ['  hello world  '], output: 'world hello' },
          { input: ['a good   example'], output: 'example good a' }
        ]
      },
      {
        title: 'Contains Duplicate',
        description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
        constraints: '1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9',
        difficulty,
        category: topic,
        starterCode: {
          javascript: `function solution(nums) {\n  // Write your code here\n  return new Set(nums).size !== nums.length;\n}`,
          python: `def solution(nums):\n    # Write your code here\n    return len(set(nums)) != len(nums)`
        },
        testCases: [
          { input: [[1, 2, 3, 1]], output: true },
          { input: [[1, 2, 3, 4]], output: false },
          { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], output: true }
        ]
      }
    ];
    return list[Math.floor(Math.random() * list.length)];
  }
}
