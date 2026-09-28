import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticesComponent } from './notices.component';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { of } from 'rxjs';

describe('NoticesComponent', () => {
  let component: NoticesComponent;
  let fixture: ComponentFixture<NoticesComponent>;
  let apiNoticesServiceSpy: jasmine.SpyObj<ApiNoticesService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiNoticesService', ['getDetailsNotices']);

    await TestBed.configureTestingModule({
      declarations: [NoticesComponent],
      providers: [{ provide: ApiNoticesService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticesComponent);
    component = fixture.componentInstance;

    apiNoticesServiceSpy = TestBed.inject(ApiNoticesService) as jasmine.SpyObj<ApiNoticesService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve details notices and update the component state', () => {
    const mockResponse = {
      data: {
        getDetailsNotices: [
          {
            codcom: 'C001',
            codfic: 'F001',
            numcom: 'N001',
            codprd: 'P001',
            refimp: 'R001',
            libfic: 'LibFichier1',
            codnot: 'CODNOT001',
            poinot: 10,
            fornot: 'FORNOT001',
            pornot: 'N',
            libnot: 'LIBNOT001',
            codsit: 'SIT001',
          },
          {
            codcom: 'C002',
            codfic: 'F002',
            numcom: 'N002',
            codprd: 'P002',
            refimp: 'R002',
            libfic: 'LibFichier2',
            codnot: 'CODNOT002',
            poinot: 20,
            fornot: 'FORNOT002',
            pornot: 'N',
            libnot: 'LIBNOT002',
            codsit: 'SIT002',
          },
        ],
      },
    };

    component.paramData = {} as OngletsParamDataModel;
    apiNoticesServiceSpy.getDetailsNotices.and.returnValue(of(mockResponse as any));

    component.getDetailsNotices();

    expect(apiNoticesServiceSpy.getDetailsNotices).toHaveBeenCalledWith(component.paramData);
    expect(component.detailNotices).toEqual((mockResponse as any).data.getDetailsNotices);
    expect(component.totalNotice).toBe(2);
  });

  it('should handle empty response from API', () => {
    const mockResponse = {
      data: {
        getDetailsNotices: [],
      },
    };

    component.paramData = {} as OngletsParamDataModel;
    apiNoticesServiceSpy.getDetailsNotices.and.returnValue(of(mockResponse as any));

    component.getDetailsNotices();

    expect(apiNoticesServiceSpy.getDetailsNotices).toHaveBeenCalledWith(component.paramData);
    expect(component.totalNotice).toBe(0);
  });
});
