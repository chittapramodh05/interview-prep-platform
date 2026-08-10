import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey';

const generateAccessToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user: { id: string }) => {
  return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return errorResponse(res, 'Email, password, and name are required.', 400);
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return errorResponse(res, 'User with this email already exists.', 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // First user registered can be ADMIN, subsequent users are USER
      const userCount = await prisma.user.count();
      const role = userCount === 0 ? 'ADMIN' : 'USER';

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role,
        },
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Set cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, 'User registered successfully.', {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: accessToken,
      }, 201);
    } catch (error: any) {
      console.error('Registration Error:', error);
      return errorResponse(res, 'Error registering user.', 500, error.message);
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return errorResponse(res, 'Invalid email or password.', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return errorResponse(res, 'Invalid email or password.', 401);
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, 'User logged in successfully.', {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: accessToken,
      });
    } catch (error: any) {
      console.error('Login Error:', error);
      return errorResponse(res, 'Error logging in user.', 500, error.message);
    }
  }

  static async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return errorResponse(res, 'Refresh token required.', 401);
    }

    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || user.refreshToken !== token) {
        return errorResponse(res, 'Invalid refresh token.', 403);
      }

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, 'Token refreshed successfully.', {
        token: accessToken,
      });
    } catch (error: any) {
      console.error('Refresh Error:', error);
      return errorResponse(res, 'Invalid or expired refresh token.', 403, error.message);
    }
  }

  static async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    try {
      if (token) {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
        await prisma.user.update({
          where: { id: decoded.id },
          data: { refreshToken: null },
        });
      }
    } catch (_) {}

    res.clearCookie('refreshToken');
    return successResponse(res, 'Logged out successfully.');
  }

  static async googleLogin(req: Request, res: Response) {
    const { token, idToken, email, name, googleId } = req.body;
    const credentialToken = idToken || token;

    try {
      let userEmail = email;
      let userName = name;
      let userGoogleId = googleId;

      // If a real Google OAuth ID token is provided from frontend Google Sign-In
      if (credentialToken) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credentialToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (payload) {
            userEmail = payload.email || userEmail;
            userName = payload.name || userName || 'Google Candidate';
            userGoogleId = payload.sub;
          }
        } catch (verifyError: any) {
          console.warn('Google ID Token verification warning (falling back if body provided):', verifyError.message);
        }
      }

      if (!userEmail) {
        return errorResponse(res, 'Google authentication failed: Email is required.', 400);
      }

      let user = await prisma.user.findUnique({ where: { email: userEmail } });

      if (!user) {
        // Create new user for Google login
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userName || 'Google Candidate',
            googleId: userGoogleId || `g_mock_${Date.now()}`,
            role: 'USER',
          },
        });
      } else if (!user.googleId && userGoogleId) {
        // Link Google ID to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: userGoogleId },
        });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, 'Google login successful.', {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: accessToken,
      });
    } catch (error: any) {
      console.error('Google OAuth Login Error:', error);
      return errorResponse(res, 'Google authentication failed.', 500, error.message);
    }
  }
}
