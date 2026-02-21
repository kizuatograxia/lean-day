import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import prisma from '../config/prisma';

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};
