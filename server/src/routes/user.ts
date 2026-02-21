import express from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../config/db';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, (req: any, res) => {
    // Map snake_case to camelCase for the frontend if necessary, 
    // though for now let's just send the user as is
    const user = req.user;
    res.json({
        ...user,
        isActivated: user.is_activated,
        activityLevel: user.activity_level,
        weeklyGoal: user.weekly_goal
    });
});

// Update profile / Activate account
router.post('/activate', authenticate, async (req: any, res) => {
    const { weight, height, age, sex, activityLevel, weeklyGoal } = req.body;

    try {
        const query = `
      UPDATE users 
      SET 
        weight = $1, 
        height = $2, 
        age = $3, 
        sex = $4, 
        activity_level = $5, 
        weekly_goal = $6, 
        is_activated = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

        const values = [
            parseFloat(weight),
            parseFloat(height),
            parseInt(age),
            sex,
            activityLevel,
            parseFloat(weeklyGoal),
            true,
            req.user.id
        ];

        const response = await pool.query(query, values);
        const updatedUser = response.rows[0];

        res.json({
            ...updatedUser,
            isActivated: updatedUser.is_activated,
            activityLevel: updatedUser.activity_level,
            weeklyGoal: updatedUser.weekly_goal
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
