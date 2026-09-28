import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { ApiAdelaideHelpService } from '@app/services/api-adelaide/admin/help/api-adelaide-help.service';
import { of } from 'rxjs';
import { TYPE_STATE_HELP } from '@app/shared/utils/Constants_help';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideHelpService>;
  const mockResponse = {
    data: {
      getPublication: [
        {
          id: 1,
          path: 'path',
          message: 'message published',
          state: TYPE_STATE_HELP.ENABLED,
          createdAt: '2025-10-21T04:56:00',
          updatedAt: '2025-10-21T04:56:00',
        },
        {
          id: 2,
          path: 'path',
          message: 'message draft',
          state: TYPE_STATE_HELP.DRAFT,
          createdAt: '2025-10-21T04:56:00',
          updatedAt: '2025-10-21T04:56:00',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideHelpService', ['getPublicationByPath']);
    TestBed.configureTestingModule({
      declarations: [HelpComponent],
      providers: [{ provide: ApiAdelaideHelpService, useValue: mockApiService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    component.path = 'path';
    mockApiService.getPublicationByPath.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load modal title from api service', () => {
    fixture.detectChanges();
    expect(component.message).toEqual('message published');
  });
});
