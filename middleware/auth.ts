import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../routes/server_keycloak';
import { userApplicationMapRepository, customComponentRepository } from '../services';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication failed: No token provided or invalid format' });
        }
        const token = authHeader.split(' ')[1];
        
        const verification = await verifyJWT(token);

        if (verification.valid && verification.decoded) {
            req.user = { id: verification.decoded.sub };
            next();
        } else {
            return res.status(401).json({ error: 'Authentication failed: ' + verification.error });
        }
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

export const checkApplicationOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userId = req.user?.id;
        const applicationId = req.params.applicationId || req.params.id;

        if (!userId || !applicationId) {
            return res.status(400).json({ error: 'Access Denied' });
        }

        const mapping = await userApplicationMapRepository.findUnique(userId, applicationId);

        if (!mapping) {
            return res.status(404).json({ error: 'Application not found or you do not have permission to access it' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify application ownership' });
    }
};

export const checkComponentOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const componentId = req.params.id;

        if (!userId || !componentId) {
            return res.status(400).json({ error: 'User ID and Component ID are required' });
        }

        const component = await customComponentRepository.findById(componentId);

        if (!component) {
            return res.status(404).json({ error: 'Component not found' });
        }

        if (component.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to access this component' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify component ownership' });
    }
};