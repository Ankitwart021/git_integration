import express, { Request, Response } from 'express';
import { verifyJWT } from './server_keycloak';
import { applicationService, pageService } from '../services';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';

const router = express.Router();

//this is for validating saveApp request'
const saveAppSchema = z.object({
  body: z.object({
    application: z.object({
      name: z.string().min(1, { message: 'Name cannot be empty' }).optional(),
      description: z.string().optional(),
    }),
    pages: z.array(z.object({
      id: z.string().min(1, { message: 'Page ID is required' }),
      pageName: z.string().min(1, { message: 'Page name cannot be empty' }).optional(),
      pageContent: z.object({}).optional(),
    })).optional(),
  }),
  params: z.object({
    id: z.string().min(1, { message: 'Application ID is required' }),
  }),
}); 

/**
 * @swagger
 * /saveApp/{id}:
 *   put:
 *     summary: Update an application and its pages
 *     tags: [App Generation]
 *     description: Updates an existing application's details and the details of its associated pages in a single operation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               application:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The new name of the application.
 *                   description:
 *                     type: string
 *                     description: The new description of the application.
 *               pages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the page to update.
 *                     pageName:
 *                       type: string
 *                       description: The new name of the page.
 *                     pageContent:
 *                       type: object
 *                       description: The new content of the page.
 *     responses:
 *       200:
 *         description: Application and pages updated successfully.
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
 *       500:
 *         description: Failed to update application and/or pages.
 */
router.put('/saveApp/:id', [authenticateJWT, checkApplicationOwnership] ,validate(saveAppSchema),async (req: Request, res: Response) => {
  const { id } = req.params;
  const { application: appData, pages } = req.body;

  const application = await applicationService.updateApplication(id, appData);

  let updatedPages: any[] = [];
  if (pages && Array.isArray(pages)) {
      updatedPages = await Promise.all(pages.map(async (page) => {
          const { id: pageId, ...pageData } = page;
          if (pageId) {
              console.log("my page data in the update",pageData);
              return await pageService.updatePage(pageId, id, pageData);
          }
          return null;
      }));
      updatedPages = updatedPages.filter(page => page !== null);
  }

  res.status(200).json({ application, pages: updatedPages });
});

export default router;