import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { apiResponse } from '../middleware/error';

const prisma = new PrismaClient();

// Get all users
export const adminGetUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        select: { id: true, username: true, roleType: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });
    return apiResponse(res, 200, 'Success', users);
};

// Toggle user status (ACTIVE / BANNED)
export const adminToggleUserStatus = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiResponse(res, 404, 'User not found');
    if (user.roleType === 'ADMIN') return apiResponse(res, 400, 'Cannot ban another admin directly');

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { status }
    });

    return apiResponse(res, 200, `User status updated to ${status}`, updatedUser);
};

// Reset user password
export const adminResetUserPassword = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');
    if (!newPassword || newPassword.length < 6) return apiResponse(res, 400, 'Password must be at least 6 characters');

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiResponse(res, 404, 'User not found');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id },
        data: { passwordHash }
    });

    return apiResponse(res, 200, 'User password reset successfully');
};

// Add Sub-Admin
export const adminAddSubAdmin = async (req: Request, res: Response) => {
    const { username, password, permissions } = req.body;

    // Check if the current user is SUPER_ADMIN
    // Need to cast req to any to read req.user from AuthRequest wrapper since req is 'Request' here
    const authReq = req as any;
    if (authReq.user.roleType !== 'SUPER_ADMIN') {
        return apiResponse(res, 403, 'Forbidden: Only SUPER_ADMIN can create sub-admins');
    }

    if (!username || !password) return apiResponse(res, 400, 'Username and password are required');

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return apiResponse(res, 400, 'Username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
        data: {
            username,
            passwordHash,
            roleType: 'ADMIN',
            permissions: permissions || ''
        }
    });

    return apiResponse(res, 201, 'Sub-admin created successfully');
};

// Get Operation Logs
export const adminGetOperationLogs = async (req: Request, res: Response) => {
    const logs = await prisma.operationLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } },
        take: 100 // Limit to recent 100 for simplicity
    });
    return apiResponse(res, 200, 'Success', logs);
};
