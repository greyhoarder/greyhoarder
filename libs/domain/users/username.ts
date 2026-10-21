/** Usernames are unique regardless of case and surrounding spaces. */
export function toUsernameKey(username: string): string {
  return username.trim().toLowerCase();
}
