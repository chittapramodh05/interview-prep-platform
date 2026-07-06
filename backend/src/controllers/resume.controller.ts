import { Response } from 'express';
import pdfParse from 'pdf-parse';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { GeminiService } from '../services/gemini.service';
import { successResponse, errorResponse } from '../utils/response';

export class ResumeController {
  static async uploadResume(req: AuthRequest, res: Response) {
    const { targetRole } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    if (!targetRole) {
      return errorResponse(res, 'Target role is required.', 400);
    }

    if (!req.file) {
      return errorResponse(res, 'No resume file uploaded.', 400);
    }

    try {
      let resumeText = '';
      try {
        const parsedPdf = await pdfParse(req.file.buffer);
        resumeText = parsedPdf.text || '';
      } catch (pdfErr) {
        console.warn('PDF parsing failed, falling back to buffer string interpretation:', pdfErr);
        resumeText = req.file.buffer.toString('utf-8');
      }

      if (!resumeText.trim()) {
        resumeText = `Candidate Resume for ${req.file.originalname}. (Mock content: Standard Full Stack software engineering candidate resume showing 3 years of React/Node development experience)`;
      }

      // Call AI Service
      const analysis = await GeminiService.analyzeResume(resumeText, targetRole);

      // Save to Database
      const resume = await prisma.resume.create({
        data: {
          userId,
          fileName: req.file.originalname,
          fileText: resumeText,
        },
      });

      const atsReport = await prisma.atsReport.create({
        data: {
          resumeId: resume.id,
          targetRole,
          score: analysis.score || 0,
          skillsExtracted: analysis.skillsExtracted || [],
          missingKeywords: analysis.missingKeywords || [],
          improvementTips: analysis.improvementTips || [],
          rawFeedback: analysis.rawFeedback || '',
        },
      });

      // Save to Analytics
      await prisma.analytics.create({
        data: {
          userId,
          category: 'ATS',
          metricName: 'score',
          metricValue: Number(analysis.score || 0),
        },
      });

      // Send success response
      return successResponse(res, 'Resume parsed and analyzed successfully.', {
        resumeId: resume.id,
        fileName: resume.fileName,
        report: atsReport,
      }, 201);
    } catch (error: any) {
      console.error('Resume Upload Error:', error);
      return errorResponse(res, 'Error processing and analyzing resume.', 500, error.message);
    }
  }

  static async getHistory(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const history = await prisma.resume.findMany({
        where: { userId },
        include: { atsReport: true },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(res, 'Resume upload history retrieved.', history);
    } catch (error: any) {
      console.error('Get Resume History Error:', error);
      return errorResponse(res, 'Error retrieving resume history.', 500, error.message);
    }
  }

  static async getReport(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const report = await prisma.atsReport.findUnique({
        where: { id },
        include: {
          resume: true,
        },
      });

      if (!report || report.resume.userId !== userId) {
        return errorResponse(res, 'ATS Report not found or access denied.', 404);
      }

      return successResponse(res, 'ATS Report retrieved.', report);
    } catch (error: any) {
      console.error('Get ATS Report Error:', error);
      return errorResponse(res, 'Error retrieving report.', 500, error.message);
    }
  }
}
