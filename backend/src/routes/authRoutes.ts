import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 *
 * Body: { email: string, password: string }
 * Response: { token: string, user: { id, email, role, tenantId } }
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                tenantId: user.tenantId,
            },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return token and user data
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
