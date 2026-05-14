import express, { Request, Response } from 'express';
import { verifyJWT } from './server_keycloak';
import { templateResourceService } from '../services';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Template Resources
 *   description: API for managing template resources.
 */

/**
 * @swagger
 * /template-resources:
 *   post:
 *     summary: Create a new template resource
 *     tags: [Template Resources]
 *     description: Creates a new resource for a template.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *               resourceName:
 *                 type: string
 *               resources:
 *                 type: object
 *     responses:
 *       201:
 *         description: Template resource created successfully.
 *       400:
 *         description: Bad request. templateId, resourceName and resources are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create template resource.
 */
router.post('/template-resources', async (req: Request, res: Response) => {
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

  const { templateId, resourceName, resources } = req.body;
  if (!resourceName || !resources || !templateId) {
    return res.status(400).json({ error: 'templateId, resourceName and resources are required' });
  }

  try {
    const templateResource = await templateResourceService.createTemplateResource({
      resourceName: resourceName,
      resources: resources,
      template: { connect: { id: templateId } },
    });
    res.status(201).json(templateResource);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create template resource' });
  }
});

/**
 * @swagger
 * /templates/{templateId}/resources:
 *   get:
 *     summary: Get all template resources for a template
 *     tags: [Template Resources]
 *     description: Retrieves a list of all resources for a specific template.
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of template resources.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch template resources.
 */
router.get('/templates/:templateId/resources', async (req: Request, res: Response) => {
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
    const resources = await templateResourceService.getTemplateResourcesByTemplateId(templateId);
    res.status(200).json({ data: resources });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch template resources' });
  }
});

/**
 * @swagger
 * /template-resources/{id}:
 *   get:
 *     summary: Get a template resource by ID
 *     tags: [Template Resources]
 *     description: Retrieves a single template resource by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single template resource.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Template resource not found.
 *       500:
 *         description: Failed to fetch template resource.
 */
router.get('/template-resources/:id', async (req: Request, res: Response) => {
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
    const templateResource = await templateResourceService.getTemplateResourceById(id);
    if (!templateResource) {
      return res.status(404).json({ error: 'Template resource not found' });
    }
    res.status(200).json(templateResource);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch template resource' });
  }
});

/**
 * @swagger
 * /template-resources/{id}:
 *   put:
 *     summary: Update a template resource
 *     tags: [Template Resources]
 *     description: Updates an existing template resource's details.
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
 *               resourceName:
 *                 type: string
 *               resources:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template resource updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update template resource.
 */
router.put('/template-resources/:id', async (req: Request, res: Response) => {
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
  const { resourceName, resources } = req.body;

  try {
    const templateResource = await templateResourceService.updateTemplateResource(id, { resourceName: resourceName, resources: resources });
    res.status(200).json(templateResource);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update template resource' });
  }
});

/**
 * @swagger
 * /template-resources/{id}:
 *   delete:
 *     summary: Delete a template resource
 *     tags: [Template Resources]
 *     description: Deletes a template resource by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template resource deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete template resource.
 */
router.delete('/template-resources/:id', async (req: Request, res: Response) => {
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
    const deletedResource = await templateResourceService.deleteTemplateResource(id);
    res.status(200).json({ message: 'Template resource deleted successfully', resource: deletedResource });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete template resource' });
  }
});

export = router;