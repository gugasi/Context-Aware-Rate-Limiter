import { Router, Request, Response } from 'express';
import { rateLimiterMiddleware } from '../middleware/rateLimiter';

const router = Router();

router.get('/data', rateLimiterMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'You have successfully accessed the super secret AI data!',
    timestamp: new Date().toISOString(),
    requesterIdentifier: (req.headers['x-api-key'] as string) || req.ip,
  });
});

router.post('/submit', rateLimiterMiddleware, (req: Request, res: Response) => {
    res.status(201).json({
        message: 'Data submitted successfully!',
        dataReceived: req.body,
        timestamp: new Date().toISOString(),
        requesterIdentifier: (req.headers['x-api-key'] as string) || req.ip,
    });
});

export default router;