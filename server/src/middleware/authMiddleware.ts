import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 *
 * This middleware checks for the presence of a valid JWT in the `Authorization` header
 * of incoming requests. If the token is valid, it decodes the token and attaches the
 * user's ID to the `req.user` object for further use in the application.
 *
 * Steps:
 * 1. Checks if the `Authorization` header exists and starts with "Bearer ".
 * 2. Extracts the token from the header.
 * 3. Verifies the token using the secret key (`JWT_SECRET`).
 * 4. If the token is valid, extracts the user ID and attaches it to `req.user`.
 * 5. If the token is missing, invalid, or expired, responds with a 401 Unauthorized status.
 *
 * @param req - The incoming HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the request-response cycle.
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded === 'string' || !decoded.id) {
      res.status(401).json({ message: 'Unauthorized - Invalid token' });
      return;
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Unauthorized - Token invalid or expired' });
    return;
  }
};
