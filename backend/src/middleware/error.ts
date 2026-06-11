import { Request, Response, NextFunction } from 'express';

// Standard API response interface wrapper
export const apiResponse = (res: Response, code: number, message: string, data: any = null) => {
    return res.status(code).json({
        code,
        message,
        data,
    });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return apiResponse(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
};

// Async wrapper for controllers to catch errors
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
