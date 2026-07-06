import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse } from '../utils/response';

export class AnalyticsController {
  static async getDashboardStats(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      // 1. Get user resumes and average ATS score
      const resumes = await prisma.resume.findMany({
        where: { userId },
        include: { atsReport: true },
      });
      const atsScores = resumes.map(r => r.atsReport?.score || 0).filter(s => s > 0);
      const avgAts = atsScores.length > 0 ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : 0;

      // 2. Get mock interviews count and average score
      const interviews = await prisma.mockInterview.findMany({
        where: { userId, status: 'COMPLETED' },
      });
      const interviewScores = interviews.map(i => i.score || 0);
      const avgInterview = interviewScores.length > 0 ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length) : 0;

      // 3. Get coding submissions count and stats
      const totalCodingSubmissions = await prisma.codingSubmission.count({
        where: { userId },
      });
      const acceptedCodingSubmissions = await prisma.codingSubmission.count({
        where: { userId, status: 'ACCEPTED' },
      });
      // Unique accepted questions
      const uniqueCodingAccepted = await prisma.codingSubmission.groupBy({
        by: ['codingQuestionId'],
        where: { userId, status: 'ACCEPTED' },
      });

      // 4. Calculate Interview Readiness Score
      // Standard weighted formula: 30% ATS + 35% Mock Interviews + 35% Coding accuracy
      const codingAccuracy = totalCodingSubmissions > 0 ? Math.round((acceptedCodingSubmissions / totalCodingSubmissions) * 100) : 0;
      
      let readinessScore = 0;
      let divider = 0;
      if (avgAts > 0) { readinessScore += avgAts * 0.3; divider += 0.3; }
      if (avgInterview > 0) { readinessScore += avgInterview * 0.35; divider += 0.35; }
      if (codingAccuracy > 0) { readinessScore += codingAccuracy * 0.35; divider += 0.35; }
      readinessScore = divider > 0 ? Math.round(readinessScore / divider) : 40; // Default baseline is 40%

      // 5. Gather weekly progress data (past 7 days activity)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const weeklyAnalytics = await prisma.analytics.findMany({
        where: {
          userId,
          recordedAt: { gte: sevenDaysAgo },
        },
        orderBy: { recordedAt: 'asc' },
      });

      // Map weekly data into days
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDayIndex = new Date().getDay();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          day: daysOfWeek[d.getDay()],
          dateStr: d.toISOString().split('T')[0],
          ATS: 0,
          Interview: 0,
          Coding: 0,
        };
      });

      // Populate weekly statistics
      weeklyAnalytics.forEach(activity => {
        const dateStr = activity.recordedAt.toISOString().split('T')[0];
        const dayItem = last7Days.find(d => d.dateStr === dateStr);
        if (dayItem) {
          if (activity.category === 'ATS') dayItem.ATS = activity.metricValue;
          if (activity.category === 'MOCK_INTERVIEW') dayItem.Interview = activity.metricValue;
          if (activity.category === 'CODING' && activity.metricName === 'score') dayItem.Coding = activity.metricValue;
        }
      });

      // 6. Recommended study topics based on performance
      const recommendations = [];
      if (avgAts < 70) {
        recommendations.push({
          topic: 'Resume Formatting & Keywording',
          reason: 'Your average ATS Compatibility score is below 70%. Tailor your CV to job requirements.',
          actionLink: '/dashboard/resume',
        });
      }
      if (avgInterview < 70) {
        recommendations.push({
          topic: 'Behavioral & Situational STAR method',
          reason: 'Your interview practice scores suggest you need deeper answers. Practice behavioral questions.',
          actionLink: '/dashboard/mock',
        });
      }
      if (codingAccuracy < 60) {
        recommendations.push({
          topic: 'Data Structures & Algorithms (Stack/DP)',
          reason: 'Your coding submission success rate is low. Solve beginner problems to build confidence.',
          actionLink: '/dashboard/coding',
        });
      }
      if (recommendations.length === 0) {
        recommendations.push({
          topic: 'Advanced System Architecture',
          reason: 'You are doing great! Elevate your preparation with complex database scaling designs.',
          actionLink: '/dashboard/mock',
        });
      }

      // 7. Get user notifications
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return successResponse(res, 'Dashboard stats compiled successfully.', {
        readinessScore,
        avgAts,
        avgInterview,
        completedInterviews: interviews.length,
        completedCoding: uniqueCodingAccepted.length,
        weeklyProgress: last7Days,
        recommendations,
        notifications,
      });
    } catch (error: any) {
      console.error('Get Dashboard Stats Error:', error);
      return errorResponse(res, 'Error retrieving dashboard stats.', 500, error.message);
    }
  }

  static async getNotifications(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const list = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(res, 'Notifications retrieved.', list);
    } catch (error: any) {
      console.error('Get Notifications Error:', error);
      return errorResponse(res, 'Error retrieving notifications.', 500, error.message);
    }
  }

  static async markNotificationRead(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const notification = await prisma.notification.findUnique({ where: { id } });

      if (!notification || notification.userId !== userId) {
        return errorResponse(res, 'Notification not found.', 404);
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return successResponse(res, 'Notification marked as read.', updated);
    } catch (error: any) {
      console.error('Mark Notification Read Error:', error);
      return errorResponse(res, 'Error updating notification.', 500, error.message);
    }
  }
}
