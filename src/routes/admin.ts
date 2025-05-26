import { Router, Request, Response } from 'express';
import {
  getConfig,
  updateDefaultRule,
  updateUserSpecificRule,
  deleteUserSpecificRule,
} from '../config/rateLimitConfig';
import { RateLimitRule } from '../types';
import { authAdmin } from '../middleware/authAdmin';
import { clearCachedLimiters } from '../middleware/rateLimiter';
import { getAllScores } from '../services/trustScoreService';

const router = Router();
router.use(authAdmin);

router.get('/config', (req: Request, res: Response) => {
  res.json(getConfig());
});

router.post('/config/default', (req: Request, res: Response) => {
    const { points, duration, blockDuration } = req.body;
    const updates: Partial<RateLimitRule> = {};
    if (points !== undefined) updates.points = Number(points);
    if (duration !== undefined) updates.duration = Number(duration);
    if (req.body.hasOwnProperty('blockDuration')) {
       updates.blockDuration = blockDuration === null ? undefined : Number(blockDuration);
    }

    // Basic validation
    if (Object.values(updates).some(value => isNaN(Number(value)))) {
        return res.status(400).json({ message: 'All provided rule values must be numbers.' });
    }

    const updatedRule = updateDefaultRule(updates);
    clearCachedLimiters();
    res.json({ message: 'Default rate limit rule updated successfully.', rule: updatedRule });
});

router.post('/config/user', (req: Request, res: Response) => {
    const { identifier, points, duration, blockDuration } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: 'User identifier is required.' });
    }
    const updates = { points, duration, blockDuration };
    const updatedRule = updateUserSpecificRule(identifier, updates);
    clearCachedLimiters();
    res.json({ message: `User-specific rule for '${identifier}' updated.`, rule: updatedRule });
});

router.delete('/config/user/:identifier', (req: Request, res: Response) => {
    const { identifier } = req.params;
    const success = deleteUserSpecificRule(identifier);
    if (success) {
      clearCachedLimiters();
      res.json({ message: `User-specific rule for '${identifier}' deleted.` });
    } else {
      res.status(404).json({ message: `User-specific rule for '${identifier}' not found.` });
    }
});

// GET all current trust scores
router.get('/scores', (req: Request, res: Response) => {
    res.json(getAllScores());
});

export default router;