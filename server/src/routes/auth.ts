import express, { Request, Response } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';

dotenv.config();
const router = express.Router();

type RefreshTokenRequest = Request<{}, {}, { refreshToken: string }>;

interface User {
    id: string;
    username: string;
    password: string; // Hashed password
}

// Dummy user storage (Replace with a real database)
const users: User[] = [];

interface TokenStore {
    [userId: string]: string;
}

/**
 * Store refresh tokens in memory (Replace with a real database)
 * when logging in, store the refresh token in the database
 * when logging out, delete the refresh token from the database
 */
const refreshTokens: TokenStore = {}; 

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshsecret';

// Generate JWT access token
const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '10m' });
};

// Generate JWT refresh token with long expiry
const generateRefreshToken = (userId: string): string => {
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '1d' });
    refreshTokens[userId] = refreshToken; // Store refresh token for this user
    return refreshToken;
};

/**
 * Login funciton
 * @param req - Request that contains username and password
 * @param res - Response that contains accessToken and refreshToken
 * @returns 
 */
const login = async (req: Request, res: Response): Promise<void> => {
    console.log('Logging in:', req.body);
    try {
        const { username, password } = req.body;
        const user = users.find((u) => u.username === username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Register function
 * @param req - Request that contains username and password
 * @param res - Response that contains message
 * @returns 
 */
const register = async (req: Request, res: Response): Promise<void> => {
    console.log('Registering user:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return;
  }

  const { username, password } = req.body;
  const existingUser = users.find((u) => u.username === username);

  if (existingUser) {
    res.status(400).json({ message: 'Username already exists.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = { id: Date.now().toString(), username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
}

// Registration validation for user input
const registerValidator = [
    body('username')
      .trim()
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.')
      .escape(),
    body('password')
      .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long.'),
  ];

/**
 * Refresh token function
 * @param req - Request that contains refreshToken
 * @param res - Response that contains accessToken
 * @returns 
 */
const refreshTokenRequest = (req: RefreshTokenRequest, res: Response): void => {
    console.log('Refreshing token:', req.body);
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(403).json({ message: 'Refresh token required' });
        return;
    }

    const userId = Object.keys(refreshTokens).find(
        (key) => refreshTokens[key] === refreshToken
    );
    if (!userId) {
        res.status(403).json({ message: 'Invalid refresh token' });
        return;
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err || !decoded || typeof decoded === 'string' || !('id' in decoded)) {
            res.status(403).json({ message: 'Invalid refresh token' });
            return;
        }

        const newAccessToken = generateAccessToken(decoded.id);
        res.json({ accessToken: newAccessToken });
    });
}

/**
 * Logout function
 * were deleting the refresh token from the database
 * @param req - Request that contains refreshToken
 * @param res - Response that contains message
 */
const logout = (req: RefreshTokenRequest, res: Response): void => {
    console.log('Logging out:', req.body);
    const { refreshToken } = req.body;
    const userId = Object.keys(refreshTokens).find(
        (key) => refreshTokens[key] === refreshToken
    );

    if (userId) {
        delete refreshTokens[userId]; // Remove refresh token
    }

    res.json({ message: 'Logged out successfully' });
}

// Routes
router.post( '/login', login );
router.post( '/register', registerValidator, register );
router.post( '/refresh', refreshTokenRequest );
router.post( '/logout', logout );

export default router;
