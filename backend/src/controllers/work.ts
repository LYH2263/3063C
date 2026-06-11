import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { apiResponse } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const normalizeWorkPayload = (body: any) => {
    const readTrimmed = (value: any) => (typeof value === 'string' ? value.trim() : undefined);
    const title = readTrimmed(body?.title);
    const description = readTrimmed(body?.description ?? body?.content);
    const mediaUrl = readTrimmed(body?.mediaUrl ?? body?.url ?? body?.coverUrl);
    const category = readTrimmed(body?.category);
    const tags = readTrimmed(body?.tags);
    const status = typeof body?.status === 'string'
        ? (body.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED')
        : undefined;

    return { title, description, mediaUrl, category, tags, status };
};

// Public: Get published works
export const getWorks = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const whereCondition: any = { status: 'PUBLISHED' };
    if (category) whereCondition.category = category;
    if (search) {
        whereCondition.OR = [
            { title: { contains: search } },
            { tags: { contains: search } }
        ];
    }

    const [total, works] = await Promise.all([
        prisma.work.count({ where: whereCondition }),
        prisma.work.findMany({
            where: whereCondition,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return apiResponse(res, 200, 'Success', { total, page, limit, works });
};

// Public: Get work details
export const getWorkDetail = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');

    const work = await prisma.work.update({
        where: { id, status: 'PUBLISHED' },
        data: { viewCount: { increment: 1 } },
        include: { interactions: true }
    });

    if (!work) return apiResponse(res, 404, 'Work not found');

    return apiResponse(res, 200, 'Success', work);
};

// User: Interact (Like / Favorite)
export const toggleInteraction = async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const { type } = req.body; // 'LIKE' or 'FAVORITE'
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');
    if (!['LIKE', 'FAVORITE'].includes(type)) return apiResponse(res, 400, 'Invalid interaction type');

    const userId = req.user!.userId;

    const existing = await prisma.interaction.findUnique({
        where: { userId_workId_interactionType: { userId, workId: id, interactionType: type } }
    });

    if (existing) {
        await prisma.interaction.delete({ where: { id: existing.id } });
        return apiResponse(res, 200, `${type} removed`);
    } else {
        await prisma.interaction.create({
            data: { userId, workId: id, interactionType: type }
        });
        return apiResponse(res, 201, `${type} added`);
    }
};

// User: Get favorite works
export const getMyFavorites = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const interactions = await prisma.interaction.findMany({
        where: { userId, interactionType: 'FAVORITE' },
        include: { work: true }
    });
    return apiResponse(res, 200, 'Success', interactions.map(i => i.work));
};

// Admin: CRUD operations for works

export const adminGetWorks = async (req: Request, res: Response) => {
    const works = await prisma.work.findMany({ orderBy: { createdAt: 'desc' } });
    return apiResponse(res, 200, 'Success', works);
};

export const adminCreateWork = async (req: Request, res: Response) => {
    const { title, description, tags, category, mediaUrl, status } = normalizeWorkPayload(req.body);
    const missingFields = [
        !title ? 'title' : null,
        !description ? 'description' : null,
        !mediaUrl ? 'mediaUrl' : null
    ].filter(Boolean);
    if (missingFields.length > 0) {
        return apiResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    const work = await prisma.work.create({
        data: {
            title,
            description,
            tags: tags || '[]',
            category: category || 'Uncategorized',
            mediaUrl,
            status: status || 'PUBLISHED'
        }
    });
    return apiResponse(res, 201, 'Work created', work);
};

export const adminUpdateWork = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { title, description, tags, category, mediaUrl, status } = normalizeWorkPayload(req.body);
    if (isNaN(id)) return apiResponse(res, 400, 'Invalid ID');
    if (title !== undefined && !title) return apiResponse(res, 400, 'title cannot be empty');
    if (description !== undefined && !description) return apiResponse(res, 400, 'description cannot be empty');
    if (mediaUrl !== undefined && !mediaUrl) return apiResponse(res, 400, 'mediaUrl cannot be empty');

    const work = await prisma.work.update({
        where: { id },
        data: {
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(tags !== undefined ? { tags: tags || '[]' } : {}),
            ...(category !== undefined ? { category: category || 'Uncategorized' } : {}),
            ...(mediaUrl !== undefined ? { mediaUrl } : {}),
            ...(status !== undefined ? { status } : {})
        }
    });
    return apiResponse(res, 200, 'Work updated', work);
};

export const adminDeleteWork = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    // First delete interactions safely
    await prisma.interaction.deleteMany({ where: { workId: id } });

    await prisma.work.delete({ where: { id } });
    return apiResponse(res, 200, 'Work deleted');
};
