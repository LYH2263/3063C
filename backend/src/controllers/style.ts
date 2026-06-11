import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { apiResponse } from '../middleware/error';

const prisma = new PrismaClient();

// Get the currently active style (public)
export const getActiveStyle = async (req: Request, res: Response) => {
    const activeStyle = await prisma.styleConfig.findFirst({
        where: { isActive: true }
    });
    if (!activeStyle) {
        return apiResponse(res, 404, 'No active style found');
    }
    return apiResponse(res, 200, 'Success', activeStyle);
};

// Admin: Get all styles
export const getAllStyles = async (req: Request, res: Response) => {
    const styles = await prisma.styleConfig.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return apiResponse(res, 200, 'Success', styles);
};

// Admin: Create style
export const createStyle = async (req: Request, res: Response) => {
    const { name, primaryColor, fontFamily, layoutMode, backgroundImage } = req.body;
    if (!name || !primaryColor || !fontFamily) {
        return apiResponse(res, 400, 'Missing required fields');
    }

    const style = await prisma.styleConfig.create({
        data: { name, primaryColor, fontFamily, layoutMode, backgroundImage }
    });
    return apiResponse(res, 201, 'Style created', style);
};

// Admin: Update style
export const updateStyle = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');

    const { name, primaryColor, fontFamily, layoutMode, backgroundImage } = req.body;

    const style = await prisma.styleConfig.update({
        where: { id },
        data: { name, primaryColor, fontFamily, layoutMode, backgroundImage }
    });
    return apiResponse(res, 200, 'Style updated', style);
};

// Admin: Set active style
export const setActiveStyle = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');

    await prisma.$transaction([
        prisma.styleConfig.updateMany({ data: { isActive: false } }),
        prisma.styleConfig.update({ where: { id }, data: { isActive: true } })
    ]);

    return apiResponse(res, 200, 'Style activated');
};

// Admin: Delete style
export const deleteStyle = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');

    const style = await prisma.styleConfig.findUnique({ where: { id } });
    if (!style) return apiResponse(res, 404, 'Style not found');
    if (style.isActive) {
        return apiResponse(res, 400, 'Cannot delete an active style');
    }
    if (style.name === '默认风格(Default)') {
        return apiResponse(res, 400, 'Cannot delete the default style');
    }

    await prisma.styleConfig.delete({ where: { id } });
    return apiResponse(res, 200, 'Style deleted');
};
