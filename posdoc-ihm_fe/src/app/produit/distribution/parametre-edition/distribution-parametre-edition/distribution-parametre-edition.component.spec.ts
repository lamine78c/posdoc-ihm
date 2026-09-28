import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { DataService } from '@app/shared/utils/data.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridApi, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ModalAjoutCompletComponent } from '../popup/modal-ajout-complet/modal-ajout-complet.component';
import { ModalComponentComponent } from '../popup/modal-component/modal-component.component';
import { ModalUpdateComponent } from '../popup/modal-update/modal-update.component';
import { TableauParametreEditionService } from '../service/tableau-parametre-edition.service';
import { DistributionParametreEditionComponent } from './distribution-parametre-edition.component';
import { EventEmitter } from '@angular/core';
import { RessourceDataInterface } from '@app/models/gestion-fichier-edition/parametre-edition/params-env-orgs-app-interface';

describe('DistributionParametreEditionComponent', () => {
  let component: DistributionParametreEditionComponent;
  let fixture: ComponentFixture<DistributionParametreEditionComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauParametreEditionService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let mockDataService: jasmine.SpyObj<DataService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let fb: FormBuilder;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  const mockColumnDefs = [
    {
      headerName: 'Org.',
      field: 'codorg',
      floatingFilterComponentParams: { selectData: null },
    },
    {
      headerName: 'Site',
      field: 'codsit',
      cellRendererParams: { selectData: null },
    },
    {
      headerName: 'Ressource',
      field: 'codres',
      cellRendererParams: { selectData: null },
    },
    {
      headerName: 'Destinataire',
      field: 'coddes',
      cellRendererParams: { selectData: null },
    },
  ];
  const mockResponseAllOrgsData = [
    {
      code: '117',
      libelle: '117',
      codeRegion: '117',
    },
    {
      code: '116',
      libelle: '117',
      codeRegion: '116',
    },
  ];
  const mockResponseAllRessourceData = [
    {
      codeRessource: 'cc',
      libelle: 'cc',
      codeEnvironnement: 'P',
      codeApplication: 'SNV2',
      codeOrganisme: '117',
      codeGamme: 'PM',
      codeSite: 'CIRSO',
      profil: 'ADMIN',
    },
  ];
  const mockResponseAsyncAPIsForParametreEdition = {
    data: {
      allOrganismes: mockResponseAllOrgsData,
      allRessources: mockResponseAllRessourceData,
      allDestinataires: [
        {
          code: 'testA',
          codeOrg: '117',
          libelle: 'test',
        },
        {
          code: 'testB',
          codeOrg: '117',
          libelle: 'test',
        },
      ],
      allSitesCNP: [
        { code: '117' },
        { code: '116' },
        { code: '107' },
        { code: '122' },
        { code: '111' },
        { code: '112' },
        { code: '113' },
        { code: '114' },
      ],
      getCodeOrgOGUR: '999',
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponsePre = {
    data: {
      getPreselectedExemplaire: [
        {
          codorg: '117',
        },
        {
          codorg: '116',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponsePreVide = {
    data: {
      getPreselectedExemplaire: [],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockTransferData = new BehaviorSubject<any>({
    environnements: ['P'],
    organismes: ['117'],
    application: 'SNV2',
    commande: 'comm1',
    fichier: 'fic1',
  });
  const mockGridOptions: GridOptions = {
    context: {},
    getRowClass: params => (params.data.isDataConsul ? 'row-consultation' : ''),
  };
  const mockOverlayNoRowsTemplate = '';
  const mockResponseDistinctEnvs = {
    data: {
      getDistinctEnvsFromExemplaire: ['P', 'T', 'I'],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseDistinctOrgs = {
    data: {
      getDistOrgByEnvFromExemplaire: ['117'],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseDistinctApps = {
    data: {
      getDistAppByEnvOrgFromExemplaire: ['SNV2'],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseDistinctComs = {
    data: {
      getDistComByEnvOrgAppFromExemplaire: ['comm1'],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseDistinctFics = {
    data: {
      getDistFicByEnvOrgAppComFromExemplaire: [
        {
          codfic: 'fic1',
          refImprime: 'ref',
          codeProd: 'ccc',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };
  const selectedNode1DataForEdit = {
    codapp: '1',
    codcom: '1',
    coddes: '1',
    codenv: '1',
    codfic: '1',
    codgam: '1',
    codorg: '1',
    codres: '1',
    codsit: '1',
    exeact: true,
    nbrexe: null,
    numexe: null,
  };

  const selectedNode2DataForEdit = {
    codapp: '2',
    codcom: '2',
    coddes: '2',
    codenv: '1',
    codfic: '1',
    codgam: '1',
    codorg: '1',
    codres: '1',
    codsit: '1',
    exeact: true,
    nbrexe: null,
    numexe: null,
  };

  const selectedNodesForEdit = [
    {
      data: selectedNode1DataForEdit,
    },
    {
      data: selectedNode2DataForEdit,
    },
  ];

  beforeEach(waitForAsync(() => {
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'createGridConfiguration',
      'getNoDataMessage',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideDistributionService', [
      'getDistinctEnvsFromExemplaire',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'getDistComsByEnvOrgApp',
      'getDistFicsByEnvOrgAppCom',
      'getAsyncAPIsForParametreEdition',
      'getPreselectedData',
      'deleteExemplaires',
      'updateMessageFichierByIdsFichier',
      'updateExemplaires',
      'updateMasseExemplaires',
      'updateMessageFichierByExemplaires',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockTableauService = jasmine.createSpyObj('TableauParametreEditionService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse', 'hasProfileAdmin']);
    mockDataService = jasmine.createSpyObj('DataService', ['getTransferedData', 'setServerData', 'setDataToTransfer']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      declarations: [DistributionParametreEditionComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauParametreEditionService, useValue: mockTableauService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: ApiAdelaideDistributionService, useValue: mockApiAdelaideService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: DataService, useValue: mockDataService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: NgbModal, useValue: mockModalService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions);
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue(mockOverlayNoRowsTemplate);
    mockApiAdelaideService.getPreselectedData.and.returnValue(of(mockResponsePre));
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockPermissionService.hasProfileAdmin.and.returnValue(true);
    mockApiAdelaideService.getAsyncAPIsForParametreEdition.and.returnValue(of(mockResponseAsyncAPIsForParametreEdition));
    mockDataService.getTransferedData.and.returnValue(mockTransferData);

    fixture = TestBed.createComponent(DistributionParametreEditionComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.gridApi = mockGridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('validerPreselection validity', () => {
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    spyOn(SharedUtil, 'extractSelectedOrgs');
    component.organismes = mockResponseAllOrgsData;

    component.validerPreselection();
    fixture.detectChanges();

    expect(component.nombresTotal).toBe(2);

    // should getNoDataMessage when got empty response
    mockApiAdelaideService.getPreselectedData.and.returnValue(of(mockResponsePreVide));
    component.validerPreselection();
    expect(mockTableauConfigurationBuilderService.getNoDataMessage).toHaveBeenCalled();
  });

  it('ngOnDestroy validity', () => {
    component.ngOnDestroy();
    fixture.detectChanges();
    expect(mockDataService.setServerData).toHaveBeenCalledWith(null);
    expect(mockDataService.setDataToTransfer).toHaveBeenCalledWith(null);
  });

  it('ngOnInit validity', () => {
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    spyOn(component, 'validerPreselectionAfterAddNewParamEdit');

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.formPreselection.controls.environnement).toBeTruthy();
    expect(component.formPreselection.controls.organisme).toBeTruthy();
    expect(component.formPreselection.controls.application).toBeTruthy();
    expect(component.formPreselection.controls.commande).toBeTruthy();
    expect(component.formPreselection.controls.fichier).toBeTruthy();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.columnDefs).toEqual(mockColumnDefs);
    expect(component.overlayNoRowsTemplate).toEqual(mockOverlayNoRowsTemplate);

    expect(mockDataService.getTransferedData).toHaveBeenCalled();
    expect(component.validerPreselectionAfterAddNewParamEdit).toHaveBeenCalled();
  });

  it('validerPreselectionAfterAddNewParamEdit validity', () => {
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    spyOn(component, 'validerPreselection');
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    component.formPreselection = fb.group({
      ['environnement']: fb.group({
        P: [true],
        T: [false],
        I: [false],
      }),
      ['organisme']: fb.group({
        '00L-null': fb.group({ '00L': [false] }),
        '117': fb.group({ '117': [true] }),
      }),
      ['application']: ['SNV2'],
      ['commande']: ['comm1'],
      ['fichier']: ['fic1'],
    });
    mockApiAdelaideService.getDistinctEnvsFromExemplaire.and.returnValue(of(mockResponseDistinctEnvs));
    mockApiAdelaideService.getDistinctOrgsByEnvs.and.returnValue(of(mockResponseDistinctOrgs));
    mockApiAdelaideService.getDistAppsByEnvOrg.and.returnValue(of(mockResponseDistinctApps));
    mockApiAdelaideService.getDistComsByEnvOrgApp.and.returnValue(of(mockResponseDistinctComs));
    mockApiAdelaideService.getDistFicsByEnvOrgAppCom.and.returnValue(of(mockResponseDistinctFics));
    const data = {
      environnements: ['P'],
      organismes: ['117'],
      application: 'SNV2',
      commande: 'comm1',
      fichier: 'fic1',
    };

    component.validerPreselectionAfterAddNewParamEdit(data);
    fixture.detectChanges();

    expect(mockApiAdelaideService.getDistinctEnvsFromExemplaire).toHaveBeenCalled();
    expect(mockApiAdelaideService.getDistinctOrgsByEnvs).toHaveBeenCalled();
    expect(mockApiAdelaideService.getDistAppsByEnvOrg).toHaveBeenCalled();
    expect(mockApiAdelaideService.getDistComsByEnvOrgApp).toHaveBeenCalled();
    expect(mockApiAdelaideService.getDistFicsByEnvOrgAppCom).toHaveBeenCalled();
    expect(component.applicationOptions).toEqual(mockResponseDistinctApps.data.getDistAppByEnvOrgFromExemplaire);
    expect(component.commandeOptions).toEqual(mockResponseDistinctComs.data.getDistComByEnvOrgAppFromExemplaire);
    expect(component.fichierOptions.length).toEqual(mockResponseDistinctFics.data.getDistFicByEnvOrgAppComFromExemplaire.length + 1);

    // appel with empty param
    component.validerPreselectionAfterAddNewParamEdit({});
  });

  it('onGridReady validity', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    component.onGridReady(mockParams);
    fixture.detectChanges();

    expect(component.organismes).toEqual(mockResponseAllOrgsData);
    expect(component.ressources).toEqual(mockResponseAllRessourceData);
  });

  it('onDeleteRow validity', () => {
    spyOn(component, 'validerPreselection');

    const event = [
      {
        codapp: 'SNV2',
        codcom: 'TZ43',
        codenv: 'P',
        codorg: '010',
        codfic: '827',
        codgam: 'gm',
        numexe: 1,
      },
    ];
    const mockResponse = {
      data: {
        deleteExemplaires: 'ok',
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deleteExemplaires.and.returnValue(of(mockResponse));

    component.onDeleteRow(event);
    fixture.detectChanges();

    expect(component.validerPreselection).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: "L'exemplaire a été supprimé avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('onDeleteRow fail', () => {
    spyOn(component, 'setError');
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiAdelaideService.deleteExemplaires.and.returnValue(throwError(error));

    component.onDeleteRow([]);
    fixture.detectChanges();

    expect(component.setError).toHaveBeenCalled();
  });

  it('onSaveEdition validity', () => {
    spyOn(component, 'validerPreselection');
    const mockEditedRow = new Map([[0, [0, { codenv: 'P', codorg: '117', codapp: 'app', codcom: 'com', codfic: 'fic', ficatt: '' }]]]);
    const mockResponse = {
      data: {},
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.updateMessageFichierByExemplaires.and.returnValue(of(mockResponse));

    component.onSaveEdition(mockEditedRow);
    fixture.detectChanges();

    expect(component.validerPreselection).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le message a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('onSaveEdition fail', () => {
    spyOn(component, 'setError');
    const mockEditedRow = new Map([[0, [0, { codenv: 'P', codorg: '117', codapp: 'app', codcom: 'com', codfic: 'fic', ficatt: '' }]]]);
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiAdelaideService.updateMessageFichierByExemplaires.and.returnValue(throwError(error));

    component.onSaveEdition(mockEditedRow);
    fixture.detectChanges();

    expect(component.setError).toHaveBeenCalled();
  });

  it('should open CompleterRessourcesPopup', () => {
    component.formPreselection = fb.group({
      ['environnement']: fb.group({
        P: [true],
        T: [false],
        I: [false],
      }),
      ['organisme']: fb.group({
        '00L-null': fb.group({ '00L': [false] }),
        '089': fb.group({ '089': [true] }),
      }),
      ['application']: ['SNV2'],
      ['commande']: ['comm1'],
      ['fichier']: ['fic1'],
    });
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);
    modalRefSpy.componentInstance.passEntry = of({
      createdDTO: [{ codorg: '117' }, { codorg: '116' }],
    });
    mockModalService.open.and.returnValue(modalRefSpy);
    const selectedNodesForComplet = [];
    component.openAddPopup({ mode: 'complete', selectedNodes: selectedNodesForComplet });
    fixture.detectChanges();

    expect(mockModalService.open).toHaveBeenCalledWith(ModalComponentComponent);
    expect(modalRefSpy.componentInstance.selectedNodes).toEqual(selectedNodesForComplet);
    expect(mockDataService.setDataToTransfer).toHaveBeenCalledWith({
      environnements: ['P'],
      organismes: ['089', '117', '116'],
      application: 'SNV2',
      commande: 'comm1',
      fichier: 'fic1',
    });
  });

  it('should open AddEnMassePopup', () => {
    component.formPreselection = fb.group({
      ['environnement']: fb.group({
        P: [true],
        T: [false],
        I: [false],
      }),
      ['organisme']: fb.group({
        '00L-null': fb.group({ '00L': [false] }),
        '089': fb.group({ '089': [true] }),
      }),
      ['application']: ['SNV2'],
      ['commande']: ['comm1'],
      ['fichier']: ['fic1'],
    });
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);
    modalRefSpy.componentInstance.passEntry = of({
      nbrExemplaires: 1,
    });
    mockModalService.open.and.returnValue(modalRefSpy);
    const selectedNodesForAdd = [];
    spyOn(component, 'validerPreselection');
    component.openAddPopup({ mode: 'add', selectedNodes: selectedNodesForAdd });
    fixture.detectChanges();

    expect(mockModalService.open).toHaveBeenCalledWith(ModalAjoutCompletComponent);
    expect(modalRefSpy.componentInstance.selectedValues).toEqual({
      environnement: ['P'],
      organisme: ['089'],
      application: 'SNV2',
      commande: 'comm1',
      fichier: 'fic1',
    });
    expect(component.validerPreselection).toHaveBeenCalled();
  });

  it('should open UpdateRowsPopup and save site', () => {
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance', 'close']);
    modalRefSpy.componentInstance.updateMasseSite = of('sit5');
    modalRefSpy.componentInstance.updateMasse = new EventEmitter<RessourceDataInterface>();
    modalRefSpy.componentInstance.updateMasseEtat = new EventEmitter<boolean>();
    modalRefSpy.componentInstance.updateMasseMessage = new EventEmitter<string>();
    mockModalService.open.and.returnValue(modalRefSpy);
    spyOn(component, 'validerPreselection');
    mockApiAdelaideService.updateExemplaires.and.returnValue(
      of({
        data: {
          updateExemplaires: [],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    component.siteData$.next([
      { value: 'codsit', text: 'libsit' },
      { value: 'codsit2', text: 'libsit2' },
    ]);
    const dataCalledWith = [...new Set([selectedNode1DataForEdit, selectedNode2DataForEdit])].map(e => ({ ...e, codsit: 'sit5' }));
    component.openUpdateRowsPopup({ mode: 'add', selectedNodes: selectedNodesForEdit });
    fixture.detectChanges();

    expect(mockModalService.open).toHaveBeenCalledWith(ModalUpdateComponent);
    expect(modalRefSpy.componentInstance.selectedNodes).toEqual(selectedNodesForEdit);
    expect(modalRefSpy.componentInstance.siteOptions$).toEqual(component.siteData$.asObservable());
    expect(mockApiAdelaideService.updateExemplaires).toHaveBeenCalledWith(dataCalledWith);
    expect(component.validerPreselection).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalled();
  });

  it('should open UpdateRowsPopup and save etat', () => {
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance', 'close']);
    modalRefSpy.componentInstance.updateMasseEtat = of(false);
    modalRefSpy.componentInstance.updateMasse = new EventEmitter<RessourceDataInterface>();
    modalRefSpy.componentInstance.updateMasseMessage = new EventEmitter<string>();
    modalRefSpy.componentInstance.updateMasseSite = new EventEmitter<string>();
    mockModalService.open.and.returnValue(modalRefSpy);
    spyOn(component, 'validerPreselection');
    mockApiAdelaideService.updateExemplaires.and.returnValue(
      of({
        data: {
          updateExemplaires: [],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    component.openUpdateRowsPopup({ mode: 'add', selectedNodes: selectedNodesForEdit });
    const dataCalledWith = [...new Set([selectedNode1DataForEdit, selectedNode2DataForEdit])].map(e => ({ ...e, exeact: false }));
    fixture.detectChanges();
    expect(mockApiAdelaideService.updateExemplaires).toHaveBeenCalledWith(dataCalledWith);
    expect(component.validerPreselection).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalled();
  });

  it('should open UpdateRowsPopup and save message', () => {
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance', 'close']);
    modalRefSpy.componentInstance.updateMasseEtat = new EventEmitter<boolean>();
    modalRefSpy.componentInstance.updateMasse = new EventEmitter<RessourceDataInterface>();
    modalRefSpy.componentInstance.updateMasseMessage = of('message to save');
    modalRefSpy.componentInstance.updateMasseSite = new EventEmitter<string>();
    mockModalService.open.and.returnValue(modalRefSpy);
    spyOn(component, 'validerPreselection');
    mockApiAdelaideService.updateMessageFichierByIdsFichier.and.returnValue(
      of({
        data: {},
        loading: false,
        networkStatus: 7,
      })
    );
    component.openUpdateRowsPopup({ mode: 'add', selectedNodes: selectedNodesForEdit });
    fixture.detectChanges();
    expect(mockApiAdelaideService.updateMessageFichierByIdsFichier).toHaveBeenCalledWith(
      [
        {
          codeEnv: '1',
          codeOrg: '1',
          codeApp: '1',
          codeCom: '1',
          codeFich: '1',
        },
        {
          codeEnv: '1',
          codeOrg: '1',
          codeApp: '2',
          codeCom: '2',
          codeFich: '1',
        },
      ],
      'message to save'
    );
    expect(component.validerPreselection).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalled();
  });

  it('should open UpdateRowsPopup and save ressource', () => {
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance', 'close']);
    modalRefSpy.componentInstance.updateMasseEtat = new EventEmitter<boolean>();
    modalRefSpy.componentInstance.updateMasse = of({
      codgam: 'gm',
      codres: 'res',
      coddes: 'des',
    });
    modalRefSpy.componentInstance.updateMasseMessage = new EventEmitter<string>();
    modalRefSpy.componentInstance.updateMasseSite = new EventEmitter<string>();
    mockModalService.open.and.returnValue(modalRefSpy);
    spyOn(component, 'validerPreselection');
    mockApiAdelaideService.updateMasseExemplaires.and.returnValue(
      of({
        data: {
          updateMasseExemplaires: [],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    component.openUpdateRowsPopup({ mode: 'add', selectedNodes: selectedNodesForEdit });
    fixture.detectChanges();
    expect(mockApiAdelaideService.updateMasseExemplaires).toHaveBeenCalledWith(
      {
        codgam: 'gm',
        codres: 'res',
        coddes: 'des',
      },
      [selectedNode1DataForEdit, selectedNode2DataForEdit]
    );
    expect(component.validerPreselection).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalled();
  });

  it('should export data as EXECL', () => {
    const exportEvent = { type: 'exportAsExcel' };
    const colDefs = [{ headerName: 'code', field: 'code' }];
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { code: 'DM' } } as RowNode;
      callback(mockNode, 0);
    });
    mockGridApi.getColumnDefs.and.returnValue(colDefs);
    component.gridApi = mockGridApi;
    const title = "Liste des paramètres d'édition";

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith([['DM']], ['code'], title, { columnDefs: colDefs });
  });

  it('setError validity', () => {
    const errors = new Map<number, TableAsynchronousError[]>();
    const error: TableAsynchronousError = {
      isError: true,
      message: 'Test error message',
      id: null,
    };

    component.setError(1, error, errors);
    fixture.detectChanges();

    expect(errors.has(1)).toBe(true);
    expect(errors.get(1).length).toBe(1);
    expect(errors.get(1)[0]).toEqual(error);

    component.setError(1, error, errors);
  });
});
