import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { CodeRunnerService, TestCase } from '../services/codeRunner.service';
import { successResponse, errorResponse } from '../utils/response';
import { GeminiService } from '../services/gemini.service';

// Seed questions list
const DEFAULT_QUESTIONS = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    difficulty: 'EASY',
    category: 'Arrays & Hashing',
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your JS code here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def twoSum(nums, target):\n    # Write your Python code here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], output: [0, 1] },
      { input: [[3, 2, 4], 6], output: [1, 2] },
      { input: [[3, 3], 6], output: [0, 1] }
    ]
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
    difficulty: 'EASY',
    category: 'Stack',
    starterCode: {
      javascript: `function isValid(s) {\n  // Write your JS code here\n  const stack = [];\n  const map = {\n    ')': '(',\n    '}': '{',\n    ']': '['\n  };\n  for (let char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def isValid(s):\n    # Write your Python code here\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping.values():\n            stack.append(char)\n        elif char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            return False\n    return len(stack) == 0`
    },
    testCases: [
      { input: ['()'], output: true },
      { input: ['()[]{}'], output: true },
      { input: ['(]'], output: false },
      { input: ['([)]'], output: false },
      { input: ['{[]}'], output: true }
    ]
  },
  {
    title: 'Fibonacci Number',
    description: 'The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from `0` and `1`.\n\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2), for n > 1.\n\nGiven `n`, calculate `F(n)`.',
    constraints: '0 <= n <= 30',
    difficulty: 'EASY',
    category: 'Dynamic Programming',
    starterCode: {
      javascript: `function fib(n) {\n  // Write your JS code here\n  if (n <= 1) return n;\n  let prev2 = 0, prev1 = 1;\n  for (let i = 2; i <= n; i++) {\n    const current = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = current;\n  }\n  return prev1;\n}`,
      python: `def fib(n):\n    # Write your Python code here\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`
    },
    testCases: [
      { input: [2], output: 1 },
      { input: [3], output: 2 },
      { input: [4], output: 3 },
      { input: [9], output: 34 }
    ]
  }
];

export class CodingController {
  /**
   * Helper to ensure database is seeded with default questions
   */
  private static async ensureSeeded() {
    const count = await prisma.codingQuestion.count();
    if (count === 0) {
      console.log('Seeding default coding questions...');
      for (const q of DEFAULT_QUESTIONS) {
        await prisma.codingQuestion.create({
          data: {
            title: q.title,
            description: q.description,
            constraints: q.constraints,
            difficulty: q.difficulty,
            category: q.category,
            starterCode: q.starterCode,
            testCases: q.testCases,
          },
        });
      }
    }
  }

  static async getQuestions(req: Request, res: Response) {
    try {
      await CodingController.ensureSeeded();
      const questions = await prisma.codingQuestion.findMany({
        select: {
          id: true,
          title: true,
          difficulty: true,
          category: true,
          createdAt: true,
        },
      });
      return successResponse(res, 'Coding questions retrieved.', questions);
    } catch (error: any) {
      console.error('Get Questions Error:', error);
      return errorResponse(res, 'Error retrieving coding questions.', 500, error.message);
    }
  }

  static async getQuestionById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const question = await prisma.codingQuestion.findUnique({
        where: { id },
      });

      if (!question) {
        return errorResponse(res, 'Coding question not found.', 404);
      }

