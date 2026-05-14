import express, { Request, Response } from 'express';
import { verifyJWT } from './server_keycloak';
import { templateEnumService } from '../services';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Template Enums
 *   description: API for managing template enums.
 */

/**
 * @swagger
 * /template-enums:
 *   post:
 *     summary: Create a new template enum
 *     tags: [Template Enums]
 *     description: Creates a new enum for a template.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *               enumName:
 *                 type: string
 *               enums:
 *                 type: object
 *     responses:
 *       201:
 *         description: Template enum created successfully.
 *       400:
 *         description: Bad request. templateId, enumName and enums are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create template enum.
 */
router.post('/template-enums', async (req: Request, res: Response) => {
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

  const { templateId, enumName, enums } = req.body;
  if (!enumName || !enums || !templateId) {
    return res.status(400).json({ error: 'templateId, enumName and enums are required' });
  }

  try {
    const templateEnum = await templateEnumService.createTemplateEnum({
      enumName,
      enums,
      template: { connect: { id: templateId } },
    });
    res.status(201).json(templateEnum);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create template enum' });
  }
});

/**
 * @swagger
 * /templates/{templateId}/enums:
 *   get:
 *     summary: Get all template enums for a template
 *     tags: [Template Enums]
 *     description: Retrieves a list of all enums for a specific template.
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of template enums.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch template enums.
 */
router.get('/templates/:templateId/enums', async (req: Request, res: Response) => {
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
    const enums = await templateEnumService.getTemplateEnumsByTemplateId(templateId);
    res.status(200).json({ data: enums });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch template enums' });
  }
});

/**
 * @swagger
 * /template-enums/{id}:
 *   get:
 *     summary: Get a template enum by ID
 *     tags: [Template Enums]
 *     description: Retrieves a single template enum by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single template enum.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Template enum not found.
 *       500:
 *         description: Failed to fetch template enum.
 */
router.get('/template-enums/:id', async (req: Request, res: Response) => {
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
    const templateEnum = await templateEnumService.getTemplateEnumById(id);
    if (!templateEnum) {
      return res.status(404).json({ error: 'Template enum not found' });
    }
    res.status(200).json(templateEnum);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch template enum' });
  }
});

/**
 * @swagger
 * /template-enums/{id}:
 *   put:
 *     summary: Update a template enum
 *     tags: [Template Enums]
 *     description: Updates an existing template enum's details.
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
 *               enumName:
 *                 type: string
 *               enums:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template enum updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update template enum.
 */
router.put('/template-enums/:id', async (req: Request, res: Response) => {
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
  const { enumName, enums } = req.body;

  try {
    const templateEnum = await templateEnumService.updateTemplateEnum(id, { enumName, enums });
    res.status(200).json(templateEnum);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update template enum' });
  }
});

/**
 * @swagger
 * /template-enums/{id}:
 *   delete:
 *     summary: Delete a template enum
 *     tags: [Template Enums]
 *     description: Deletes a template enum by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template enum deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete template enum.
 */
router.delete('/template-enums/:id', async (req: Request, res: Response) => {
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
    const deletedEnum = await templateEnumService.deleteTemplateEnum(id);
    res.status(200).json({ message: 'Template enum deleted successfully', enum: deletedEnum });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete template enum' });
  }
});

export = router;
