import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { apiResponse } from '../middleware/error';

const prisma = new PrismaClient();

// Get settings (public)
export const getSettings = async (req: Request, res: Response) => {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
        settings = await prisma.systemSetting.create({
            data: {}
        });
    }
    return apiResponse(res, 200, 'Success', settings);
};

// Update settings (admin only)
export const updateSettings = async (req: Request, res: Response) => {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
        settings = await prisma.systemSetting.create({ data: {} });
    }

    const { siteTitle, logoUrl, contactInfo, icpInfo, enableMessageReview, enableWorkReview, enableRegistration } = req.body;

    const updated = await prisma.systemSetting.update({
        where: { id: settings.id },
        data: {
            siteTitle: siteTitle ?? settings.siteTitle,
            logoUrl: logoUrl ?? settings.logoUrl,
            contactInfo: contactInfo ?? settings.contactInfo,
            icpInfo: icpInfo ?? settings.icpInfo,
            enableMessageReview: enableMessageReview ?? settings.enableMessageReview,
            enableWorkReview: enableWorkReview ?? settings.enableWorkReview,
            enableRegistration: enableRegistration ?? settings.enableRegistration
        }
    });

    return apiResponse(res, 200, 'Settings updated', updated);
};
