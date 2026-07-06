import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { GeminiService } from '../services/gemini.service';
import { successResponse, errorResponse } from '../utils/response';

export class InterviewController {
  static async startInterview(req: AuthRequest, res: Response) {
    const { jobRole, difficulty, experienceLevel } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    if (!jobRole || !difficulty || !experienceLevel) {
      return errorResponse(res, 'Job role, difficulty, and experience level are required.', 400);
    }

    try {
      // 1. Generate questions using Gemini API
      const questions = await GeminiService.generateQuestions(jobRole, difficulty, experienceLevel);

      // 2. Create MockInterview entry
      const mockInterview = await prisma.mockInterview.create({
        data: {
          userId,
          jobRole,
          difficulty,
          experienceLevel,
          status: 'IN_PROGRESS',
        },
      });

      return successResponse(res, 'Mock interview session initialized.', {
        interviewId: mockInterview.id,
        questions,
      }, 201);
    } catch (error: any) {
      console.error('Start Interview Error:', error);
      return errorResponse(res, 'Error starting mock interview.', 500, error.message);
    }
  }

  static async submitAnswer(req: AuthRequest, res: Response) {
    const { id } = req.params; // mockInterviewId
    const { question, userAnswer } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    if (!question || userAnswer === undefined) {
      return errorResponse(res, 'Question and userAnswer are required.', 400);
    }

    try {
      const mockInterview = await prisma.mockInterview.findUnique({
        where: { id },
      });

      if (!mockInterview || mockInterview.userId !== userId) {
        return errorResponse(res, 'Interview session not found or access denied.', 404);
      }

      if (mockInterview.status === 'COMPLETED') {
        return errorResponse(res, 'This interview session has already been completed.', 400);
      }

      // 1. Evaluate answer using Gemini API
      const evaluation = await GeminiService.evaluateAnswer(question, userAnswer);

      // 2. Save InterviewAnswer
      const answer = await prisma.interviewAnswer.create({
        data: {
          mockInterviewId: id,
          question,
          userAnswer,
          aiFeedback: evaluation.feedback || 'No feedback provided.',
          aiScore: Number(evaluation.score || 0),
        },
      });

      return successResponse(res, 'Answer submitted and evaluated.', answer);
    } catch (error: any) {
      console.error('Submit Answer Error:', error);
      return errorResponse(res, 'Error submitting interview answer.', 500, error.message);
    }
  }

  static async finishInterview(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const mockInterview = await prisma.mockInterview.findUnique({
        where: { id },
        include: { answers: true },
      });

      if (!mockInterview || mockInterview.userId !== userId) {
        return errorResponse(res, 'Interview session not found or access denied.', 404);
      }

      if (mockInterview.status === 'COMPLETED') {
        return successResponse(res, 'Interview was already marked completed.', mockInterview);
      }

      const answers = mockInterview.answers;
      if (answers.length === 0) {
        return errorResponse(res, 'Cannot finish interview with 0 answers.', 400);
      }

      // Calculate aggregate score
      const totalScore = answers.reduce((sum, item) => sum + item.aiScore, 0);
      const averageScore = Math.round(totalScore / answers.length);

      // Update MockInterview status
      const updatedInterview = await prisma.mockInterview.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          score: averageScore,
        },
        include: { answers: true },
      });

      // Save to Analytics
      await prisma.analytics.create({
        data: {
          userId,
          category: 'MOCK_INTERVIEW',
          metricName: 'score',
          metricValue: Number(averageScore),
        },
      });

      // Send a notification of completion
      await prisma.notification.create({
        data: {
          userId,
          title: 'Mock Interview Completed!',
          message: `You completed your ${mockInterview.jobRole} mock interview with a score of ${averageScore}%.`,
        },
      });

      return successResponse(res, 'Mock interview marked completed.', updatedInterview);
    } catch (error: any) {
      console.error('Finish Interview Error:', error);
      return errorResponse(res, 'Error completing interview.', 500, error.message);
    }
  }

  static async getHistory(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const history = await prisma.mockInterview.findMany({
        where: { userId },
        include: { answers: true },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(res, 'Interview history retrieved.', history);
    } catch (error: any) {
      console.error('Get Interview History Error:', error);
      return errorResponse(res, 'Error retrieving interview history.', 500, error.message);
    }
  }

  static async getReport(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const interview = await prisma.mockInterview.findUnique({
        where: { id },
        include: {
          answers: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });

      if (!interview || interview.userId !== userId) {
        return errorResponse(res, 'Interview report not found or access denied.', 404);
      }

      // Generate supplementary AI roadmap based on average score & answers
      // We will perform a quick analysis if finished
      let recommendations = null;
      if (interview.status === 'COMPLETED' && interview.score !== null) {
        const weakAnswers = interview.answers.filter(a => a.aiScore < 70);
        const weakSkills = weakAnswers.map(a => a.question.split(' ').slice(0, 3).join(' ')); // Simple heuristic
        const currentSkills = [interview.jobRole];
        recommendations = await GeminiService.getCareerRecommendations(currentSkills, weakSkills);
      }

      return successResponse(res, 'Interview report retrieved.', {
        interview,
        recommendations,
      });
    } catch (error: any) {
      console.error('Get Interview Report Error:', error);
      return errorResponse(res, 'Error retrieving interview report.', 500, error.message);
    }
  }
}
