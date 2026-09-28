import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncApiParametresEdition } from '@app/models/asyncApiParametresEdition';
import { ExemplaireByResource } from '@app/models/exemplaire-by-resource';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ParametreEditionColonneComponent } from './parametre-edition-colonne.component';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';

describe('ParametreEditionColonneComponent', () => {
  let component: ParametreEditionColonneComponent;
  let fixture: ComponentFixture<ParametreEditionColonneComponent>;
  let apolloSpy: jasmine.SpyObj<Apollo>;
  let apiDistributionServiceSpy: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let apiParametreServiceSpy: jasmine.SpyObj<ApiAdelaideParametreService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let noteServiceSpy: jasmine.SpyObj<NotesService>;

  beforeEach(async () => {
    apolloSpy = jasmine.createSpyObj('Apollo', ['watchQuery', 'mutate']);
    apiDistributionServiceSpy = jasmine.createSpyObj('ApiAdelaideDistributionService', [
      'getExemplairesByRessource',
      'deleteExemplaires',
      'getAsyncAPIsForParametreEdition',
    ]);
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasProfileAdmin']);
    apiParametreServiceSpy = jasmine.createSpyObj('ApiAdelaideParametreService', ['getCodeOrgOGUR']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    noteServiceSpy = jasmine.createSpyObj('NotesService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [ParametreEditionColonneComponent],
      providers: [
        { provide: Apollo, useValue: apolloSpy },
        { provide: ApiAdelaideDistributionService, useValue: apiDistributionServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: ApiAdelaideParametreService, useValue: apiParametreServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: NotesService, useValue: noteServiceSpy },
      ],
    }).compileComponents();

    const mockExemplairesByResourceResponse = {
      data: {
        getExemplairesByRessource: [
          {
            codorg: '117',
            codcom: 'AD04',
            codfic: 'L00',
            message: 'Message',
            ressources: [
              { codres: 'GED-SAE', codsit: 'CIRSO', etat: true, coddes: 'DESTI' },
              { codres: 'PAPYRUS', codsit: 'CIRTIL', etat: false, coddes: null },
            ],
          },
        ],
        allOrganismes: [
          {
            code: '117',
            codeRegion: '117',
          },
          {
            code: '771',
            codeRegion: '117',
          },
        ],
      },
    };
    apiDistributionServiceSpy.getExemplairesByRessource.and.returnValue(of(mockExemplairesByResourceResponse as any));

    const mockAsyncAPIParametreEditionResponse = {
      data: {
        allOrganismes: [{ code: '117', libelle: 'Test Organisme', codRegion: '117' }],
        allRessources: [
          {
            codeRessource: 'PAPYRUS',
            libelle: 'Papyrus',
            codeEnvironnement: 'P',
            codeApplication: 'SNV2',
            codeOrganisme: '117',
            codeGamme: 'DM',
            codeSite: 'CIRTIL',
            profil: 'Admin',
          },
        ],
        allDestinataires: [{ code: 'DESTI', libelle: 'Destinataire', codeOrg: '117' }],
        allSitesCNP: [{ code: 'CIRTIL' }],
      },
    };
    apiDistributionServiceSpy.getAsyncAPIsForParametreEdition.and.returnValue(
      of(mockAsyncAPIParametreEditionResponse as unknown as ApolloQueryResult<AsyncApiParametresEdition>)
    );

    const mockGetCodeOrgOGURResponse = {
      data: {
        getCodeOrgOGUR: '999',
      },
    };
    apiParametreServiceSpy.getCodeOrgOGUR.and.returnValue(of(mockGetCodeOrgOGURResponse as any));

    const mockDeleteExemplairesResponse = {
      data: { deleteExemplaires: { ok: true } },
      loading: false,
      networkStatus: 7,
    };
    apiDistributionServiceSpy.deleteExemplaires.and.returnValue(of(mockDeleteExemplairesResponse));

    fixture = TestBed.createComponent(ParametreEditionColonneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getDestinataireData', () => {
    it('should set destinataire data on success', () => {
      component.getDestinataireData();
      expect(apiDistributionServiceSpy.getAsyncAPIsForParametreEdition).toHaveBeenCalled();
      expect(component.destinatairesData$.getValue()[0]?.value).toEqual('DESTI');
    });
  });

  describe('initRowData', () => {
    it('should init row data on success', () => {
      component.initRowData();
      component.requestParams$.next({
        environnement: 'P',
        organisme: ['117'],
        application: 'SNV2',
        commande: 'AD04',
        fichier: ['L00'],
        ressources: ['DM/CIRSO/GED-SAE'],
        ressourcesAbsentes: true,
        message: null,
      });
      component.rowData$.pipe(filter(data => data.length > 0)).subscribe((data: ExemplaireByResource[]) => {
        expect(data.length).toEqual(1);
        expect(data[0].ressources.length).toEqual(2);
        expect(component.columnDefs.length).toEqual(10);
      });
    });
  });

  it('should set gridApi', () => {
    const mockParams = {
      api: jasmine.createSpyObj('GridApi', ['setGridOption']),
    };
    spyOn(component, 'getDestinataireData');
    component.onGridReady(mockParams as any);

    expect(component.gridApi).toBe(mockParams.api);
    expect(component.gridColumnApi).toBe(mockParams.api);
    expect(component.gridApi.setGridOption).toHaveBeenCalled();
    expect(component.getDestinataireData).toHaveBeenCalled();
  });

  it('isDeleteButtonActive validity', () => {
    component.checkboxStates = { ['a']: false };
    const result = component.isDeleteButtonActive();
    expect(result).toBeFalsy;
  });

  it('listExemplairesByResource validity', () => {
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    component.listExemplairesByResource({
      environnement: 'p',
      organisme: ['117'],
      application: 'app',
      commande: 'com',
      fichier: ['fic'],
      ressources: ['ress'],
      ressourcesAbsentes: false,
      message: 'mess',
    });
    component.requestParams$.subscribe(e =>
      expect(e).toEqual({
        environnement: 'p',
        organisme: ['117'],
        application: 'app',
        commande: 'com',
        fichier: ['fic'],
        ressources: ['ress'],
        ressourcesAbsentes: false,
        message: 'mess',
      })
    );
  });

  it('getCheckboxKey validity', () => {
    const result = component.getCheckboxKey('rowid', 'ccolid');
    expect(result).toEqual('rowid_ccolid');
  });

  it('toggleColumnCheckboxes validity', () => {
    component.gridApi = jasmine.createSpyObj('GridApi', ['forEachNode', 'refreshCells']);
    component.toggleColumnCheckboxes('1', false);
  });

  it('deleteSelectedExemplaires validity', () => {
    component.gridApi = jasmine.createSpyObj('GridApi', ['getRowNode']);
    component.checkboxStates = {
      ['a|sit|res|gam']: true,
    };
    component.rowData['a'] = {
      codenv: 'p',
      codorg: '117',
      codapp: 'app',
      codcom: 'com',
      codfic: 'fic',
    };

    const mockModalRef = {
      dismissed: of(NUM_FIRST_BTN_MODAL),
      componentInstance: {
        rowDataArray: [],
      },
    };
    modalServiceSpy.open.and.returnValue(mockModalRef as any);
    (component.gridApi.getRowNode as jasmine.Spy).and.returnValue({
      data: {
        codenv: 'p',
        codorg: '117',
        codapp: 'app',
        codcom: 'com',
        codfic: 'fic',
      },
    });

    component.deleteSelectedExemplaires();
    expect(modalServiceSpy.open).toHaveBeenCalled();
    expect(mockModalRef.componentInstance.rowDataArray).toEqual(['p - 117 - app - com - fic - gam/sit/res']);
    expect(apiDistributionServiceSpy.deleteExemplaires).toHaveBeenCalledWith([
      {
        codenv: 'p',
        codorg: '117',
        codapp: 'app',
        codcom: 'com',
        codfic: 'fic',
        codgam: 'gam',
        numexe: null,
        codres: 'res',
        codsit: 'sit',
      },
    ]);
    expect(component.checkboxStates).toEqual({});
    expect(noteServiceSpy.show).toHaveBeenCalled();
  });
});
