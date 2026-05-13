import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '../entities/User.js';
import { employeeMetricsHandler, myMetricsHandler } from '../controllers/metricsController.js';

const router = Router();

/**
 * @openapi
 * /api/metrics:
 *   get:
 *     summary: Get vacation day usage for all employees (validator only)
 *     tags: [Metrics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of employee metrics for the current year
 */
router.get('/', authenticate, requireRole(UserRole.VALIDATOR), employeeMetricsHandler);

/**
 * @openapi
 * /api/metrics/me:
 *   get:
 *     summary: Get my vacation day usage for the current year
 *     tags: [Metrics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Personal metrics for the current year
 */
router.get('/me', authenticate, requireRole(UserRole.REQUESTER), myMetricsHandler);

export default router;
