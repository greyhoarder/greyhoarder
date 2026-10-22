import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CurrentSession } from '../../../auth/api';
import { DashboardPage } from './dashboard-page';

describe('Dashboard page', () => {
  it('greets the signed-in user by name', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CurrentSession,
          useValue: { user: signal({ id: '1', username: 'lucas', role: 'admin' }) },
        },
      ],
    });
    const fixture = TestBed.createComponent(DashboardPage);

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Welcome back, lucas',
    );
  });
});
