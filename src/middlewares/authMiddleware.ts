import express from 'express';
import { verifyToken } from '../db/users';

export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies['OSE-AUTH'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (typeof decoded === 'object' && 'userId' in decoded) {
        (req as any).userId = decoded.userId; // Attach the user ID to the request object
    }
    next();
};

