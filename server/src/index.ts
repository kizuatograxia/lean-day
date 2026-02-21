import dotenv from 'dotenv';
dotenv.config();

import { setupPassport } from './config/passport';

// Initialize Passport with environment check
setupPassport();

import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import historyRoutes from './routes/history';
import { initDb } from './config/db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/history', historyRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/user') || req.path.startsWith('/history') || req.path.startsWith('/health')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Initialize database and start server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server due to DB error');
    process.exit(1);
});
