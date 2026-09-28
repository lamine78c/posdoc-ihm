import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { CommandeDetailsComponent } from './commande-details.component';
import { ApiAdelaideCommandeService } from "@app/services/api-adelaide-commande.service";

describe('CommandeDetailsComponent', () => {
  let component: CommandeDetailsComponent;
  let fixture: ComponentFixture<CommandeDetailsComponent>;
  let apiAdelaideCommandeService: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let activeModal: jasmine.SpyObj<NgbActiveModal>;

  const mockCommandesData = {
    data: {
      getCodLibCommandeByEnvOrgApp: [
        { code: 'AD04', libelle: 'EXTRACTION DE TOUS LES COMPTES' },
        { code: 'AD05', libelle: 'EXTRACTION DES COMPTES ACTIFS' },
        { code: 'AD06', libelle: 'GENERATION RAPPORT MENSUEL' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(async () => {
    const apiAdelaideCommandeServiceSpy = jasmine.createSpyObj('ApiAdelaideCommandeService', ['getCodLibCommandeByEnvOrgApp']);
    const activeModalSpy = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      declarations: [CommandeDetailsComponent],
      providers: [
        { provide: ApiAdelaideCommandeService, useValue: apiAdelaideCommandeServiceSpy },
        { provide: NgbActiveModal, useValue: activeModalSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeDetailsComponent);
    component = fixture.componentInstance;
    apiAdelaideCommandeService = TestBed.inject(ApiAdelaideCommandeService) as jasmine.SpyObj<ApiAdelaideCommandeService>;
    activeModal = TestBed.inject(NgbActiveModal) as jasmine.SpyObj<NgbActiveModal>;

    component.codenv = 'P';
    component.codorg = '117';
    component.codapp = 'SVN2';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct input values', () => {
    expect(component.codenv).toBe('P');
    expect(component.codorg).toBe('117');
    expect(component.codapp).toBe('SVN2');
  });

  it('should set modalTitle with correct format on ngOnInit', () => {
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(of(mockCommandesData));

    component.ngOnInit();

    expect(component.modalTitle).toBe('Détails des commandes de l\'application P-117-SVN2');
  });

  it('should call loadCommandeDetails on ngOnInit', () => {
    spyOn(component, 'loadCommandeDetails');

    component.ngOnInit();

    expect(component.loadCommandeDetails).toHaveBeenCalled();
  });

  it('should load commande details with correct filters', () => {
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(of(mockCommandesData));

    component.loadCommandeDetails();

    expect(apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp).toHaveBeenCalledWith({
      codenv: 'P',
      codorg: '117',
      codapp: 'SVN2'
    });
  });

  it('should map commandes data correctly to rowData', () => {
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(of(mockCommandesData));

    component.loadCommandeDetails();

    expect(component.rowData.length).toBe(3);
    expect(component.rowData[0]).toEqual({ codcom: 'AD04', libcom: 'EXTRACTION DE TOUS LES COMPTES' });
    expect(component.rowData[1]).toEqual({ codcom: 'AD05', libcom: 'EXTRACTION DES COMPTES ACTIFS' });
    expect(component.rowData[2]).toEqual({ codcom: 'AD06', libcom: 'GENERATION RAPPORT MENSUEL' });
  });

  it('should update totalArticles with correct count', () => {
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(of(mockCommandesData));

    component.loadCommandeDetails();

    expect(component.totalArticles).toBe(3);
  });

  it('should handle empty commandes list', () => {
    const emptyData = {
      data: {
        getCodLibCommandeByEnvOrgApp: []
      },
      loading: false,
      networkStatus: 7
    };
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(of(emptyData));

    component.loadCommandeDetails();

    expect(component.rowData.length).toBe(0);
    expect(component.totalArticles).toBe(0);
  });

  it('should handle error when loading commande details', () => {
    const error = new Error('API Error');
    spyOn(console, 'error');
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(throwError(() => error));

    component.loadCommandeDetails();

    expect(console.error).toHaveBeenCalledWith('Erreur lors du chargement des commandes:', error);
    expect(component.rowData).toEqual([]);
    expect(component.totalArticles).toBe(0);
  });

  it('should reset rowData and totalArticles to empty values on error', () => {
    component.rowData = [{ codcom: 'TEST', libcom: 'Test' }];
    component.totalArticles = 1;

    const error = new Error('Network Error');
    spyOn(console, 'error');
    apiAdelaideCommandeService.getCodLibCommandeByEnvOrgApp.and.returnValue(throwError(() => error));

    component.loadCommandeDetails();

    expect(component.rowData).toEqual([]);
    expect(component.totalArticles).toBe(0);
  });

  it('should have activeModal available for closing', () => {
    expect(component.activeModal).toBeDefined();
    expect(component.activeModal).toBe(activeModal);
  });
});
