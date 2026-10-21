import { TestBed } from '@angular/core/testing';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Logo } from './logo';

describe('Logo', () => {
  const renderLogo = async (size?: number) => {
    const fixture = TestBed.createComponent(Logo);
    if (size !== undefined) {
      fixture.componentRef.setInput('size', size);
    }
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('img') as HTMLImageElement;
  };

  it('hides the logo image from screen readers because the name is already shown as text', async () => {
    const image = await renderLogo();

    expect(image.getAttribute('alt')).toBe('');
  });

  it('shows the logo image in the requested size', async () => {
    const image = await renderLogo(64);

    expect(image.getAttribute('width')).toBe('64');
    expect(image.getAttribute('height')).toBe('64');
  });

  it('references a valid logo file', async () => {
    const image = await renderLogo();
    const source = image.getAttribute('src');

    expect(source).toBe('logo-small.svg');
    expect(existsSync(resolve(process.cwd(), 'public', source!))).toBe(true);
  });
});
