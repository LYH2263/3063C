import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/error';
import { shutdownPrisma } from './lib/prisma';
import authRoutes from './routes/auth';
import styleRoutes from './routes/style';
import workRoutes from './routes/work';
import messageRoutes from './routes/message';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';

dotenv.config();

const app = express();
const port = process.env.PORT || 8063;

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
