import express, { Request, Response } from 'express';
import { verifyJWT } from './server_keycloak';
import { applicationService, pageService } from '../services';
import {authenticateJWT, checkApplicationOwnership} from '../middleware/auth';
const router = express.Router();

/**
 * @swagger
 * /setAppContext/{id}:
 *   get:
 *     summary: Get application context and create a default page if none exists
 *     tags: [App Generation]
 *     description: Retrieves an application and its pages. If the application has no pages, it creates a default 'page1'.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application.
 *     responses:
 *       200:
 *         description: Application context retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   type: object
 *                 pages:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Error getting application context.
 */
router.get('/setAppContext/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await applicationService.getApplicationById(id);
  const pages = await pageService.getPagesByApplicationId(id);

  res.status(200).json({ application, pages });
});

export default router;
