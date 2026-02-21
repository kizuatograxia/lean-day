import express from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../config/db';

const router = express.Router();

// Get history for the authenticated user
router.get('/', authenticate, async (req: any, res) => {
    try {
        const query = 'SELECT * FROM week_history WHERE user_id = $1 ORDER BY created_at DESC';
        const response = await pool.query(query, [req.user.id]);

        // Map snake_case to camelCase
        const history = response.rows.map(row => ({
            id: row.id,
            weekNumber: row.week_number,
            date: row.date,
            totalConsumed: row.total_consumed,
            margin: row.margin,
            classification: row.classification,
            emotion: row.emotion,
            weekQuality: row.week_quality,
            mealsData: row.meals_data
        }));

        res.json(history);
    } catch (error) {
        console.error('Fetch history error:', error);
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
        const query = `
      INSERT INTO week_history 
      (user_id, week_number, date, total_consumed, margin, classification, emotion, week_quality, meals_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

        const values = [
            req.user.id,
            weekNumber,
            date,
            totalConsumed,
            margin,
            classification,
            emotion,
            weekQuality,
            JSON.stringify(mealsData)
        ];

        const response = await pool.query(query, values);
        const row = response.rows[0];

        res.json({
            id: row.id,
            weekNumber: row.week_number,
            date: row.date,
            totalConsumed: row.total_consumed,
            margin: row.margin,
            classification: row.classification,
            emotion: row.emotion,
            weekQuality: row.week_quality,
            mealsData: row.meals_data
        });
    } catch (error) {
        console.error('Save history error:', error);
        res.status(500).json({ error: 'Failed to save history' });
    }
});

// Update an existing entry
router.put('/:id', authenticate, async (req: any, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // This is a bit dynamic, but for simplicity let's handle the main fields
        const query = `
      UPDATE week_history 
      SET 
        total_consumed = COALESCE($1, total_consumed),
        classification = COALESCE($2, classification),
        week_quality = COALESCE($3, week_quality),
        meals_data = COALESCE($4, meals_data),
        emotion = COALESCE($5, emotion),
        margin = COALESCE($6, margin)
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;

        const values = [
            updates.totalConsumed,
            updates.classification,
            updates.weekQuality,
            updates.mealsData ? JSON.stringify(updates.mealsData) : null,
            updates.emotion,
            updates.margin,
            id,
            req.user.id
        ];

        const response = await pool.query(query, values);
        const row = response.rows[0];

        if (!row) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({
            id: row.id,
            weekNumber: row.week_number,
            date: row.date,
            totalConsumed: row.total_consumed,
            margin: row.margin,
            classification: row.classification,
            emotion: row.emotion,
            weekQuality: row.week_quality,
            mealsData: row.meals_data
        });
    } catch (error) {
        console.error('Update history error:', error);
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

export default router;
