import express from 'express';
import passport from 'passport';
import { signToken } from '../config/jwt';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req: any, res) => {
        const user = req.user;
        const token = signToken({ id: user.id });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth-callback?token=${token}&isActivated=${user.is_activated}`);
    }
);

export default router;
