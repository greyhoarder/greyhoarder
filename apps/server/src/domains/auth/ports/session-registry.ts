/**
 * The session IDs of each signed-in user (ADR-0009), so a user's sessions can
 * be listed and ended together.
 */
export abstract class SessionRegistry {
  abstract add(userId: string, sessionId: string): Promise<void>;

  abstract remove(userId: string, sessionId: string): Promise<void>;

  abstract has(userId: string, sessionId: string): Promise<boolean>;
}
