import express, { Request, Response } from 'express';
import { verifyJWT } from './server_keycloak';
import { templateService } from '../services';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient(); // Keep prisma client for complex queries

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: API for managing templates.
 */

/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     description: Creates a new template for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template created successfully.
 *       400:
 *         description: Bad request. TemplateName and userId are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create template.
 */
router.post('/templates', async (req: Request, res: Response) => {
  let decoded: any = null;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (verifyResponse.valid) {
      decoded = verifyResponse.decoded;
    } else {
      throw verifyResponse.error;
    }
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { templateName, description } = req.body;
  const userId = decoded?.sub;

  if (!templateName || !userId) {
    return res.status(400).json({ error: 'TemplateName and userId are required' });
  }

  try {
    const newTemplate = await templateService.createTemplate({
      templateName: templateName,
      description,
      user: { connect: { id: userId } },
    });

    res.status(201).json(newTemplate);
  } catch (error: any) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message || 'Failed to create template' });
  }
});

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Fetch all templates for a user
 *     tags: [Templates]
 *     description: Retrieves a list of all templates for the authenticated user.
 *     responses:
 *       200:
 *         description: A list of templates.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch templates.
 */
router.get('/templates', async (req: Request, res: Response) => {
  let decoded: any = null;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const verifyResponse = await verifyJWT(token);
    if (verifyResponse.valid) {
      decoded = verifyResponse.decoded;
    } else {
      throw verifyResponse.error;
    }
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  try {
    const templates = await templateService.getAllTemplates();
    res.status(200).json({ data: templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch templates' });
  }
});

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Fetch a template by ID
 *     tags: [Templates]
 *     description: Retrieves a single template and all its related data (pages, resources, enums) by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single template with its related data.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Template not found.
 *       500:
 *         description: Failed to fetch template.
 */
router.get('/templates/:id', async (req: Request, res: Response) => {
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
    const template = await templateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(200).json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch template' });
  }
});

/**
 * @swagger
 * /templates/{id}:
 *   put:
 *     summary: Update a template
 *     tags: [Templates]
 *     description: Updates an existing template's details.
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
 *               templateName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update template.
 */
router.put('/templates/:id', async (req: Request, res: Response) => {
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
  const { templateName, description } = req.body;

  try {
    const template = await templateService.updateTemplate(id, { templateName: templateName, description });
    res.status(200).json(template);
  } catch (error: any) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: error.message || 'Failed to update template' });
  }
});

/**
 * @swagger
 * /templates/{id}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     description: Deletes a template and all its related data (pages, resources, enums) by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete template.
 */
router.delete('/templates/:id', async (req: Request, res: Response) => {
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
    await templateService.deleteTemplate(id);
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: error.message || 'Failed to delete template' });
  }
});

export = router;