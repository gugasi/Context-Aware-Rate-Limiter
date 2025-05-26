import { RateLimitConfig, RateLimitRule, UserSpecificRule } from '../types';
import { getTrustScore } from '../services/trustScoreService'; // Import the service

// In-memory store for rate limit configurations
// Initialize with some sensible defaults
const currentConfig: RateLimitConfig = {
  default: {
    keyPrefix: 'global',
    points: 100, // Max 100 requests
    duration: 60, // Per 60 seconds (1 minute)
  },
  userSpecific: new Map<string, UserSpecificRule>(),
};

export const getConfig = (): Readonly<RateLimitConfig> => {
  // Return a deep copy or make it readonly to prevent direct mutation outside of update functions
  return JSON.parse(JSON.stringify(currentConfig));
};

export const getRuleForIdentifier = (identifier: string): RateLimitRule => {
  // First, get the base rule (either user-specific or default)
  const userRule = currentConfig.userSpecific?.get(identifier);
  let baseRule = userRule
    ? { ...userRule, keyPrefix: `user_${identifier}` }
    : { ...currentConfig.default, keyPrefix: `global_${identifier}` };

  // Now, get the trust score and apply a modifier
  const score = getTrustScore(identifier);
  let multiplier = 1.0;

  if (score < 5) { // Low trust
    multiplier = 0.5; // 50% of the normal points
  } else if (score > 15) { // High trust
    multiplier = 2.0; // 200% of the normal points
  }

  // Apply the multiplier, ensuring it's an integer and at least 1
  const modifiedPoints = Math.max(1, Math.floor(baseRule.points * multiplier));

  console.log(`[${new Date().toISOString()}] Identifier: ${identifier}, Score: ${score}, Base Points: ${baseRule.points}, Multiplier: ${multiplier}, Final Points: ${modifiedPoints}`);

  return {
    ...baseRule,
    points: modifiedPoints,
  };
};

export const updateDefaultRule = (newRule: Partial<RateLimitRule>): RateLimitRule => {
  // Merge ensures that only provided fields are updated
  currentConfig.default = { ...currentConfig.default, ...newRule, keyPrefix: 'global' };
  console.log(`[${new Date().toISOString()}] Default rate limit rule updated:`, currentConfig.default);
  return currentConfig.default;
};

export const updateUserSpecificRule = (
  identifier: string,
  newRule: Partial<Omit<UserSpecificRule, 'identifier' | 'keyPrefix'>>
): UserSpecificRule => {
  const existingRule = currentConfig.userSpecific?.get(identifier) || {
    identifier,
    keyPrefix: `user_${identifier}`,
    points: currentConfig.default.points,
    duration: currentConfig.default.duration,
  };

  const updatedRule: UserSpecificRule = {
    ...existingRule,
    ...newRule,
    identifier,
    keyPrefix: `user_${identifier}`,
  };

  currentConfig.userSpecific?.set(identifier, updatedRule);
  console.log(`[${new Date().toISOString()}] User-specific rule updated for '${identifier}':`, updatedRule);
  return updatedRule;
};

export const deleteUserSpecificRule = (identifier: string): boolean => {
  const deleted = currentConfig.userSpecific?.delete(identifier) || false;
  if (deleted) {
    console.log(`[${new Date().toISOString()}] User-specific rule deleted for '${identifier}'`);
  }
  return deleted;
};