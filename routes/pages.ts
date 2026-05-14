import express, { Request, Response } from 'express';
import { pageService } from '../services';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { NotFoundError } from '../src/errors/customErrors';
// utils/hashUtil.ts
import stringify from "fast-json-stable-stringify";
import xxhash from "xxhash-wasm";
import { hashUnitContent } from '../src/utils/hashUtils';

const router = express.Router();

//this is for validating create page request
const createPageSchema = z.object({
  body: z.object({
    pageName: z.string({
      required_error: 'Page name is required',
    }).min(1, { message: 'Page name cannot be empty' }),
    pageContent: z.object({}).optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, { message: 'Application ID is required' }),
  }),
});

//this is for validating update page request
const updatePageSchema = z.object({
  body: z.object({
    pageName: z.string().min(1, { message: 'Page name cannot be empty' }).optional(),
    pageContent: z.object({}).optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, { message: 'Application ID is required' }),
    id: z.string().min(1, { message: 'Page ID is required' }),
  }),
});




/**
 * @swagger
 * /applications/{applicationId}/pages:
 *   post:
 *     summary: Create a new page
 *     tags: [Pages]
 *     description: Creates a new page for an application.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pageName:
 *                 type: string
 *               pageContent:
 *                 type: object
 *     responses:
 *       201:
 *         description: Page created successfully.
 *       400:
 *         description: Bad request. pageName and pageContent are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create page.
 */
router.post('/applications/:applicationId/pages', [authenticateJWT, checkApplicationOwnership], validate(createPageSchema), async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const timestamp: number = Date.now();
  console.log("created pagggge",applicationId);
// const lastSyncedAt: Date = new Date(timestamp);
  const { pageName, pageContent} = req.body;
  const hashContent ={pageName,pageContent};
  const localHash = hashUnitContent(hashContent);
const serverHash = null; // This can be generated on the server side after saving the page
const syncVersion = 0; // Initial sync version, can be incremented on each update
  const page = await pageService.createPage({
    pageName: pageName,
    pageContent: pageContent,
    localHash: localHash,
    serverHash: serverHash,
    syncVersion: syncVersion,
    lastSyncedAt: null,
    application: { connect: { id: applicationId } },
  });
  res.status(201).json(page);
});

/**
 * @swagger
 * /applications/{applicationId}/pages:
 *   get:
 *     summary: Fetch all pages for an application
 *     tags: [Pages]
 *     description: Retrieves a list of all pages for a specific application.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of pages.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch pages.
 */
router.get('/applications/:applicationId/pages', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId } = req.params;

  const pages = await pageService.getPagesByApplicationId(applicationId);
  res.status(200).json({ data: pages });
});

/**
 * @swagger
 * /applications/{applicationId}/pages/{id}:
 *   get:
 *     summary: Fetch a page by ID
 *     tags: [Pages]
 *     description: Retrieves a single page by its unique ID for a specific application.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single page.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Page not found.
 *       500:
 *         description: Failed to fetch page.
 */
router.get('/applications/:applicationId/pages/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId, id } = req.params;

  const page = await pageService.getPageById(id, applicationId);
  res.status(200).json({ pageContent: page.pageContent });
});

/**
 * @swagger
 * /applications/{applicationId}/pages/{id}:
 *   put:
 *     summary: Update a page
 *     tags: [Pages]
 *     description: Updates an existing page's details.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pageName:
 *                 type: string
 *               pageContent:
 *                 type: object
 *     responses:
 *       200:
 *         description: Page updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update page.
 */
router.put('/applications/:applicationId/pages/:id', [authenticateJWT, checkApplicationOwnership],validate(updatePageSchema), async (req: Request, res: Response) => {
  const { applicationId, id } = req.params;
  const { pageName, pageContent } = req.body;
console.log("page updated in put",req.body);
   const hashContent ={pageName,pageContent};
  const localHash = hashUnitContent(hashContent);
// const serverHash = null; // This can be generated on the server side after saving the page
// const syncVersion = 0; // Initial sync version, can be incremented on each update
//   const page = await pageService.createPage({
//     pageName: pageName,
//     pageContent: pageContent,
//     localHash: localHash,
//     serverHash: serverHash,
//     syncVersion: syncVersion,
//     lastSyncedAt: lastSyncedAt,
//     application: { connect: { id: applicationId } },
//   });

  const page = await pageService.updatePage(id, applicationId, { pageName: pageName, pageContent: pageContent });
  res.status(200).json(page);
});

/**
 * @swagger
 * /applications/{applicationId}/pages/{id}:
 *   delete:
 *     summary: Delete a page
 *     tags: [Pages]
 *     description: Deletes a page by its unique ID.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete page.
 */
router.delete('/applications/:applicationId/pages/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId, id } = req.params;

  await pageService.deletePage(id, applicationId);
  res.status(200).json({ message: 'Page deleted successfully' });
});

export = router;