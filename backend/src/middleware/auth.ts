import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { apiResponse } from './error';
import { isAdminRole } from '../utils/role';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        username: string;
        roleType: string;
    };
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return apiResponse(res, 401, 'Unauthorized: Missing token');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            // Backward compatibility for legacy token payloads that used `role`
            roleType: decoded.roleType ?? decoded.role
        };
        next();
    } catch (error) {
        return apiResponse(res, 403, 'Forbidden: Invalid token');
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !isAdminRole(req.user.roleType)) {
        return apiResponse(res, 403, 'Forbidden: Admin access required');
    }
    next();
};
