import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { config } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new viewer account
 */
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, tenantName } = req.body;

        // Validation
        if (!email || !password || !tenantName) {
            res.status(400).json({ error: 'Email, password, and tenant name are required' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User with this email already exists' });
            return;
        }

        // Find or create tenant
        let tenant = await Tenant.findOne({ name: tenantName });
        if (!tenant) {
            // Auto-create tenant for signup
            const { getNextSequence } = await import('../models/Counter');
            const tenantId = await getNextSequence('tenant');
            tenant = await Tenant.create({
                id: tenantId,
                name: tenantName,
                key: tenantName.toLowerCase().replace(/[^a-z0-9]/g, '_'), // Generate key from name
            });
            console.log(` Auto-created tenant during signup: ${tenantId} (${tenantName})`);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create viewer user
        const user = await User.create({
            email,
            passwordHash,
            role: 'VIEWER',
            tenantId: tenant.id,
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account', message: error.message });
    }
});

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
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return token and user data
        res.json({
            success: true,
            message: 'Login successful',
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

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findOne({ id: req.user?.id })
            .select('-passwordHash')
            .lean();

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

export default router;
