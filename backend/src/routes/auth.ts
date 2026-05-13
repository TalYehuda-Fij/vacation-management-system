import { Router } from 'express';
import { loginHandler, meHandler } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT token and user info
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginHandler);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user from token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user payload
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, meHandler);

export default router;
