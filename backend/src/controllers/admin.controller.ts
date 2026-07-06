import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse } from '../utils/response';

export class AdminController {
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(res, 'Users list retrieved for admin.', users);
    } catch (error: any) {
      console.error('Admin Get Users Error:', error);
      return errorResponse(res, 'Error retrieving users list.', 500, error.message);
    }
  }

  static async createCodingQuestion(req: AuthRequest, res: Response) {
    const { title, description, constraints, difficulty, category, starterCode, testCases } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    if (!title || !description || !constraints || !difficulty || !category || !starterCode || !testCases) {
      return errorResponse(res, 'All coding question fields are required.', 400);
    }

    try {
      const question = await prisma.codingQuestion.create({
        data: {
          title,
          description,
          constraints,
          difficulty,
          category,
          starterCode,
          testCases,
        },
      });

      // Log admin action
      await prisma.adminLog.create({
        data: {
          userId: adminId,
          action: 'CREATE_CODING_QUESTION',
          details: `Created coding question "${title}" with ID: ${question.id}`,
        },
      });

      return successResponse(res, 'Coding question created successfully.', question, 201);
    } catch (error: any) {
      console.error('Admin Create Question Error:', error);
      return errorResponse(res, 'Error creating coding question.', 500, error.message);
    }
  }

  static async getPlatformStats(req: AuthRequest, res: Response) {
    const adminId = req.user?.id;

    if (!adminId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const totalUsers = await prisma.user.count();
      const totalResumes = await prisma.resume.count();
      const totalInterviews = await prisma.mockInterview.count();
      const totalSubmissions = await prisma.codingSubmission.count();
      const adminLogs = await prisma.adminLog.findMany({
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      });

      return successResponse(res, 'Platform statistics compiled.', {
        totalUsers,
        totalResumes,
        totalInterviews,
        totalSubmissions,
        adminLogs,
      });
    } catch (error: any) {
      console.error('Admin Get Stats Error:', error);
      return errorResponse(res, 'Error retrieving platform statistics.', 500, error.message);
    }
  }
}
