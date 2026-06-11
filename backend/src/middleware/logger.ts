import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../lib/prisma';

export const logOperation = (actionName: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        // We defer the logging to happen when the request finishes
        res.on('finish', async () => {
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
                try {
                    await prisma.operationLog.create({
                        data: {
                            userId: req.user.userId,
                            action: actionName,
                            ip: req.ip || req.connection.remoteAddress || 'unknown'
                        }
                    });
                } catch (err) {
                    console.error('Failed to write operation log:', err);
                }
            }
        });
        next();
    };
};
