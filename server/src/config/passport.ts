import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db';
import dotenv from 'dotenv';

dotenv.config();

export const setupPassport = () => {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error('CRITICAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.');
        console.error('Available keys starting with GOOGLE:', Object.keys(process.env).filter(k => k.startsWith('GOOGLE')));
        process.exit(1);
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
                proxy: true
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Find user by google_id
                    const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
                    let user = res.rows[0];

                    if (!user) {
                        // Create user if not exists
                        const insertRes = await pool.query(
                            'INSERT INTO users (google_id, email, name, is_activated) VALUES ($1, $2, $3, $4) RETURNING *',
                            [
                                profile.id,
                                profile.emails?.[0].value || '',
                                profile.displayName,
                                false
                            ]
                        );
                        user = insertRes.rows[0];
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            const user = res.rows[0];
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};