      return successResponse(res, 'Coding question details retrieved.', question);
    } catch (error: any) {
      console.error('Get Question Details Error:', error);
      return errorResponse(res, 'Error retrieving question details.', 500, error.message);
    }
  }

  static async runCode(req: Request, res: Response) {
    const { questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return errorResponse(res, 'QuestionId, code, and language are required.', 400);
    }

    try {
      const question = await prisma.codingQuestion.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return errorResponse(res, 'Coding question not found.', 404);
      }

      const testCases = question.testCases as unknown as TestCase[];
      // Guess function name based on title: Two Sum -> twoSum, Valid Parentheses -> isValid, Fibonacci Number -> fib
      let functionName = 'solution';
      if (question.title === 'Two Sum') functionName = 'twoSum';
      else if (question.title === 'Valid Parentheses') functionName = 'isValid';
      else if (question.title === 'Fibonacci Number') functionName = 'fib';

      let results;
      if (language === 'javascript') {
        results = CodeRunnerService.runJavaScript(code, testCases, functionName);
      } else if (language === 'python') {
        results = await CodeRunnerService.runPython(code, testCases, functionName);
      } else {
        return errorResponse(res, 'Unsupported language for dry-run.', 400);
      }

      return successResponse(res, 'Dry run completed.', results);
    } catch (error: any) {
      console.error('Run Code Error:', error);
      return errorResponse(res, 'Error executing dry run.', 500, error.message);
    }
  }

  static async submitCode(req: AuthRequest, res: Response) {
    const { questionId, code, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    if (!questionId || !code || !language) {
      return errorResponse(res, 'QuestionId, code, and language are required.', 400);
    }

    try {
      const question = await prisma.codingQuestion.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return errorResponse(res, 'Coding question not found.', 404);
      }

      const testCases = question.testCases as unknown as TestCase[];
      let functionName = 'solution';
      if (question.title === 'Two Sum') functionName = 'twoSum';
      else if (question.title === 'Valid Parentheses') functionName = 'isValid';
      else if (question.title === 'Fibonacci Number') functionName = 'fib';

      let results;
      if (language === 'javascript') {
        results = CodeRunnerService.runJavaScript(code, testCases, functionName);
      } else if (language === 'python') {
        results = await CodeRunnerService.runPython(code, testCases, functionName);
      } else {
        return errorResponse(res, 'Unsupported language for code submission.', 400);
      }

      const score = Math.round((results.passedCount / results.totalCount) * 100);

      // Save submission
      const submission = await prisma.codingSubmission.create({
        data: {
          userId,
          codingQuestionId: questionId,
          code,
          language,
          status: results.status,
          score,
        },
      });

      // Save to Analytics
      await prisma.analytics.create({
        data: {
          userId,
          category: 'CODING',
          metricName: 'score',
          metricValue: Number(score),
        },
      });

      // Save count completion to Analytics if accepted
      if (results.status === 'ACCEPTED') {
        await prisma.analytics.create({
          data: {
            userId,
            category: 'CODING',
            metricName: 'completed',
            metricValue: 1,
          },
        });
      }

      // Check if user has notification achievement
      if (results.status === 'ACCEPTED') {
        await prisma.notification.create({
          data: {
            userId,
            title: 'Coding Problem Solved!',
            message: `Congratulations! Your solution for "${question.title}" was accepted with 100% test cases passing.`,
          },
        });
      }

      return successResponse(res, 'Submission completed.', {
        submissionId: submission.id,
        status: submission.status,
        score: submission.score,
        passedCount: results.passedCount,
        totalCount: results.totalCount,
        details: results.results,
      });
    } catch (error: any) {
      console.error('Submit Code Error:', error);
      return errorResponse(res, 'Error processing code submission.', 500, error.message);
    }
  }

  static async getSubmissions(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const submissions = await prisma.codingSubmission.findMany({
        where: { userId },
        include: {
          codingQuestion: {
            select: { title: true, difficulty: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(res, 'Coding submissions history retrieved.', submissions);
    } catch (error: any) {
      console.error('Get Submissions History Error:', error);
      return errorResponse(res, 'Error retrieving submissions history.', 500, error.message);
    }
  }

  static async generateQuestion(req: AuthRequest, res: Response) {
    const { difficulty, topic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const actualDifficulty = difficulty || 'EASY';
      const actualTopic = topic || 'Arrays';

      const generated = await GeminiService.generateCodingQuestion(actualDifficulty, actualTopic);

      // Save question
      const question = await prisma.codingQuestion.create({
        data: {
          title: generated.title,
          description: generated.description,
          constraints: generated.constraints || 'No constraints.',
          difficulty: generated.difficulty || actualDifficulty,
          category: generated.category || actualTopic,
          starterCode: generated.starterCode,
          testCases: generated.testCases,
        },
      });

      // Log action
      await prisma.adminLog.create({
        data: {
          userId,
          action: 'GENERATE_CODING_QUESTION',
          details: `AI Generated coding question "${question.title}" with ID: ${question.id}`,
        },
      });

      return successResponse(res, 'Coding challenge generated by AI.', question, 201);
    } catch (error: any) {
      console.error('AI Generate Question Error:', error);
      return errorResponse(res, 'Error generating coding question with AI.', 500, error.message);
    }
  }
}
