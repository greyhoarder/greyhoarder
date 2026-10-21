import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

@Component({ template: 'Stub page' })
class StubPage {}

describe('App shell', () => {
  it('shows the page of the current address', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'stub', component: StubPage }])],
    });
    const fixture = TestBed.createComponent(App);
    const shell: HTMLElement = fixture.nativeElement;

    await TestBed.inject(Router).navigateByUrl('/stub');
    await fixture.whenStable();

    expect(shell.textContent).toContain('Stub page');
  });
});
