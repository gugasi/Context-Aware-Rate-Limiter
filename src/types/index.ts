export interface RateLimitRule {
  keyPrefix: string; // e.g., 'global', 'user', 'ip_address'
  points: number; // Max requests
  duration: number; // Per duration in seconds
  blockDuration?: number; // Optional: duration to block the user upon exceeding points (in seconds)
}

export interface UserSpecificRule extends RateLimitRule {
  identifier: string; // The specific user ID, IP, or API key
}

// This will hold our effective configurations, including default and user-specific
export interface RateLimitConfig {
  default: RateLimitRule;
  userSpecific?: Map<string, UserSpecificRule>; // Keyed by identifier (user ID, IP, etc.)
}