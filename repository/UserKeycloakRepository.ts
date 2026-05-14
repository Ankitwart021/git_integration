import { Request, Response } from 'express';
import keycloakService from '../services/keycloak.service';

/**
 * Controller to handle fetching users from Keycloak.
 * Requires a Bearer token in the Authorization header.
 * Formats the response cleanly including the fetched roles.
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
      return;
    }

    // Call service to get all users via admin token
    const users = await keycloakService.fetchUsers();
    
    // Format the response according to requirements
    const formattedUsers = users.map((user: any) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || []
      };
    });

    res.status(200).json(formattedUsers);
  } catch (error: any) {
    console.error('Error fetching users in controller:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch users from Keycloak',
      details: error.message 
    });
  }
};
