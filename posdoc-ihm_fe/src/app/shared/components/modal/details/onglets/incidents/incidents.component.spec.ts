import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiIncidentsService } from '@app/services/api-adelaide/supervision/production/details/api-incidents.service';
import { of } from 'rxjs';
import { IncidentsComponent } from './incidents.component';

describe('IncidentsComponent', () => {
  let component: IncidentsComponent;
  let fixture: ComponentFixture<IncidentsComponent>;
  let apiIncidentsService: jasmine.SpyObj<ApiIncidentsService>;

  beforeEach(async () => {
    // Créer un mock du service
    apiIncidentsService = jasmine.createSpyObj('ApiIncidentsService', ['getDetailsIncident']);
    await TestBed.configureTestingModule({
      declarations: [IncidentsComponent],
      providers: [
        // Fournir le mock du service
        { provide: ApiIncidentsService, useValue: apiIncidentsService },
      ],
    }).compileComponents();

    // Créer une instance du composant et l'initialiser
    fixture = TestBed.createComponent(IncidentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Vérifier que le composant est créé avec succès
    expect(component).toBeTruthy();
  });

  it('should populate resultats on successful API call', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getDetailsIncident: any[] } } = {
      data: {
        getDetailsIncident: [
          {
            signal: 'SIGNAL',
            dcreat: '2023-01-01T00:00:00',
            script: 'SCRIPT',
            mesano: 'MESSAGE EXPLICATIF',
            ficinf: 'LOG',
            typetp: 'ETAPE',
            codcom: 'CODE COMMANDE',
            codfic: 'CODE FICHIER',
            numcom: 'NUMERO COMMANDE',
            codgam: 'CODE GAMME',
            codsit: 'CODE SITE',
            codres: 'CODE RESSOURCE',
          },
        ],
      },
    };
    // Configurer le mock pour retourner la réponse valide
    apiIncidentsService.getDetailsIncident.and.returnValue(of(mockResponse as any));
    // Définir la propriété
    component.paramIncidentApiModel = {
      codEnv: 'T',
      codOrg: 'OOL',
      codApp: 'MAS',
      perCod: '230323-00',
    };
    // Appeler la méthode
    component.getOccurenceApplicationDetailsIncidents();
    // Vérifier que le résultat contient des données
    expect(component.resultats.length).toBeGreaterThan(0);
  });
});
