import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/prisma';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, (req: any, res) => {
    res.json(req.user);
});

// Update profile / Activate account
router.post('/activate', authenticate, async (req: any, res) => {
    const { weight, height, age, sex, activityLevel, weeklyGoal } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                weight: parseFloat(weight),
                height: parseFloat(height),
                age: parseInt(age),
                sex,
                activityLevel,
                weeklyGoal: parseFloat(weeklyGoal),
                isActivated: true,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
