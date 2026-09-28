import { TestBed } from '@angular/core/testing';

import { MenuVerticalService } from './menu-vertical.service';

describe('MenuVerticalService', () => {
  let service: MenuVerticalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuVerticalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
