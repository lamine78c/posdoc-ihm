import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { of, throwError } from 'rxjs';
import { GeneralitesFichierComponent } from './generalites-fichier.component';

describe('GeneralitesFichierComponent', () => {
  let component: GeneralitesFichierComponent;
  let fixture: ComponentFixture<GeneralitesFichierComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;

  const mockResponse = {
    data: {
      searchOccAppByFic: {
        libfic: 'ADHESIONS AU PRELEVEMENT SEPA DES COTISATIONS PL TRIMESTRIELS',
        libfor: '(B) Nouvelle charte graphique - DOC1',
        libsup: 'Imprimes',
        libmul: 'Pas de multi-feuillets',
        reffor: '',
        refimp: 'PDS2A65',
        refsup: '',
        reftri: '',
        refech: '',
        ficatt: 'IDF : Urssaf Ile De France',
        ficsta: 'D',
        maxpag: 5,
        codprd: 'PDS2A',
        repexp: 1,
        typsig: ' ',
        codcli: 'CIP',
        codrnd: '',
        ficinf: '000',
        dappcr: '2025-10-21T04:56:00',
        dfichd: '2025-10-21T06:24:14',
        dficht: null,
        dfichs: null,
        codsit: 'CIRSO',
        eclate: false,
      },
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['searchOccAppByFic']);
    TestBed.configureTestingModule({
      declarations: [GeneralitesFichierComponent],
      providers: [{ provide: ApiAdelaideOccurenceApplicationService, useValue: mockApiService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralitesFichierComponent);
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
    mockApiService.searchOccAppByFic.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should loadApiService in ngInit', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockApiService.searchOccAppByFic).toHaveBeenCalledWith(component.params);
    expect(component.detail).toBeDefined();
  });

  it('should failed in ngInit', () => {
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiService.searchOccAppByFic.and.returnValue(throwError(error));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBeDefined;
  });
});
