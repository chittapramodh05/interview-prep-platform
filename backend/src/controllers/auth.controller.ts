import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

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
    const { token, email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return errorResponse(res, 'Google email, name, and googleId are required.', 400);
    }

    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create user
        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId,
            role: 'USER',
          },
        });
      } else if (!user.googleId) {
        // Link Google ID if not linked
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
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
