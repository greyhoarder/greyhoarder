import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ColorScheme } from '../../../../../shared/theme/color-scheme';
import { HttpProfileAdapter } from '../../../infrastructure/http-profile-adapter';
import { HttpSessionAdapter, type SessionUser } from '../../../infrastructure/http-session-adapter';
import { SquareImage } from '../../../util/square-image';
import { CurrentSession } from '../current-session';
import { ProfilePage } from './profile-page';

const MIRA: SessionUser = { id: '1', username: 'mira', role: 'admin' };

describe('Profile page', () => {
  const update = vi.fn<HttpProfileAdapter['update']>();
  const setAvatar = vi.fn<HttpProfileAdapter['setAvatar']>();
  const toJpeg = vi.fn<SquareImage['toJpeg']>();

  const render = async () => {
    const user = signal<SessionUser>(MIRA);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CurrentSession, useValue: { user, replace: user.set } },
        { provide: HttpProfileAdapter, useValue: { update, setAvatar } },
        { provide: HttpSessionAdapter, useValue: {} },
        { provide: SquareImage, useValue: { toJpeg } },
        { provide: ColorScheme, useValue: { theme: () => 'system', choose: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(ProfilePage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const find = <T extends HTMLElement>(testId: string): T | null =>
      page.querySelector<T>(`[data-testid="${testId}"]`);
    const typeName = async (name: string): Promise<void> => {
      const field = find<HTMLInputElement>('profile-display-name');
      if (field) {
        field.value = name;
        field.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        field.dispatchEvent(new Event('blur'));
      }
    };
    const choosePicture = async (file: File): Promise<void> => {
      const field = find<HTMLInputElement>('profile-avatar-file');
      if (field) {
        Object.defineProperty(field, 'files', { value: [file], configurable: true });
        field.dispatchEvent(new Event('change'));
      }
      await fixture.whenStable();
    };
    return { fixture, find, typeName, choosePicture };
  };

  beforeEach(() => {
    update.mockReset();
    setAvatar.mockReset();
    toJpeg.mockReset();
  });

  it('shows the name and role of the signed-in user', async () => {
    const { find } = await render();

    expect(find('profile-username')?.textContent?.trim()).toBe('mira');
    expect(find('profile-role')?.textContent?.trim()).toBe('Admin');
  });

  it('saves name, language, picture', async () => {
    update.mockResolvedValue(MIRA);
    setAvatar.mockResolvedValue({ ...MIRA, avatarId: 'new' });
    toJpeg.mockResolvedValue('jpeg');
    const { fixture, find, typeName, choosePicture } = await render();

    await typeName('Mira K.');
    await fixture.whenStable();
    const language = find<HTMLSelectElement>('profile-language');
    if (language) {
      language.value = 'de';
      language.dispatchEvent(new Event('change'));
    }
    await fixture.whenStable();
    await choosePicture(new File(['x'], 'mira.png', { type: 'image/png' }));

    expect(update).toHaveBeenCalledWith({ displayName: 'Mira K.' });
    expect(update).toHaveBeenCalledWith({ language: 'de' });
    expect(setAvatar).toHaveBeenCalledWith('jpeg');
  });

  it('shows the stored value when saving fails', async () => {
    update.mockRejectedValue(new Error('offline'));
    const { fixture, find, typeName } = await render();

    await typeName('Mira K.');
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(find('profile-error')?.textContent?.trim()).toBe("Can't save right now. Try again in a moment.");
    });

    expect(find<HTMLInputElement>('profile-display-name')?.value).toBe('');
  });

  it('refuses a file that is no image', async () => {
    const { find, choosePicture } = await render();

    await choosePicture(new File(['x'], 'notes.txt', { type: 'text/plain' }));

    expect(find('profile-avatar-error')?.textContent?.trim()).toBe('Choose an image.');
    expect(setAvatar).not.toHaveBeenCalled();
  });
});
