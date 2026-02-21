import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/prisma';

const router = express.Router();

// Get history for the authenticated user
router.get('/', authenticate, async (req: any, res) => {
    try {
        const history = await prisma.weekHistory.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Save a new week history entry
router.post('/', authenticate, async (req: any, res) => {
    const {
        weekNumber,
        date,
        totalConsumed,
        margin,
        classification,
        emotion,
        weekQuality,
        mealsData
    } = req.body;

    try {
        const newEntry = await prisma.weekHistory.create({
            data: {
                userId: req.user.id,
                weekNumber,
                date,
                totalConsumed,
                margin,
                classification,
                emotion,
                weekQuality,
                mealsData,
            },
        });
        res.json(newEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save history' });
    }
});

// Update an existing entry
router.put('/:id', authenticate, async (req: any, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updated = await prisma.weekHistory.update({
            where: { id, userId: req.user.id },
            data: updates,
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

export default router;
