import express, { Request, Response } from 'express';
import { verifyJWT } from './server_keycloak';
import { templatePageService } from '../services';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Template Pages
 *   description: API for managing template pages.
 */

/**
 * @swagger
 * /template-pages:
 *   post:
 *     summary: Create a new template page
 *     tags: [Template Pages]
 *     description: Creates a new page for a template.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *               tpName:
 *                 type: string
 *               tpContent:
 *                 type: object
 *     responses:
 *       201:
 *         description: Template page created successfully.
 *       400:
 *         description: Bad request. templateId, tpName, and tpContent are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create template page.
 */
router.post('/template-pages', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (!verifyResponse.valid) throw verifyResponse.error;
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { templateId, tpName, tpContent } = req.body;
  if (!templateId || !tpName || !tpContent) {
    return res.status(400).json({ error: 'templateId, tpName, and tpContent are required' });
  }

  try {
    const templatePage = await templatePageService.createTemplatePage({
      tpName: tpName,
      tpContent: tpContent,
      template: { connect: { id: templateId } },
    });
    res.status(201).json(templatePage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create template page' });
  }
});

/**
 * @swagger
 * /templates/{templateId}/pages:
 *   get:
 *     summary: Get all template pages for a template
 *     tags: [Template Pages]
 *     description: Retrieves a list of all pages for a specific template.
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of template pages.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch template pages.
 */
router.get('/templates/:templateId/pages', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (!verifyResponse.valid) throw verifyResponse.error;
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { templateId } = req.params;

  try {
    const pages = await templatePageService.getTemplatePagesByTemplateId(templateId);
    res.status(200).json({ data: pages });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch template pages' });
  }
});

/**
 * @swagger
 * /template-pages/{id}:
 *   get:
 *     summary: Get a template page by ID
 *     tags: [Template Pages]
 *     description: Retrieves a single template page by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single template page.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Template page not found.
 *       500:
 *         description: Failed to fetch template page.
 */
router.get('/template-pages/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (!verifyResponse.valid) throw verifyResponse.error;
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { id } = req.params;

  try {
    const templatePage = await templatePageService.getTemplatePageById(id);
    if (!templatePage) {
      return res.status(404).json({ error: 'Template page not found' });
    }
    res.status(200).json(templatePage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch template page' });
  }
});

/**
 * @swagger
 * /template-pages/{id}:
 *   put:
 *     summary: Update a template page
 *     tags: [Template Pages]
 *     description: Updates an existing template page's details.
 *     parameters:
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
 *               tpName:
 *                 type: string
 *               tpContent:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template page updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update template page.
 */
router.put('/template-pages/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (!verifyResponse.valid) throw verifyResponse.error;
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { id } = req.params;
  const { tpName, tpContent } = req.body;

  try {
    const templatePage = await templatePageService.updateTemplatePage(id, { tpName: tpName, tpContent: tpContent });
    res.status(200).json(templatePage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update template page' });
  }
});

/**
 * @swagger
 * /template-pages/{id}:
 *   delete:
 *     summary: Delete a template page
 *     tags: [Template Pages]
 *     description: Deletes a template page by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template page deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete template page.
 */
router.delete('/template-pages/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (!verifyResponse.valid) throw verifyResponse.error;
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { id } = req.params;

  try {
    const deletedPage = await templatePageService.deleteTemplatePage(id);
    res.status(200).json({ message: 'Template page deleted successfully', page: deletedPage });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete template page' });
  }
});

export = router;