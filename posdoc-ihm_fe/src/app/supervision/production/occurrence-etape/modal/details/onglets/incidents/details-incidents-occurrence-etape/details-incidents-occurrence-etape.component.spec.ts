import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidentsOccEtapeInterface } from '@app/models/supervision/production/details/incidents-interface';
import { ApiIncidentsService } from '@app/services/api-adelaide/supervision/production/details/api-incidents.service';
import { of } from 'rxjs';

import { DetailsIncidentsOccurrenceEtapeComponent } from './details-incidents-occurrence-etape.component';

describe('DetailsIncidentsOccurrenceEtapeComponent', () => {
  let component: DetailsIncidentsOccurrenceEtapeComponent;
  let fixture: ComponentFixture<DetailsIncidentsOccurrenceEtapeComponent>;
  let apiIncidentsService: jasmine.SpyObj<ApiIncidentsService>;

  beforeEach(async () => {
    // Créer un mock du service
    apiIncidentsService = jasmine.createSpyObj('ApiIncidentsService', ['getIncidentsByIdetap']);

    await TestBed.configureTestingModule({
      declarations: [DetailsIncidentsOccurrenceEtapeComponent],
      providers: [
        // Fournir le mock du service ApiGeneralitesService
        { provide: ApiIncidentsService, useValue: apiIncidentsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsIncidentsOccurrenceEtapeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get incidents', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getIncidentsByIdetap: IncidentsOccEtapeInterface[] } } = {
      data: {
        getIncidentsByIdetap: [
          {
            dcreat: 'date',
            mesano: 'message',
            script: 'script',
          },
        ],
      },
    };

    // Configurer le mock pour retourner la réponse valide
    apiIncidentsService.getIncidentsByIdetap.and.returnValue(of(mockResponse as any));

    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = {
      clefus: null,
      codapp: 'MAS',
      codcom: 'MAS0',
      coddes: null,
      codenv: 'T',
      codfic: 'M0001',
      codgam: 'MM',
      codinf: 1,
      codorg: '00L',
      codres: null,
      codser: null,
      codsig: 'S05',
      codsit: null,
      create: '2024-10-29T15:19:00',
      debute: null,
      etat: 'FAB',
      etpfus: 'FAB',
      fabsim: true,
      idetap: 3251,
      idtfus: 0,
      invali: null,
      nbrexe: 0,
      numcom: '00',
      numexe: null,
      numpid: 0,
      percod: '241023-00',
      position: { x: 670, y: 326 },
      reedit: false,
      script: null,
      signal: 't_00l_mas_241023-00_00_mas0_m0001_*',
      statut: 'T',
      stepno: 0,
      suspen: null,
      termin: '2024-11-18T11:31:59',
      valide: '2024-10-29T15:19:00',
    };

    // Appeler la méthode pour obtenir les détails
    component.getDetails();

    // Vérifier que occurenceData contient des données
    expect(component.occurenceData.length).toBeGreaterThan(0);
  });
});
