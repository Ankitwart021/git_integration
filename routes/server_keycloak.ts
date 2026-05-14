import dotenv from 'dotenv';
import express, { Request, Response, NextFunction, Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';


import { userService } from '../services';

// Load environment variables
dotenv.config();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and session management
 */

// Extend Express session with our custom properties
declare module 'express-session' {
    interface SessionData {
        accessToken?: string;
        refreshToken?: string;
        user?: KeycloakUser;
    }
}

// Define types for Keycloak user
interface KeycloakUser {
    sub: string;
    email: string;
    preferred_username: string;
    realm_access?: {
        roles: string[];
    };
}

// Define type for JWT verification response
interface JWTVerificationResponse {
    valid: boolean;
    decoded?: KeycloakUser;
    error?: string;
}

// JWKS client to get the signing key from Keycloak
const client = jwksClient({
    jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/certs`
});

// Function to get the signing key from the JWKS
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
    client.getSigningKey(header.kid!, (err, key) => {
        if (err) {
            return callback(err);
        }
        const signingKey = key?.getPublicKey() || (key as any).rsaPublicKey;
        callback(null, signingKey);
    });
}

// Middleware to check roles
function checkRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { user } = req.session;

        if (!user) {
            return res.status(403).send('User not authenticated');
        }

        const roles = user.realm_access?.roles;
        if (roles && roles.includes(role)) {
            next();  // Proceed if the user has the role
        } else {
            return res.status(403).send('Forbidden - Insufficient role');
        }
    };
}

// Create router
const router: Router = express.Router();

// Step 1: Redirect to Keycloak login
router.get('/login', (req: Request, res: Response) => {
    const keycloakLoginUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=openid`;
    res.redirect(keycloakLoginUrl);
});

// Callback route for handling Keycloak authentication
router.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send('Authorization code not found.');
    }

    try {
        // Exchange authorization code for access and refresh tokens
        const tokenResponse = await axios.post(
            `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
                client_id: process.env.CLIENT_ID!,
                client_secret: process.env.CLIENT_SECRET!,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI!,
            }).toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token: accessToken, refresh_token: refreshToken } = tokenResponse.data;

        // Validate and decode the access token
        const verifyResponse = await verifyJWT(accessToken);
        
        if (!verifyResponse.valid || !verifyResponse.decoded) {
            throw new Error(verifyResponse.error || 'Invalid token');
        }

        const decoded = verifyResponse.decoded;

        // Save tokens and user data in the session
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        req.session.user = decoded;

        // Upsert the user based on Keycloak's 'sub' (which is the user's ID)
        try {
            const user = await userService.upsertUser({
                id: decoded.sub,
                username: decoded.preferred_username,
                email: decoded.email
            });
            console.log('User upserted in database:', user);
        } catch (error) {
            console.error('Error upserting user in database:', error);
            return res.status(500).send('Database error during user upsert');
        }

        

        // Set the access token in a secure, HTTP-only cookie
        res.cookie('jwt', accessToken?accessToken:refreshToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict',
        });

        // Redirect to the frontend
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error: any) {
        console.error('Error during authentication:', error.message);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
            }
        });
        
        // More specific error messages
        if (error.response?.status === 401) {
            console.error('❌ AUTHENTICATION ERROR: Invalid client credentials. Please check:');
            console.error('   1. CLIENT_SECRET in .env matches the secret in Keycloak');
            console.error('   2. CLIENT_ID is correct');
            console.error('   3. Client exists in the specified realm');
            console.error(`   4. Keycloak URL is accessible: ${process.env.KEYCLOAK_URL}`);
            return res.status(500).send('Authentication failed: Invalid client credentials. Check server logs.');
        }
        
        res.status(500).send('Authentication failed');
    }
});

// Signout route
/**
 * @swagger
 * /auth/signout:
 *   get:
 *     summary: Sign out user
 *     tags: [Authentication]
 *     description: Invalidates the user's session and logs them out from Keycloak.
 *     responses:
 *       302:
 *         description: Redirects to the login page after successful logout.
 *       500:
 *         description: Failed to log out.
 */
router.get('/signout', async (req: Request, res: Response) => {
    const refreshToken = req.session.refreshToken;

    // Check if refresh token is available
    if (!refreshToken) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.clearCookie('jwt');
            const keycloakLoginUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=openid`;
            res.redirect(keycloakLoginUrl)
        });
        return;
    }

    try {
        // Call Keycloak's logout endpoint to invalidate the session
        await axios.post(
            `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/logout`,
            new URLSearchParams({
                client_id: process.env.CLIENT_ID!,
                client_secret: process.env.CLIENT_SECRET!,
                refresh_token: refreshToken,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // Clear the session on the backend
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Failed to log out' });
            }

            // Clear the JWT cookie
            res.clearCookie('jwt');

            // Redirect user to frontend login page
            const keycloakLoginUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=openid`;
            res.redirect(keycloakLoginUrl)
        });
    } catch (error: any) {
        console.error('Error during Keycloak logout:', error.message);
        return res.status(500).json({ error: 'Logout failed' });
    }
});

// JWT Verification function
const verifyJWT = async (accessToken: string): Promise<JWTVerificationResponse> => {
    if (!accessToken) {
        return { valid: false, error: 'Access token missing' };
    }

    try {
        const decoded = await new Promise<KeycloakUser>((resolve, reject) => {
            jwt.verify(
                accessToken,
                getKey,
                {
                    algorithms: ['RS256'],
                    audience: [process.env.CLIENT_ID!, 'account'],
                    issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}`,
                },
                (err, decoded) => {
                    if (err) {
                        console.error('Token validation error:', err.message);
                        if (err.message === 'jwt expired') {
                           return reject(new Error('TokenExpiredError'));
                        }

                        return reject(new Error('Invalid token'));
                    }
                    resolve(decoded as KeycloakUser);
                }
            );
        });

        return { valid: true, decoded };
    } catch (err: any) {
        console.error('Token validation error:', err.message);
        return { valid: false, error: 'Invalid token' };
    }
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token:any = req.session.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await verifyJWT(token);
 if (!result.valid) {
  return res.status(401).json({ error: 'Unauthorized' });
}

  // attach user to session
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  req.session.user = result.decoded;
  next();
};

export  {
    router,
    verifyJWT,
    authMiddleware,
};