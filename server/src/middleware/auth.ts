import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import pool from '../config/db';

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
        const response = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id]);
        const user = response.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};
