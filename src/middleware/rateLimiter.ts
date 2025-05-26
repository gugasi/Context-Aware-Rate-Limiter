import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, IRateLimiterOptions, RateLimiterRes } from 'rate-limiter-flexible';
import { getRuleForIdentifier } from '../config/rateLimitConfig';
import { RateLimitRule } from '../types';
import { increaseTrust, decreaseTrust } from '../services/trustScoreService'; // Import the service

const rateLimiters = new Map<string, RateLimiterMemory>();

const getLimiter = (rule: RateLimitRule): RateLimiterMemory => {
  const limiterKey = `${rule.keyPrefix}_${rule.points}_${rule.duration}_${rule.blockDuration || 0}`;

  if (!rateLimiters.has(limiterKey)) {
    const opts: IRateLimiterOptions = {
      points: rule.points,
      duration: rule.duration,
      keyPrefix: rule.keyPrefix,
    };
    if (rule.blockDuration) {
      opts.blockDuration = rule.blockDuration;
    }
    rateLimiters.set(limiterKey, new RateLimiterMemory(opts));
    console.log(`[${new Date().toISOString()}] Created new RateLimiterMemory instance for key: ${limiterKey}`);
  }
  return rateLimiters.get(limiterKey)!;
};

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;
  const clientIdentifier = apiKey || req.ip;

  if (!clientIdentifier) {
    return res.status(400).json({ message: 'Client identifier missing for rate limiting.' });
  }

  const rule = getRuleForIdentifier(clientIdentifier);
  const limiter = getLimiter(rule);

  try {
    await limiter.consume(clientIdentifier);
    
    // POSITIVE ACTION: If a user successfully submits data, reward them.
    if (req.method === 'POST' && req.path.includes('/submit')) {
        increaseTrust(clientIdentifier);
    }

    next();
  } catch (rlRejected) {
    // NEGATIVE ACTION: The user hit the rate limit. Penalize them.
    decreaseTrust(clientIdentifier);

    const err = rlRejected as RateLimiterRes;
    const retryAfter = Math.ceil(err.msBeforeNext / 1000);

    res.status(429).json({
      message: 'Too Many Requests',
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfterSeconds: retryAfter,
      clientIdentifier: clientIdentifier,
      ruleApplied: rule.keyPrefix.startsWith('global') ? 'global' : 'user-specific',
    });
    console.warn(`[${new Date().toISOString()}] Rate limit exceeded for ${clientIdentifier} (rule: ${rule.keyPrefix}). Retry in ${retryAfter}s.`);
  }
};

export const clearCachedLimiters = () => {
  rateLimiters.clear();
  console.log(`[${new Date().toISOString()}] All cached RateLimiterMemory instances cleared.`);
};