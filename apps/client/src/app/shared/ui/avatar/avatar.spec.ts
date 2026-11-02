import { TestBed } from '@angular/core/testing';
import { Avatar } from './avatar';

describe('Avatar', () => {
  const render = async (url?: string) => {
    const fixture = TestBed.createComponent(Avatar);
    fixture.componentRef.setInput('name', 'mira');
    fixture.componentRef.setInput('url', url);
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  };

  it('shows the first letter without a picture', async () => {
    const avatar = await render();

    expect(avatar.textContent?.trim()).toBe('m');
  });

  it('shows the picture instead of the letter', async () => {
    const avatar = await render('/picture.jpg');

    expect(avatar.querySelector('img')?.getAttribute('src')).toBe('/picture.jpg');
    expect(avatar.textContent?.trim()).toBe('');
  });
});
