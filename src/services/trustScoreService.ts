// For now, an in-memory map. In a real system, this would be Redis as I am aware.
const trustScores = new Map<string, number>();
const BASE_SCORE = 10;
const MIN_SCORE = 0;
const MAX_SCORE = 20;

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const getTrustScore = (identifier: string): number => {
    if (!trustScores.has(identifier)) {
        trustScores.set(identifier, BASE_SCORE);
    }
    return trustScores.get(identifier)!;
};

export const increaseTrust = (identifier: string, points = 1): number => {
    let currentScore = getTrustScore(identifier);
    currentScore += points;
    const newScore = clamp(currentScore, MIN_SCORE, MAX_SCORE);
    trustScores.set(identifier, newScore);
    console.log(`[${new Date().toISOString()}] Trust score for ${identifier} increased to ${newScore}.`);
    return newScore;
};

export const decreaseTrust = (identifier:string, points = 2): number => {
    let currentScore = getTrustScore(identifier);
    currentScore -= points;
    const newScore = clamp(currentScore, MIN_SCORE, MAX_SCORE);
    trustScores.set(identifier, newScore);
    console.log(`[${new Date().toISOString()}] Trust score for ${identifier} decreased to ${newScore}.`);
    return newScore;
}

export const getAllScores = (): Record<string, number> => {
    return Object.fromEntries(trustScores);
}