import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProduitsFichierComponent } from './produits-fichier.component';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { of, throwError } from 'rxjs';

describe('ProduitsFichierComponent', () => {
  let component: ProduitsFichierComponent;
  let fixture: ComponentFixture<ProduitsFichierComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;

  const mockResponse = {
    data: {
      searchProduitsByFichier: [
        {
          codgam: 'MB',
          libgam: 'Nouvelle charte graphique',
          prosta: 'T',
          proinf: '000',
          dprodd: '2025-10-29T23:37:14',
          dprodt: '2025-10-29T23:37:21',
          dprods: null,
          pagfic: 271,
          plific: 0,
          rejfic: 0,
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['searchProduitsByFichier']);
    TestBed.configureTestingModule({
      declarations: [ProduitsFichierComponent],
      providers: [{ provide: ApiAdelaideOccurenceApplicationService, useValue: mockApiService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduitsFichierComponent);
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
    mockApiService.searchProduitsByFichier.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should loadApiService in ngInit', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockApiService.searchProduitsByFichier).toHaveBeenCalledWith(component.params);
    expect(component.details).toBeDefined();
  });

  it('should failed in ngInit', () => {
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiService.searchProduitsByFichier.and.returnValue(throwError(error));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBeDefined;
  });
});
