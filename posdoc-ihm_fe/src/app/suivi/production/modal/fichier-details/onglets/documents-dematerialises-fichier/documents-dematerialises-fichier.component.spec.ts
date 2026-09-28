import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsDematerialisesFichierComponent } from './documents-dematerialises-fichier.component';
import { ApiAdelaideDocumentDematerialiseService } from '@app/services/api-adelaide-docments-dematerialise.service';
import { filter, of } from 'rxjs';

describe('DocumentsDematerialisesFichierComponent', () => {
  let component: DocumentsDematerialisesFichierComponent;
  let fixture: ComponentFixture<DocumentsDematerialisesFichierComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideDocumentDematerialiseService>;

  const mockResponse = {
    data: {
      getDocDemOccurrenceApplication: [
        {
          datdem: '20251030',
          numdem: 1504,
          coddoc: 'AVG_UR',
          refdem: 'AVG_UR_b47b8873',
          typact: 'Demande gestionnaire',
          ddodeb: '2025-10-30 02:28:41',
          ddofin: '2025-10-30 02:28:41',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideDocumentDematerialiseService', ['getDocDematerialisesOccurrenceApplication']);
    await TestBed.configureTestingModule({
      declarations: [DocumentsDematerialisesFichierComponent],
      providers: [{ provide: ApiAdelaideDocumentDematerialiseService, useValue: mockApiService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsDematerialisesFichierComponent);
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
    mockApiService.getDocDematerialisesOccurrenceApplication.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should loadApiService in ngOnInit', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockApiService.getDocDematerialisesOccurrenceApplication).toHaveBeenCalledWith(component.params);
    component.rowData$.pipe(filter(data => !!data)).subscribe(data => {
      expect(data.length).toBe(1);
    });
  });
});
