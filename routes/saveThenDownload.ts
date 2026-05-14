import express from "express";
import { applicationService, pageService } from "../services";
import { generateProject } from "../utils/project-generator";
import { Request, Response } from "express"; 
import { authenticateJWT, checkApplicationOwnership } from "../middleware/auth";
import { z } from "zod";
import { validate } from "../middleware/validation";

const router = express.Router();

//this is for validating saveThenDownload request
const saveThenDownloadSchema = z.object({
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
 * /save-then-download/{id}:
 *   post:
 *     summary: Save and then download an application
 *     tags: [App Generation]
 *     description: Updates an application and its pages, then generates and downloads the updated React application as a zip file.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application to save and download.
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
 *                   description:
 *                     type: string
 *               pages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     pageName:
 *                       type: string
 *                     pageContent:
 *                       type: object
 *     responses:
 *       200:
 *         description: A zip file of the generated application.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error processing request.
 */
router.post("/save-then-download/:id", [authenticateJWT, checkApplicationOwnership],validate(saveThenDownloadSchema), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { application: appData, pages } = req.body;

    // 2. Save logic (from saveApp.ts)
    await applicationService.updateApplication(id, appData);
    if (pages && Array.isArray(pages)) {
        await Promise.all(pages.map(async (page) => {
            const { id: pageId, ...pageData } = page;
            if (pageId) {
                await pageService.updatePage(pageId, id, pageData);
            }
        }));
    }

    // 3. Download logic
    await generateProject(id, '1', res);
});

export default router;