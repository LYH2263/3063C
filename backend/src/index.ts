import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/error';
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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
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

// Global error handler
app.use(errorHandler as express.ErrorRequestHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
