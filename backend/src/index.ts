import express from 'express';
import cors from 'cors';
import path from 'path';

import { errorHandler } from './middleware/error';
import { shutdownPrisma } from './lib/prisma';
import prisma from './lib/prisma';
import config from './config';
import authRoutes from './routes/auth';
import styleRoutes from './routes/style';
import workRoutes from './routes/work';
import messageRoutes from './routes/message';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';

const app = express();
const port = config.PORT;

app.get('/health', async (req, res) => {
    const startTime = Date.now();
    let dbStatus = 'unknown';
    let dbLatency = 0;

    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatency = Date.now() - dbStart;
        dbStatus = 'healthy';
    } catch (err) {
        dbStatus = 'unhealthy';
    }

    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';
    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
        services: {
            database: {
                status: dbStatus,
                latencyMs: dbLatency,
            },
        },
        responseTimeMs: Date.now() - startTime,
    });
});

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/works', workRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('API is running successfully!');
});

app.use(errorHandler as express.ErrorRequestHandler);

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const gracefulShutdown = async (signal: string) => {
    console.log(`[Shutdown] Received ${signal}, starting graceful shutdown...`);
    server.close(async () => {
        console.log('[Shutdown] HTTP server closed');
        await shutdownPrisma();
        console.log('[Shutdown] Graceful shutdown completed');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('[Shutdown] Force shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
    console.error('[Unhandled Rejection]:', reason);
});
