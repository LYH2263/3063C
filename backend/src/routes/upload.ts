import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth';
import { apiResponse } from '../middleware/error';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post('/', authenticate, requireAdmin, upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return apiResponse(res, 400, 'No file uploaded');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return apiResponse(res, 200, 'File uploaded', { url: fileUrl });
});

export default router;
