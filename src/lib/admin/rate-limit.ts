/**
 * Login backoff for the admin password form.
 *
 * In-memory, per-process: on a serverless deploy each instance keeps its own
 * counter, so this slows a guessing run rather than stopping one outright.
 * For a two-person tool behind one shared password that is the right amount
 * of machinery — the alternative is a table write on every failed login.
 *
 * The decision logic is a pure function of (state, now) so it can be tested
 * without sleeping.
 */

export interface AttemptState {
  failures: number;
  /** Unix milliseconds; 0 when not locked. */
  lockedUntil: number;
}

export interface BackoffDecision {
  allowed: boolean;
  /** Whole seconds the caller must wait. Zero when allowed. */
  retryAfterSeconds: number;
}

/** Free attempts before the backoff starts. */
export const FREE_ATTEMPTS = 3;
const BASE_LOCK_SECONDS = 15;
const MAX_LOCK_SECONDS = 15 * 60;
/** A quiet period this long clears the counter. */
export const ATTEMPT_WINDOW_MS = 30 * 60 * 1000;

const EMPTY: AttemptState = { failures: 0, lockedUntil: 0 };

/** 4th failure → 15s, 5th → 30s, 6th → 60s … capped at 15 minutes. */
export function lockSecondsFor(failures: number): number {
  if (failures <= FREE_ATTEMPTS) return 0;
  const steps = failures - FREE_ATTEMPTS - 1;
  return Math.min(MAX_LOCK_SECONDS, BASE_LOCK_SECONDS * 2 ** steps);
}

export function checkBackoff(state: AttemptState | undefined, now: number): BackoffDecision {
  if (!state || state.lockedUntil <= now) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000),
  };
}

export function registerFailure(state: AttemptState | undefined, now: number): AttemptState {
  const failures = (state?.failures ?? 0) + 1;
  const lockSeconds = lockSecondsFor(failures);
  return { failures, lockedUntil: lockSeconds > 0 ? now + lockSeconds * 1000 : 0 };
}

export function clearState(): AttemptState {
  return { ...EMPTY };
}

/** Process-local store. Exported for tests to reset between cases. */
const attempts = new Map<string, AttemptState>();

function prune(now: number) {
  for (const [key, state] of attempts) {
    if (state.lockedUntil <= now && now - state.lockedUntil > ATTEMPT_WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export function checkLoginAllowed(key: string, now: number = Date.now()): BackoffDecision {
  prune(now);
  return checkBackoff(attempts.get(key), now);
}

export function recordLoginFailure(key: string, now: number = Date.now()): BackoffDecision {
  const next = registerFailure(attempts.get(key), now);
  attempts.set(key, next);
  return checkBackoff(next, now);
}

export function recordLoginSuccess(key: string): void {
  attempts.delete(key);
}

export function resetLoginAttempts(): void {
  attempts.clear();
}
