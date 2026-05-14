import express, { Request, Response } from 'express';
import { customComponentService } from '../services';
import { authenticateJWT, checkComponentOwnership } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';

const router = express.Router();
//this is for validating create custom component request
const createCustomComponentSchema = z.object({
  body: z.object({
    componentName: z.string({
      required_error: 'Component name is required',
    }).min(1, { message: 'Component name cannot be empty' }),
    componentContent: z.object({}).optional(),
  }),
});
//this is for validating update custom component request
const updateCustomComponentSchema = z.object({ 
  body: z.object({
    componentName: z.string().min(1, { message: 'Component name cannot be empty' }).optional(),
    componentContent: z.object({}).optional(),
  }),
  params: z.object({
    id: z.string().min(1, { message: 'Custom Component ID is required' }),
  }),
});

/**
 * @swagger
 * /customComponents:
 *   post:
 *     summary: Create a new custom component
 *     tags: [Custom Components]
 *     description: Creates a new custom component for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               componentName:
 *                 type: string
 *               componentContent:
 *                 type: object
 *     responses:
 *       201:
 *         description: Custom component created successfully.
 *       400:
 *         description: Bad request. componentName, componentContent, and userId are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create custom component.
 */
router.post('/customComponents', authenticateJWT,validate(createCustomComponentSchema), async (req: Request, res: Response) => {
  const { componentName, componentContent } = req.body;
  const userId = req.user?.id;
  
  const customComponent = await customComponentService.createCustomComponent({
    componentName: componentName,
    componentContent: componentContent,
    user: { connect: { id: userId } },
  });
  res.status(201).json(customComponent);
});

/**
 * @swagger
 * /customComponents:
 *   get:
 *     summary: Fetch custom components for the authenticated user
 *     tags: [Custom Components]
 *     description: Retrieves a list of all custom components for the currently authenticated user.
 *     responses:
 *       200:
 *         description: A list of custom components.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch custom components.
 */
router.get('/customComponents', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const customComponents = await customComponentService.getCustomComponentsByUserId(userId);
  res.status(200).json({ data: customComponents });
});

/**
 * @swagger
 * /customComponents/component/{id}:
 *   get:
 *     summary: Fetch a custom component by ID
 *     tags: [Custom Components]
 *     description: Retrieves a single custom component by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single custom component.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Custom component not found.
 *       500:
 *         description: Failed to fetch custom component.
 */
router.get('/customComponents/component/:id', [authenticateJWT, checkComponentOwnership], async (req: Request, res: Response) => {
  const { id } = req.params;

  const customComponent = await customComponentService.getCustomComponentById(id);
  res.status(200).json(customComponent);
});

/**
 * @swagger
 * /customComponents/{id}:
 *   put:
 *     summary: Update a custom component
 *     tags: [Custom Components]
 *     description: Updates an existing custom component's details.
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
 *               componentName:
 *                 type: string
 *               componentContent:
 *                 type: object
 *     responses:
 *       200:
 *         description: Custom component updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update custom component.
 */
router.put('/customComponents/:id',[authenticateJWT, checkComponentOwnership], validate(updateCustomComponentSchema),async (req: Request, res: Response) => {
  const { id } = req.params;
  const { componentName, componentContent } = req.body;

  const customComponent = await customComponentService.updateCustomComponent(id, { componentName: componentName, componentContent: componentContent });
  res.status(200).json(customComponent);
});

/**
 * @swagger
 * /customComponents/{id}:
 *   delete:
 *     summary: Delete a custom component
 *     tags: [Custom Components]
 *     description: Deletes a custom component by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom component deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete custom component.
 */
router.delete('/customComponents/:id',[authenticateJWT, checkComponentOwnership], async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedComponent = await customComponentService.deleteCustomComponent(id);
  res.status(200).json({ message: 'Custom component deleted successfully', component: deletedComponent });
});

export = router;