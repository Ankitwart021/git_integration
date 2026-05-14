import express, { Request, Response } from 'express';
import { applicationDecoratorService } from '../services';
import { verifyJWT } from './server_keycloak';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
const router = express.Router();

/**
 * @swagger
 * /application-decorators:
 *   post:
 *     summary: Create a new Application Decorator
 *     tags: [Application Decorators]
 *     description: Creates a new application decorator.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationID:
 *                 type: string
 *               decoratorName:
 *                 type: string
 *               decoratorattributes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Application decorator created successfully.
 *       400:
 *         description: Bad request. applicationID, decoratorName, and decoratorattributes are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create application decorator.
 */
router.post('/application-decorators', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
    const { applicationID, decoratorName, decoratorattributes } = req.body;

    if (!applicationID || !decoratorName || !decoratorattributes) {
        return res.status(400).json({ error: 'applicationID, decoratorName, and decoratorattributes are required' });
    }

    try {
        const newDecorator = await applicationDecoratorService.createApplicationDecorator({
            decoratorName,
            decoratorattributes,
            application: { connect: { id: applicationID } },
        });
        res.status(201).json(newDecorator);
    } catch (error: unknown) {
        console.error('Error creating application decorator:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to create application decorator' });
        }
    }
});

/**
 * @swagger
 * /applications/{applicationID}/decorators:
 *   get:
 *     summary: Get all decorators for an application
 *     tags: [Application Decorators]
 *     description: Retrieves a list of all decorators for a specific application.
 *     parameters:
 *       - in: path
 *         name: applicationID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of application decorators.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch application decorators.
 */
router.get('/applications/:applicationID/decorators', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
    const { applicationID } = req.params;

    try {
        const decorators = await applicationDecoratorService.getApplicationDecoratorsByApplicationId(applicationID);
        res.status(200).json({ data: decorators });
    } catch (error: unknown) {
        console.error('Error fetching application decorators by application ID:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to fetch application decorators' });
        }
    }
});

/**
 * @swagger
 * /application-decorators/{id}:
 *   get:
 *     summary: Get a single application decorator by ID
 *     tags: [Application Decorators]
 *     description: Retrieves a single application decorator by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single application decorator.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application decorator not found.
 *       500:
 *         description: Failed to fetch application decorator.
 */
router.get('/application-decorators/:id',[authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {

    const { id } = req.params;

    try {
        const decorator = await applicationDecoratorService.getApplicationDecoratorById(id);
        if (!decorator) {
            return res.status(404).json({ error: 'Application decorator not found' });
        }
        res.status(200).json(decorator);
    } catch (error: unknown) {
        console.error('Error fetching application decorator:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to fetch application decorator' });
        }
    }
});

/**
 * @swagger
 * /application-decorators/{id}:
 *   put:
 *     summary: Update an application decorator by ID
 *     tags: [Application Decorators]
 *     description: Updates an existing application decorator.
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
 *               decoratorName:
 *                 type: string
 *               decoratorattributes:
 *                 type: object
 *     responses:
 *       200:
 *         description: Application decorator updated successfully.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application decorator not found.
 *       500:
 *         description: Failed to update application decorator.
 */
router.put('/application-decorators/:id',[authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {

    const { id } = req.params;
    const { decoratorName, decoratorattributes } = req.body;

    try {
        const updatedDecorator = await applicationDecoratorService.updateApplicationDecorator(id, {
            decoratorName,
            decoratorattributes,
        });
        res.status(200).json(updatedDecorator);
    } catch (error: unknown) {
        console.error('Error updating application decorator:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to update application decorator' });
        }
    }
});

/**
 * @swagger
 * /application-decorators/{id}:
 *   delete:
 *     summary: Delete an application decorator by ID
 *     tags: [Application Decorators]
 *     description: Deletes an application decorator by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application decorator deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application decorator not found.
 *       500:
 *         description: Failed to delete application decorator.
 */
router.delete('/application-decorators/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await applicationDecoratorService.deleteApplicationDecorator(id);
        res.status(200).json({ message: 'Application decorator deleted successfully' });
    } catch (error: unknown) {
        console.error('Error deleting application decorator:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to delete application decorator' });
        }
    }
});

export = router;