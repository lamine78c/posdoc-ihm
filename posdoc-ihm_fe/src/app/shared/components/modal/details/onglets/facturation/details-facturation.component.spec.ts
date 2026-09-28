import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { ApiFacturationsService } from '@app/services/api-adelaide/supervision/production/details/api-facturations.service';
import { of } from 'rxjs';

import { DetailsFacturationComponent } from './details-facturation.component';

describe('FacturationComponent', () => {
  let component: DetailsFacturationComponent;
  let fixture: ComponentFixture<DetailsFacturationComponent>;
  let apiFacturationsServiceSpy: jasmine.SpyObj<ApiFacturationsService>;
  let apiAdelaideOccurenceApplicationServiceSpy: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;

  beforeEach(async () => {
    // Créer un mock du service
    apiFacturationsServiceSpy = jasmine.createSpyObj('ApiFacturationsService', ['getDetailsFacturation']);
    apiAdelaideOccurenceApplicationServiceSpy = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['getAllTarifs']);

    await TestBed.configureTestingModule({
      declarations: [DetailsFacturationComponent],
      providers: [
        // Fournir le mock du service
        {
          provide: ApiFacturationsService,
          useValue: apiFacturationsServiceSpy,
        },
        {
          provide: ApiAdelaideOccurenceApplicationService,
          useValue: apiAdelaideOccurenceApplicationServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsFacturationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate resultats on successful API call', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getDetailsFacturation: any[] } } = {
      data: {
        getDetailsFacturation: [
          {
            codcom: 'CODE COMMANDE',
            codfic: 'CODE FICHIER',
            numcom: 'NUMERO COMMANDE',
            codprd: 'CODE PROD',
            codcli: 'CODE CLIENT',
            typtar: 'TYPE',
            nbplis: 'NOMBRE PLIS',
            coutot: 'COUT TOTAL',
            dfiexp: 'DATE',
            codenv: 'CODE ENVIRONNEMENT',
            codorg: 'CODE ORGANISME',
            codapp: 'CODE APPLICATION',
            percod: 'PERIODE',
          },
        ],
      },
    };
    apiFacturationsServiceSpy.getDetailsFacturation.and.returnValue(of(mockResponse as any));
    component.paramData = {
      codEnv: 'T',
      codOrg: 'OOL',
      codApp: 'MAS',
      perCod: '230323-00',
    };
    component.paramFacturation = {
      bMasApp: false,
      allTarpos: [],
    };
    // Appeler la méthode
    component.getOccurenceApplicationDetailsFacturation();
    // Vérifier que le résultat contient des données
    expect(component.resultats.length).toBeGreaterThan(0);
  });
});
