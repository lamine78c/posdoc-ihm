import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NoticesFichierComponent } from './notices-fichier.component';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { filter, of } from 'rxjs';

describe('NoticesFichierComponent', () => {
  let component: NoticesFichierComponent;
  let fixture: ComponentFixture<NoticesFichierComponent>;
  let mockApiService: jasmine.SpyObj<ApiNoticesService>;

  const mockResponse = {
    data: {
      getNoticesOccurrenceApplication: [
        {
          codnot: 'TEST',
          poinot: 20,
          fornot: 'DL',
          pornot: 'L',
          libnot: 'Notice de test',
          codsit: 'CIRTIL',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiNoticesService', ['getNoticesOccurrenceApplication']);
    TestBed.configureTestingModule({
      declarations: [NoticesFichierComponent],
      providers: [{ provide: ApiNoticesService, useValue: mockApiService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticesFichierComponent);
    component = fixture.componentInstance;
    component.params = {
      codenv: 'P',
      codorg: '750',
      codapp: 'MAS',
      percod: '251011-00',
      codcom: 'RRDE',
      codfic: 'L00',
      numcom: '00',
    };
    mockApiService.getNoticesOccurrenceApplication.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should loadApiService in ngInit', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockApiService.getNoticesOccurrenceApplication).toHaveBeenCalledWith(component.params);
    component.rowData$.pipe(filter(data => !!data)).subscribe(data => {
      expect(data.length).toBe(1);
    });
  });
});
