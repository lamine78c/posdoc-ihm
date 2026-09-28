import { of } from 'rxjs';
import { GeneralitesInterface } from '@app/models/supervision/production/details/generalites-interface';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { GeneralitesComponent } from '../index';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiGeneralitesService } from '@app/services/api-adelaide/supervision/production/details/api-generalites.service';

describe('GeneralitesComponent', () => {
  let component: GeneralitesComponent;
  let fixture: ComponentFixture<GeneralitesComponent>;
  let apiGeneralitesService: jasmine.SpyObj<ApiGeneralitesService>;

  beforeEach(async () => {
    // Créer un mock du service ApiGeneralitesService
    apiGeneralitesService = jasmine.createSpyObj('ApiGeneralitesService', ['getDetailsGeneralites']);

    await TestBed.configureTestingModule({
      declarations: [GeneralitesComponent],
      providers: [
        // Fournir le mock du service ApiGeneralitesService
        { provide: ApiGeneralitesService, useValue: apiGeneralitesService },
      ],
    }).compileComponents();

    // Créer une instance du composant et l'initialiser
    fixture = TestBed.createComponent(GeneralitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Vérifier que le composant est créé avec succès
    expect(component).toBeTruthy();
  });

  it('should handle empty API response gracefully', () => {
    // Mock de la réponse de l'API avec des données vides
    const mockResponse: { data: { getDetailsGeneralites: GeneralitesInterface[] } } = {
      data: { getDetailsGeneralites: [] },
    };

    // Configurer le mock pour retourner la réponse vide
    apiGeneralitesService.getDetailsGeneralites.and.returnValue(of(mockResponse as any));

    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = { codEnv: 'D', codOrg: '315', codApp: 'SNV2', perCod: '230816-0G' };

    // Appeler la méthode après avoir défini la propriété paramData
    component.getOccurenceApplicationDetails();

    // Vérifier que occurenceData est vide
    expect(component.occurenceData.length).toBe(0);
  });

  it('should populate occurenceData on successful API call', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getDetailsGeneralites: GeneralitesInterface[] } } = {
      data: {
        getDetailsGeneralites: [
          {
            libelle: 'APPLICATION DE MASSIFICATION',
            arefec: 'Oui',
            typref: 'I',
            appsta: 'Active',
            appinf: 'Info',
            dapplc: '2023-01-01T00:00:00',
            dappld: '2023-01-01T00:00:00',
            dapplt: '2023-01-01T00:00:00',
            dappls: '2023-01-01T00:00:00',
            dapplh: '2023-01-01T00:00:00',
          },
        ],
      },
    };

    // Configurer le mock pour retourner la réponse valide
    apiGeneralitesService.getDetailsGeneralites.and.returnValue(of(mockResponse as any));

    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = { codEnv: 'D', codOrg: '315', codApp: 'SNV2', perCod: '230816-0G' };

    // Appeler la méthode pour obtenir les détails de l'application
    component.getOccurenceApplicationDetails();

    // Vérifier que occurenceData contient des données
    expect(component.occurenceData.length).toBeGreaterThan(0);
  });

  it('should format dates correctly in occurenceData', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getDetailsGeneralites: GeneralitesInterface[] } } = {
      data: {
        getDetailsGeneralites: [
          {
            libelle: 'APPLICATION DE MASSIFICATION',
            arefec: 'Oui',
            typref: 'I',
            appsta: 'Active',
            appinf: 'Info',
            dapplc: '2023-01-01T00:00:00',
            dappld: '2023-01-01T00:00:00',
            dapplt: '2023-01-01T00:00:00',
            dappls: '2023-01-01T00:00:00',
            dapplh: '2023-01-01T00:00:00',
          },
        ],
      },
    };

    // Configurer le mock pour retourner la réponse valide
    apiGeneralitesService.getDetailsGeneralites.and.returnValue(of(mockResponse as any));

    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = { codEnv: 'D', codOrg: '315', codApp: 'SNV2', perCod: '230816-0G' };

    // Espionner la méthode formatDateToDDMMYYYYHHMMSS de SharedUtil
    spyOn(SharedUtil, 'formatDateToDDMMYYYYHHMMSS').and.callThrough();

    // Appeler la méthode pour obtenir les détails de l'application
    component.getOccurenceApplicationDetails();

    // Vérifier que la méthode de formatage des dates a été appelée
    expect(SharedUtil.formatDateToDDMMYYYYHHMMSS).toHaveBeenCalled();
  });
});
