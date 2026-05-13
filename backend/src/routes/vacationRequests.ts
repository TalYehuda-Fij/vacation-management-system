import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '../entities/User.js';
import {
  createRequestHandler,
  getMyRequestsHandler,
  getAllRequestsHandler,
  approveRequestHandler,
  rejectRequestHandler,
} from '../controllers/vacationRequestController.js';

const router = Router();

/**
 * @openapi
 * /api/vacation-requests:
 *   post:
 *     summary: Create a vacation request
 *     tags: [VacationRequests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [start_date, end_date]
 *             properties:
 *               start_date: { type: string, example: "2026-06-01" }
 *               end_date: { type: string, example: "2026-06-05" }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       409: { description: Date overlap }
 */
router.post('/', authenticate, requireRole(UserRole.REQUESTER), createRequestHandler);

/**
 * @openapi
 * /api/vacation-requests/mine:
 *   get:
 *     summary: Get my vacation requests
 *     tags: [VacationRequests]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of own requests }
 */
router.get('/mine', authenticate, requireRole(UserRole.REQUESTER), getMyRequestsHandler);

/**
 * @openapi
 * /api/vacation-requests:
 *   get:
 *     summary: Get all vacation requests (validator only)
 *     tags: [VacationRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: Paginated list }
 *       403: { description: Forbidden }
 */
router.get('/', authenticate, requireRole(UserRole.VALIDATOR), getAllRequestsHandler);

/**
 * @openapi
 * /api/vacation-requests/{id}/approve:
 *   patch:
 *     summary: Approve a vacation request
 *     tags: [VacationRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Approved }
 *       422: { description: Invalid status transition }
 */
router.patch('/:id/approve', authenticate, requireRole(UserRole.VALIDATOR), approveRequestHandler);

/**
 * @openapi
 * /api/vacation-requests/{id}/reject:
 *   patch:
 *     summary: Reject a vacation request (comment required)
 *     tags: [VacationRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comments]
 *             properties:
 *               comments: { type: string }
 *     responses:
 *       200: { description: Rejected }
 *       400: { description: Missing comment }
 *       422: { description: Invalid status transition }
 */
router.patch('/:id/reject', authenticate, requireRole(UserRole.VALIDATOR), rejectRequestHandler);

export default router;
