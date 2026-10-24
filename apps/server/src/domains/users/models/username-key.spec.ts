import { toUsernameKey } from './username-key.js';

describe('Username key', () => {
  it('gives usernames that differ only in case or surrounding spaces the same key', () => {
    const keys = ['Lucas', 'lucas', ' LUCAS '].map(toUsernameKey);

    expect(new Set(keys).size).toBe(1);
  });
});
