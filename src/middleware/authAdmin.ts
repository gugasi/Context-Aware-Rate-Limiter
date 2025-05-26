import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("FATAL ERROR: ADMIN_API_KEY is not set in environment variables.");
}

export const authAdmin = (req: Request, res: Response, next: NextFunction) => {
  const providedApiKey = req.headers['x-admin-api-key'] as string;

  if (!ADMIN_API_KEY) {
    return res.status(500).json({ message: 'Admin functionality not configured.'})
  }
  if (!providedApiKey) {
    return res.status(401).json({ message: 'Unauthorized: Admin API key missing.' });
  }
  if (providedApiKey !== ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid Admin API key.' });
  }

  next();
};