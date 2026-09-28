import { TestBed } from '@angular/core/testing';

import { RedirectHomeGuard } from './redirect-home.guard';

xdescribe('RedirectHomeGuard', () => {
  let guard: RedirectHomeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RedirectHomeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
