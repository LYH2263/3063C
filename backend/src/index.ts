import { shutdownPrisma } from './lib/prisma';
import config from './config';
import { createApp } from './app';

const app = createApp();
const port = config.PORT;

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
