/**
 * Pseudo-Random Number Generator (PRNG) for deterministic dice rolls
 *
 * Uses Mulberry32 algorithm for fast, deterministic random number generation.
 * Seed is derived from the event log to ensure reproducibility.
 */

/**
 * Mulberry32 PRNG algorithm
 * Returns a number between 0 (inclusive) and 1 (exclusive)
 */
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string to a 32-bit integer seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic seed from event log context
 *
 * The seed is based on:
 * - Number of events in the log
 * - Current timestamp (for uniqueness)
 * - Optional label (for different roll sequences)
 */
export function generateSeed(eventCount: number, timestamp: string, label?: string): number {
  const seedString = `${eventCount}-${timestamp}-${label || 'default'}`;
  return hashString(seedString);
}

/**
 * Roll a percentile dice (1-100) using a deterministic seed
 */
export function rollPercentile(seed: number): number {
  const rng = mulberry32(seed);
  return Math.floor(rng() * 100) + 1; // 1 to 100 inclusive
}

/**
 * Generate a dice roll from event log context
 * Returns a roll between 1 and 100
 */
export function generateDiceRoll(eventCount: number, timestamp: string, label?: string): number {
  const seed = generateSeed(eventCount, timestamp, label);
  return rollPercentile(seed);
}
