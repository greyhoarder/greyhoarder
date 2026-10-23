import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AddBoxPage } from './add-box-page';

describe('Add box page', () => {
  let fixture: ComponentFixture<AddBoxPage>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(AddBoxPage);
    await fixture.whenStable();
  });

  const page = (): HTMLElement => fixture.nativeElement;
  const kits = (): NodeListOf<Element> => page().querySelectorAll('[data-testid="add-box-kit"]');

  async function search(text: string): Promise<void> {
    const field = page().querySelector<HTMLInputElement>('[data-testid="add-box-search"]');
    if (field) {
      field.value = text;
      field.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
  }

  it('shows the recently used kits while the search is empty', () => {
    expect(kits()).toHaveLength(3);
  });

  it('shows every kit whose name, product code or barcode contains the search', async () => {
    await search('boyz');

    expect(kits()).toHaveLength(4);

    await search('50-10');

    expect(kits()).toHaveLength(1);
  });
});
