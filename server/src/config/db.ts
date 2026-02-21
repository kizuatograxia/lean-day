import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const initDb = async () => {
    const client = await pool.connect();
    try {
        console.log('Initializing database tables...');

        // Create Users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        google_id TEXT UNIQUE NOT NULL,
        is_activated BOOLEAN DEFAULT FALSE,
        weight FLOAT,
        height FLOAT,
        age INTEGER,
        sex TEXT,
        activity_level TEXT,
        weekly_goal FLOAT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create Week History table
        await client.query(`
      CREATE TABLE IF NOT EXISTS week_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        week_number INTEGER NOT NULL,
        date TEXT NOT NULL,
        total_consumed INTEGER NOT NULL,
        margin INTEGER NOT NULL,
        classification TEXT NOT NULL,
        emotion TEXT,
        week_quality TEXT,
        meals_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Database tables initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    } finally {
        client.release();
    }
};

export default pool;
