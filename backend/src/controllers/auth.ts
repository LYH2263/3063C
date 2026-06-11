import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { apiResponse } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return apiResponse(res, 400, 'Username and password are required');
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        return apiResponse(res, 401, 'Invalid credentials');
    }

    if (user.status === 'BANNED') {
        return apiResponse(res, 403, 'Your account is banned');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        return apiResponse(res, 401, 'Invalid credentials');
    }

    const token = jwt.sign(
        { userId: user.id, username: user.username, roleType: user.roleType },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return apiResponse(res, 200, 'Login successful', {
        token,
        user: {
            id: user.id,
            username: user.username,
            roleType: user.roleType
        }
    });
};

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return apiResponse(res, 400, 'Username and password are required');
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
        return apiResponse(res, 400, 'Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username,
            passwordHash,
            roleType: 'USER'
        }
    });

    return apiResponse(res, 201, 'Registration successful');
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { password } = req.body;

    if (!password) {
        return apiResponse(res, 400, '密码不能为空 (Password is required)');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
    });

    return apiResponse(res, 200, '资料修改成功 (Profile updated successfully)');
};
