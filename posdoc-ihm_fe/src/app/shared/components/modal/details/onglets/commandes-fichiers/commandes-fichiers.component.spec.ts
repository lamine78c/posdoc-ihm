import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandesFichiersComponent } from './commandes-fichiers.component';
import { ApiCommandesFichiersService } from '@app/services/api-adelaide/supervision/production/details/api-commandes-fichiers.service';
import { of } from 'rxjs';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';

describe('CommandesFichiersComponent', () => {
  let component: CommandesFichiersComponent;
  let fixture: ComponentFixture<CommandesFichiersComponent>;
  let apiCommandesFichiersServiceSpy: jasmine.SpyObj<ApiCommandesFichiersService>;

  beforeEach(async () => {
    // Créer un mock du service ApiCommandesFichiersService
    const apiSpy = jasmine.createSpyObj('ApiCommandesFichiersService', ['getDetailsCommandesFichiers']);

    await TestBed.configureTestingModule({
      declarations: [CommandesFichiersComponent],
      providers: [
        // Fournir le mock du service ApiCommandesFichiersService
        { provide: ApiCommandesFichiersService, useValue: apiSpy },
      ],
    }).compileComponents();

    // Créer une instance du composant et l'initialiser
    fixture = TestBed.createComponent(CommandesFichiersComponent);
    component = fixture.componentInstance;
    apiCommandesFichiersServiceSpy = TestBed.inject(ApiCommandesFichiersService) as jasmine.SpyObj<ApiCommandesFichiersService>;
  });

  it('should create', () => {
    // Vérifier que le composant est créé avec succès
    expect(component).toBeTruthy();
  });

  it('should retrieve details commandes fichiers and update the component state', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse = {
      data: {
        getDetailsCommandesFichiers: [
          {
            codcom: 'C001',
            numcom: 'N001',
            codfic: 'F001',
            libelle: 'Libelle1',
            codprd: 'P001',
            refimp: 'R001',
            libfic: 'Libfic1',
            ficsta: 'S001',
            ficinf: 'I001',
            dappcr: '2023-10-01T10:00:00',
            dfichd: '2023-10-02T10:00:00',
            dficht: '2023-10-03T10:00:00',
            dfichs: '2023-10-04T10:00:00',
            frefec: '1',
            ficvid: '1',
          },
          {
            codcom: 'C002',
            numcom: 'N002',
            codfic: 'F002',
            libelle: 'Libelle2',
            codprd: 'P002',
            refimp: 'R002',
            libfic: 'Libfic2',
            ficsta: 'S002',
            ficinf: 'I002',
            dappcr: '2023-11-01T10:00:00',
            dfichd: '2023-11-02T10:00:00',
            dficht: '2023-11-03T10:00:00',
            dfichs: '2023-11-04T10:00:00',
            frefec: '2',
            ficvid: '2',
          },
        ],
      },
    };

    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = {} as OngletsParamDataModel; // Mock des données d'entrée si nécessaire
    apiCommandesFichiersServiceSpy.getDetailsCommandesFichiers.and.returnValue(of(mockResponse as any));

    // Appeler la méthode pour obtenir les détails des commandes fichiers
    component.getDetailsCommandesFichiers();

    // Vérifier que le service a été appelé avec les bonnes données
    expect(apiCommandesFichiersServiceSpy.getDetailsCommandesFichiers).toHaveBeenCalledWith(component.paramData);
    // Vérifier que les détails des commandes fichiers sont mis à jour dans le composant
    expect(component.detailCommandesFichiers).toEqual((mockResponse as any).data.getDetailsCommandesFichiers);
    // Vérifier que le total des commandes fichiers est correct
    expect(component.totalCmdFic).toBe(2);
  });

  it('should handle empty response from API', () => {
    // Mock de la réponse de l'API avec des données vides
    const mockResponse = {
      data: {
        getDetailsCommandesFichiers: [],
      },
    };

    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = {} as OngletsParamDataModel;
    apiCommandesFichiersServiceSpy.getDetailsCommandesFichiers.and.returnValue(of(mockResponse as any));

    // Appeler la méthode pour obtenir les détails des commandes fichiers
    component.getDetailsCommandesFichiers();

    // Vérifier que le service a été appelé avec les bonnes données
    expect(apiCommandesFichiersServiceSpy.getDetailsCommandesFichiers).toHaveBeenCalledWith(component.paramData);
    // Vérifier que le total des commandes fichiers est 0 pour une réponse vide
    expect(component.totalCmdFic).toBe(0);
  });
});
