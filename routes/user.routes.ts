import { Router } from 'express';
import { getUsers } from '../repository/UserKeycloakRepository';

const router = Router();

// GET /users - Fetch all users from Keycloak
router.get('/', getUsers);

export default router;
