import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const apiResponse = (res: Response, code: number, message: string, data: any = null) => {
    return res.status(code).json({
        code,
        message,
        data,
    });
};

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
    P2000: { status: 400, message: '输入数据超过字段允许长度' },
    P2001: { status: 404, message: '记录不存在' },
    P2002: { status: 409, message: '数据唯一约束冲突，记录已存在' },
    P2003: { status: 400, message: '关联数据外键约束失败' },
    P2004: { status: 400, message: '数据库约束违反' },
    P2005: { status: 400, message: '字段值存储无效' },
    P2006: { status: 400, message: '字段值提供无效' },
    P2007: { status: 400, message: '数据校验错误' },
    P2008: { status: 400, message: '查询解析失败' },
    P2009: { status: 400, message: '查询验证失败' },
    P2010: { status: 400, message: '原始查询执行失败' },
    P2011: { status: 400, message: '空值约束违反' },
    P2012: { status: 400, message: '缺少必填字段值' },
    P2013: { status: 400, message: '缺少必填参数字段' },
    P2014: { status: 400, message: '关联关系变更违反要求' },
    P2015: { status: 404, message: '关联记录未找到' },
    P2016: { status: 400, message: '查询解释错误' },
    P2017: { status: 400, message: '关联记录未连接' },
    P2018: { status: 404, message: '所需关联记录未找到' },
    P2019: { status: 400, message: '输入错误' },
    P2020: { status: 400, message: '值超出范围' },
    P2021: { status: 500, message: '数据表不存在' },
    P2022: { status: 500, message: '数据列不存在' },
    P2023: { status: 400, message: '数据不一致' },
    P2024: { status: 503, message: '数据库连接池超时' },
    P2025: { status: 404, message: '操作的记录不存在' },
    P2026: { status: 500, message: '当前数据库提供者不支持该特性' },
    P2027: { status: 500, message: '数据库执行出现多错误' },
};

const extractPrismaFields = (err: any): string => {
    try {
        if (err.code === 'P2002' && err.meta?.target) {
            const target = Array.isArray(err.meta.target)
                ? err.meta.target.join(', ')
                : String(err.meta.target);
            return ` (${target})`;
        }
        if (err.code === 'P2025' && err.meta?.cause) {
            return ` (${err.meta.cause})`;
        }
        if (err.code === 'P2000' && err.meta?.column_name) {
            return ` (${err.meta.column_name})`;
        }
    } catch {
        // ignore
    }
    return '';
};

const resolvePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
    const mapping = PRISMA_ERROR_MAP[err.code];
    if (!mapping) {
        return { status: 500, message: `数据库错误: ${err.message}` };
    }
    const fields = extractPrismaFields(err);
    return { status: mapping.status, message: `${mapping.message}${fields}` };
};

const isPrismaKnownError = (err: any): err is Prisma.PrismaClientKnownRequestError => {
    return (
        err?.name === 'PrismaClientKnownRequestError' ||
        (typeof err?.code === 'string' && err.code.startsWith('P2'))
    );
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]:', err);

    let statusCode: number;
    let message: string;

    if (isPrismaKnownError(err)) {
        const resolved = resolvePrismaError(err);
        statusCode = resolved.status;
        message = resolved.message;
    } else if (err.name === 'PrismaClientValidationError' || err.name === 'PrismaClientUnknownRequestError') {
        statusCode = 400;
        message = '数据查询参数校验失败';
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = err.name === 'TokenExpiredError' ? '认证令牌已过期' : '认证令牌无效';
    } else if (err.name === 'ZodError') {
        statusCode = 400;
        message = '请求数据格式验证失败';
    } else {
        statusCode = err.statusCode || 500;
        message = err.message || 'Internal Server Error';
    }

    return apiResponse(
        res,
        statusCode,
        message,
        process.env.NODE_ENV === 'development' ? (err.stack ?? null) : null
    );
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
