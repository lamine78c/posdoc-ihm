import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiMassificationsService } from '@app/services/api-adelaide/supervision/production/details/api-massifications.service';
import { of } from 'rxjs';
import { DetailsMassificationComponent } from './details-massification.component';

describe('MassificationComponent', () => {
  let component: DetailsMassificationComponent;
  let fixture: ComponentFixture<DetailsMassificationComponent>;
  let apiMassificationsService: jasmine.SpyObj<ApiMassificationsService>;

  beforeEach(async () => {
    // Créer un mock du service
    apiMassificationsService = jasmine.createSpyObj('ApiMassificationsService', ['getDetailsMassification']);

    await TestBed.configureTestingModule({
      declarations: [DetailsMassificationComponent],
      providers: [
        {
          // Fournir le mock du service
          provide: ApiMassificationsService,
          useValue: apiMassificationsService,
        },
      ],
    }).compileComponents();

    // Créer une instance du composant et l'initialiser
    fixture = TestBed.createComponent(DetailsMassificationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate resultats on successful API call', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getDetailsMassification: any[] } } = {
      data: {
        getDetailsMassification: [
          {
            masper: 'MAS PERIODE',
            mascom: 'MAS COMMANDE',
            masfic: 'MAS FICHIER',
            masnum: 'MAS NUMERO',
            codorg: 'CODE ORGANISME',
            codapp: 'CODE APPLICATION',
            percod: 'PERIODE',
            codcom: 'CODE COMMANDE',
            codfic: 'CODE FICHIER',
            numcom: 'NUMERO COMMANDE',
            libFichier: 'LIBELLE FICHIER',
            refImprime: 'REFERENCE IMPRIME',
            codprd: 'CODE PROD',
            masuti: 'MAS UTI',
            pagFic: 'NOMBRE PAGES',
            pliFic: 'NOMBRE PLIS',
            codcli: 'CODE CLIENT',
            masenv: 'CODE ENVIRONNEMENT',
          },
        ],
      },
    };
    // Configurer le mock pour retourner la réponse valide
    apiMassificationsService.getDetailsMassification.and.returnValue(of(mockResponse as any));
    // Définir la propriété
    component.paramMassificationApiModel = {
      codEnv: 'T',
      codOrg: 'OOL',
      codApp: 'MAS',
      perCod: '230323-00',
      masGam: 'MA',
    };
    component.paramMassification = {
      masApp: 'MAS',
      masGam: 'MA',
      masUti: 'DATE ACHEMINEMENT',
      bMasApp: true,
    };
    // Appeler la méthode
    if (component.paramMassification.bMasApp) {
      component.getOccurenceApplicationDetailsMassifications();
    }
    // Vérifier que le résultat contient des données
    expect(component.rowData.length).toBeGreaterThan(0);
  });
});
