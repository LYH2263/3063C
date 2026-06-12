import { PrismaClient } from '@prisma/client';
import { isDevelopment, isProduction } from '../config';

declare global {
    // eslint-disable-next-line no-var
    var __prisma__: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
    const client = new PrismaClient({
        log: isDevelopment()
            ? ['error', 'warn']
            : ['error'],
    });

    // Prisma 5 removed the client-level 'beforeExit' hook for the library engine.
    // Attach the listener to the Node process instead.
    process.on('beforeExit', async () => {
        console.log('[Prisma] Connection pool is shutting down...');
    });

    return client;
};

const prisma: PrismaClient = globalThis.__prisma__ ?? createPrismaClient();

if (!isProduction()) {
    globalThis.__prisma__ = prisma;
}

export const shutdownPrisma = async (): Promise<void> => {
    try {
        await prisma.$disconnect();
        console.log('[Prisma] Disconnected from database successfully');
    } catch (err) {
        console.error('[Prisma] Error during disconnection:', err);
    }
};

export default prisma;
