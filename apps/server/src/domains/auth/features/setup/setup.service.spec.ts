import { AccountsService } from '../../../users/api/index.js';
import { SetupService } from './setup.service.js';

describe('Initial setup', () => {
  function setupWhere({ accountExists }: { accountExists: boolean }) {
    const createInitialAdmin = vi.fn((_username: string, _passwordHash: string) => Promise.resolve());
    const users = {
      findById: () => Promise.resolve(undefined),
      findByUsername: () => Promise.resolve(undefined),
      hasAny: () => Promise.resolve(accountExists),
    };
    const accounts = new AccountsService({
      findCredentials: () => Promise.resolve(undefined),
      createInitialAdmin,
    });
    const passwords = {
      hash: (password: string) => Promise.resolve(`hashed:${password}`),
      verify: () => Promise.resolve(false),
      spendVerificationTime: () => Promise.resolve(),
    };
    return { setup: new SetupService(users, accounts, passwords), createInitialAdmin };
  }

  it('reports the setup as required while no account exists', async () => {
    const { setup } = setupWhere({ accountExists: false });

    const required = await setup.isRequired();

    expect(required).toBe(true);
  });

  it('reports the setup as not required once an account exists', async () => {
    const { setup } = setupWhere({ accountExists: true });

    const required = await setup.isRequired();

    expect(required).toBe(false);
  });

  it('stores the administrator with the hashed password, never the plain one', async () => {
    const { setup, createInitialAdmin } = setupWhere({ accountExists: false });

    await setup.createAdministrator('lucas', 'secret');

    expect(createInitialAdmin).toHaveBeenCalledWith('lucas', 'hashed:secret');
  });
});
