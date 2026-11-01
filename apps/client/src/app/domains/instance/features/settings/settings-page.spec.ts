import { TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings-page';

describe('Settings page', () => {
  it('says that there is nothing to set yet', async () => {
    const fixture = TestBed.createComponent(SettingsPage);

    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[data-testid="settings-empty"]')?.textContent?.trim()).toBe('Nothing to set yet.');
  });
});
