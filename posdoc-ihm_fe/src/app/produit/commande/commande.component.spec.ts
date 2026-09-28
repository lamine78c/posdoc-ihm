import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { CommandeComponent } from '@app/produit/commande/commande.component';
import { TableauCommandeService } from '@app/produit/commande/service/tableau-commande.service';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { ApiAdelaideOrganismeService } from '@app/services/api-adelaide-organisme.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';
import { DataService } from '@app/shared/utils/data.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AddCommandeModalComponent } from './modal/add-modal/add-commande-modal/add-commande-modal.component';
import { CompareModalComponent } from './modal/compare-modal/compare-modal/compare-modal.component';

describe('CommandeComponent', () => {
  let component: CommandeComponent;
  let fixture: ComponentFixture<CommandeComponent>;
  let apiAdelaideCommandeServiceSpy: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let popupConfirmationServiceSpy: jasmine.SpyObj<PopupConfirmationService>;
  let tableauConfigurationBuilderServiceSpy: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let notesServiceSpy: jasmine.SpyObj<NotesService>;
  let tableauCommandeServiceSpy: jasmine.SpyObj<TableauCommandeService>;
  let apiAdelaideOrganismeServiceSpy: jasmine.SpyObj<ApiAdelaideOrganismeService>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let generateFileServiceSpy: jasmine.SpyObj<GenerateFileService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let formBuilder: UntypedFormBuilder;
  let gridApiSpy: jasmine.SpyObj<GridApi>;

  const mockColumnDefs = [{ headerName: 'Organisme', field: 'codorg', floatingFilterComponentParams: { selectData: null } }];
  const allOrganismes = [
    {
      code: '117',
      libelle: '117',
      codeRegion: '117',
    },
    {
      code: '116',
      libelle: '116',
      codeRegion: '116',
    },
  ];
  const allOrgReg = [
    {
      code: '117',
      codeRegion: '117',
      codeSite: 'CIRTIL',
    },
  ];
  const allCommandes = [
    {
      codapp: 'SNV2',
      code: 'TZ43',
      codenv: 'P',
      codorg: '010',
      codreg: '827',
      isNotAuthorisedToBeDeleted: true,
      libelle: 'VIDE - reprise CIRTIL',
    },
    {
      codapp: 'SNV2',
      code: 'TP18',
      codenv: 'P',
      codorg: '092',
      codreg: '092',
      isNotAuthorisedToBeDeleted: true,
      libelle: 'NOTIFICATION DES CREDITS JUSTIFIES',
    },
  ];
  const mockResponseAllOrganismes = {
    data: {
      allOrganismes: allOrganismes,
    },
    loading: false,
    networkStatus: 7,
  };
  const mockOverlayNoRowsTemplate = '';
  const mockGridOptions = {};
  const mockTransferData = new BehaviorSubject<any>({
    environnement: 'P',
    organisme: '117',
    application: 'MAS',
  });

  beforeEach(waitForAsync(() => {
    apiAdelaideCommandeServiceSpy = jasmine.createSpyObj('ApiAdelaideCommandeService', [
      'getPreselectedData',
      'getDistinctEnvsFromCommande',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'createCommande',
      'updateCommande',
      'deleteCommandes',
      'getCommandesByEnvsOrgsApps',
    ]);
    popupConfirmationServiceSpy = jasmine.createSpyObj('PopupConfirmationService', ['popupTooManyResultsConfirmation']);
    tableauConfigurationBuilderServiceSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'getNoDataMessage',
      'createGridConfiguration',
    ]);
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse', 'hasPermission']);
    notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    tableauCommandeServiceSpy = jasmine.createSpyObj('TableauCommandeService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    apiAdelaideOrganismeServiceSpy = jasmine.createSpyObj('ApiAdelaideOrganismeService', ['getAllOrganismes']);
    dataServiceSpy = jasmine.createSpyObj('DataService', ['getTransferedData', 'setServerData', 'setDataToTransfer']);
    generateFileServiceSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    gridApiSpy = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'applyTransaction',
      'getSelectedRows',
      'forEachNode',
      'redrawRows',
      'getSelectedNodes',
      'getColumnDefs',
    ]);

    TestBed.configureTestingModule({
      declarations: [CommandeComponent],
      providers: [
        UntypedFormBuilder,
        { provide: ApiAdelaideCommandeService, useValue: apiAdelaideCommandeServiceSpy },
        { provide: PopupConfirmationService, useValue: popupConfirmationServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: TableauCommandeService, useValue: tableauCommandeServiceSpy },
        { provide: ApiAdelaideOrganismeService, useValue: apiAdelaideOrganismeServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: GenerateFileService, useValue: generateFileServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    permissionServiceSpy.hasActionDeMasse.and.returnValue(false);
    permissionServiceSpy.hasPermission.and.returnValue(true);
    tableauConfigurationBuilderServiceSpy.createGridConfiguration.and.returnValue(mockGridOptions);
    tableauCommandeServiceSpy.getColumnDefs.and.returnValue(mockColumnDefs);
    tableauCommandeServiceSpy.getOverlayNoRowsTemplate.and.returnValue(mockOverlayNoRowsTemplate);
    apiAdelaideOrganismeServiceSpy.getAllOrganismes.and.returnValue(of(mockResponseAllOrganismes));
    dataServiceSpy.getTransferedData.and.returnValue(mockTransferData);

    fixture = TestBed.createComponent(CommandeComponent);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(UntypedFormBuilder);

    fixture.detectChanges();
  });

  it('ngOnDestroy validity', () => {
    component.ngOnDestroy();
    fixture.detectChanges();
    expect(dataServiceSpy.setServerData).toHaveBeenCalledWith(null);
    expect(dataServiceSpy.setDataToTransfer).toHaveBeenCalledWith(null);
  });

  it('ngOnInit validity', () => {
    spyOn(component, 'validerPreselectionAfterAddNewCommande');
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.form.controls.listeDeroulante).toBeTruthy();
    expect(component.formPreselection.controls.environnement).toBeTruthy();
    expect(component.formPreselection.controls.organisme).toBeTruthy();
    expect(component.formPreselection.controls.application).toBeTruthy();
    expect(dataServiceSpy.getTransferedData).toHaveBeenCalled();
    expect(component.validerPreselectionAfterAddNewCommande).toHaveBeenCalled();
    expect(tableauConfigurationBuilderServiceSpy.createGridConfiguration).toHaveBeenCalledWith(false);
    expect(tableauCommandeServiceSpy.getColumnDefs).toHaveBeenCalledWith(false);
    expect(component.gridOptions).toEqual(mockGridOptions);
    expect(component.columnDefs).toEqual(mockColumnDefs);
    expect(tableauCommandeServiceSpy.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.overlayNoRowsTemplate).toEqual(mockOverlayNoRowsTemplate);
  });

  it('onGridReady validity', fakeAsync(() => {
    const mockResponseDistinctEnvsFromCommande = ['P', 'T', 'Z'];
    const mockFormEnvValue = Object({ P: false, T: false, Z: false });
    apiAdelaideCommandeServiceSpy.getDistinctEnvsFromCommande.and.returnValue(
      of({
        data: {
          getDistinctEnvsFromCommande: mockResponseDistinctEnvsFromCommande,
        },
        loading: false,
        networkStatus: 7,
      })
    );
    const mockParams = {
      api: gridApiSpy,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    const orgs = ['117'];
    const responseOrgs = {
      data: {
        getDistOrgByEnvFromCommande: orgs,
        allOrganismes: allOrgReg,
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getDistinctOrgsByEnvs.and.returnValue(of(responseOrgs));
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    spyOn(component, 'saveNewSelectedApp');

    component.onGridReady(mockParams);
    tick(DELAI_VALUE_CHANGE);
    expect(apiAdelaideOrganismeServiceSpy.getAllOrganismes).toHaveBeenCalled();
    expect(apiAdelaideCommandeServiceSpy.getDistinctEnvsFromCommande).toHaveBeenCalled();
    expect(component.environnementList).toEqual(mockResponseDistinctEnvsFromCommande);
    expect(component.formPreselection.controls.environnement.value).toEqual(mockFormEnvValue);
    expect(component.isEnvOptionsInitialized).toBeTruthy();

    const formState = component.formPreselection.controls.environnement.getRawValue();
    for (const elem in formState) {
      formState[elem] = true;
    }
    component.formPreselection.controls.environnement.patchValue(formState, { emitEvent: true });
    tick(DELAI_VALUE_CHANGE);

    expect(component.selectedEnvs).toEqual(mockResponseDistinctEnvsFromCommande);
    expect(apiAdelaideCommandeServiceSpy.getDistinctOrgsByEnvs).toHaveBeenCalledWith(component.selectedEnvs);
    expect(component.organismes).toEqual(allOrgReg);
    expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
    expect(component.isOrgOptionsInitialized).toBeTruthy();

    component.formPreselection.controls.application.setValue('MAS');
    tick(DELAI_VALUE_CHANGE);

    expect(component.saveNewSelectedApp).toHaveBeenCalled();
  }));

  it('should getNoDataMessage when got empty commandes in validerPreselection result', () => {
    component.nombreCommandesTotal = undefined;
    component.rowData = undefined;
    component.commandes = undefined;
    const mockResponse = {
      data: {
        getPreselectedCommande: {
          commandes: [],
        },
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getPreselectedData.and.returnValue(of(mockResponse));
    spyOn(SharedUtil, 'extractSelectedOrgs');

    component.validerPreselection();
    fixture.detectChanges();

    expect(tableauConfigurationBuilderServiceSpy.getNoDataMessage).toHaveBeenCalled();
    expect(component.nombreCommandesTotal).toBeUndefined();
    expect(component.rowData).toBeUndefined();
    expect(component.commandes).toBeUndefined();
  });

  it('should open popupTooManyResultsConfirmation when got message in validerPreselection result', () => {
    component.nombreCommandesTotal = undefined;
    component.rowData = undefined;
    component.commandes = undefined;
    const mockMessage = 'eee';
    const mockResponse = {
      data: {
        getPreselectedCommande: {
          commandes: null,
          message: mockMessage,
        },
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getPreselectedData.and.returnValue(of(mockResponse));
    spyOn(SharedUtil, 'extractSelectedOrgs');

    component.validerPreselection();
    fixture.detectChanges();

    expect(popupConfirmationServiceSpy.popupTooManyResultsConfirmation).toHaveBeenCalledWith(mockMessage);
    expect(component.nombreCommandesTotal).toBeUndefined();
    expect(component.rowData).toBeUndefined();
    expect(component.commandes).toBeUndefined();
  });

  it('should change rowData, commandes and nombreCommandesTotal when got commandes in validerPreselection result', () => {
    spyOn(SharedUtil, 'extractSelectedOrgs').and.callFake((rawOrg, selectedOrgs) => {
      selectedOrgs.push('00L');
    });
    component.subscriptions = [];
    const mockResponse = {
      data: {
        getPreselectedCommande: {
          commandes: allCommandes,
        },
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getPreselectedData.and.returnValue(of(mockResponse));
    component.formPreselection = formBuilder.group({
      ['environnement']: formBuilder.group({
        P: [true],
        T: [false],
        I: [true],
      }),
      ['organisme']: formBuilder.group({
        '00L-null': formBuilder.group({ '00L': [true] }),
        '117': formBuilder.group({ '117': [false] }),
      }),
      ['application']: ['SNV2'],
    });

    component.validerPreselection();
    fixture.detectChanges();

    expect(apiAdelaideCommandeServiceSpy.getPreselectedData).toHaveBeenCalledWith(['P', 'I'], ['00L'], 'SNV2');
    const commandes = mockResponse.data.getPreselectedCommande.commandes;
    expect(component.nombreCommandesTotal).toBe(commandes.length);
    expect(component.rowData).toEqual(commandes);
    expect(component.commandes).toEqual(commandes);
    expect(component.subscriptions.length).toBe(1);
  });

  it('should show message when execute openPopup with mode compare case empty environnementList', () => {
    component.environnementList = [];

    component.openPopup({ mode: 'compare' });
    fixture.detectChanges();

    expect(notesServiceSpy.show).toHaveBeenCalledWith({
      title: 'Veuillez patienter un moment!',
      classname: 'note-avertissement',
      category: ToastCategoryEnum.WARNING,
    });
  });

  it('should open CompareModalComponent when execute openPopup with mode compare', () => {
    component.environnementList = ['P'];
    component.organismes = ['117'];
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    component.openPopup({ mode: 'compare' });
    fixture.detectChanges();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(CompareModalComponent);
    expect(modalRefSpy.componentInstance.environnementList).toEqual(component.environnementList);
    expect(modalRefSpy.componentInstance.allOrgReg).toEqual(component.organismes);
  });

  it('should open AddCommandeModalComponent with complet step when execute openPopup', () => {
    component.environnementList = ['P'];
    component.organismes = allOrganismes;
    component.commandes = allCommandes;
    component.nombreCommandesTotal = 2;
    const selectedRows = [{ index: 1 }];
    gridApiSpy.getSelectedRows.and.returnValue(selectedRows);
    gridApiSpy.getSelectedNodes.and.returnValue([]);
    component.gridApi = gridApiSpy;
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);
    modalRefSpy.componentInstance.passEntry = of({
      createCommandesNumber: 1,
      createdDTO: [{ codorg: '117' }, { codorg: '116' }],
    });
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    component.openPopup({ mode: '' });
    fixture.detectChanges();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(AddCommandeModalComponent);
    expect(modalRefSpy.componentInstance.title).toBe('Compléter une commande');
    expect(modalRefSpy.componentInstance.isCompleteStep).toBe(true);
    expect(modalRefSpy.componentInstance.selectedNode).toEqual({ isNotAuthorisedToBeDeleted: false });
    expect(component.nombreCommandesTotal).toBe(4);
    const rowData = [
      { codorg: '117', codreg: '117' },
      { codorg: '116', codreg: '116' },
    ];
    expect(gridApiSpy.applyTransaction).toHaveBeenCalledWith({ add: rowData });
    expect(component.commandes).toEqual([...allCommandes, ...rowData]);
  });

  it('should open AddCommandeModalComponent with create step when execute openPopup', () => {
    component.environnementList = ['P'];
    component.organismes = allOrganismes;
    component.commandes = allCommandes;
    component.nombreCommandesTotal = 2;
    const selectedRows = [];
    gridApiSpy.getSelectedRows.and.returnValue(selectedRows);
    gridApiSpy.getSelectedNodes.and.returnValue([]);
    component.gridApi = gridApiSpy;
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);
    modalRefSpy.componentInstance.passEntry = of({
      createCommandesNumber: 1,
      createdDTO: [{ codorg: '117' }],
    });
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    component.openPopup({ mode: '' });
    fixture.detectChanges();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(AddCommandeModalComponent);
    expect(modalRefSpy.componentInstance.title).toBe('Création de la commande');
    expect(modalRefSpy.componentInstance.isCompleteStep).toBe(false);
    expect(modalRefSpy.componentInstance.selectedNode).toBe(null);
    expect(component.nombreCommandesTotal).toBe(3);
    const rowData = [{ codorg: '117', codreg: '117' }];
    expect(gridApiSpy.applyTransaction).toHaveBeenCalledWith({ add: rowData });
    expect(component.commandes).toEqual([...allCommandes, ...rowData]);
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    const mockResponse = {
      data: {
        getCommandesByEnvsOrgsApps: [
          {
            code: 'a',
            libelle: 'a',
            codenv: 'a',
            codorg: 'a',
            codapp: 'a',
            codreg: 'a',
            isNotAuthorisedToBeDeleted: false,
          },
          {
            code: 'b',
            libelle: 'b',
            codenv: 'b',
            codorg: 'b',
            codapp: 'b',
            codreg: 'b',
            isNotAuthorisedToBeDeleted: false,
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getCommandesByEnvsOrgsApps.and.returnValue(of(mockResponse));
    gridApiSpy.getColumnDefs.and.returnValue([{ field: 'a', headerName: 'a' }]);
    component.gridApi = gridApiSpy;
    component.formPreselection = formBuilder.group({
      ['environnement']: formBuilder.group({
        P: [true],
        T: [false],
        I: [false],
      }),
      ['organisme']: formBuilder.group({
        '00L-null': formBuilder.group({ '00L': [false] }),
        '117': formBuilder.group({ '117': [true] }),
      }),
      ['application']: ['SNV2'],
    });
    const data = [
      ['a', 'a', 'a', 'a', 'a', 'a'],
      ['b', 'b', 'b', 'b', 'b', 'b'],
    ];
    const title = 'Liste des commandes';
    const headers = ['Environnement', 'Région', 'Organisme', 'Application', 'Commande', 'Désignation'];

    component.export(exportEvent);
    fixture.detectChanges();

    expect(apiAdelaideCommandeServiceSpy.getCommandesByEnvsOrgsApps).toHaveBeenCalledWith(['P'], ['117'], 'SNV2');
    expect(generateFileServiceSpy.generatePDFFile).toHaveBeenCalledWith(data, headers, title);
  });

  it('should export data as EXECL', () => {
    const exportEvent = { type: 'exportAsExcel' };
    const mockResponse = {
      data: {
        getCommandesByEnvsOrgsApps: [
          {
            code: 'code',
            libelle: 'lib',
            codenv: 'env',
            codorg: 'org',
            codapp: 'app',
            codreg: '',
            isNotAuthorisedToBeDeleted: false,
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getCommandesByEnvsOrgsApps.and.returnValue(of(mockResponse));
    gridApiSpy.getColumnDefs.and.returnValue([]);
    component.gridApi = gridApiSpy;
    component.formPreselection = formBuilder.group({
      ['environnement']: formBuilder.group({
        P: [true],
      }),
      ['organisme']: formBuilder.group({}),
      ['application']: null,
    });
    const data = [['env', null, 'org', 'app', 'code', 'lib']];
    const title = 'Liste des commandes';
    const headers = ['Environnement', 'Région', 'Organisme', 'Application', 'Commande', 'Désignation'];

    component.export(exportEvent);
    fixture.detectChanges();

    expect(apiAdelaideCommandeServiceSpy.getCommandesByEnvsOrgsApps).toHaveBeenCalledWith(['P'], null, null);
    expect(generateFileServiceSpy.generateExcelFile).toHaveBeenCalledWith(data, headers, title);
  });

  it('validerPreselectionAfterAddNewCommande validity', () => {
    component.formPreselection = formBuilder.group({
      ['environnement']: formBuilder.group({
        P: [true],
        T: [false],
        I: [false],
      }),
      ['organisme']: formBuilder.group({
        '00L-null': formBuilder.group({ '00L': [false] }),
        '117': formBuilder.group({ '117': [true] }),
      }),
      ['application']: ['SNV2'],
    });
    const data = {
      environnement: ['P'],
      organisme: ['117'],
      application: 'SNV2',
    };
    const envs = ['P', 'T', 'I'];
    const orgs = ['117'];
    const apps = ['SNV2', 'MAS'];
    const responseEnvs = {
      data: {
        getDistinctEnvsFromCommande: envs,
      },
      loading: false,
      networkStatus: 7,
    };
    const responseOrgs = {
      data: {
        getDistOrgByEnvFromCommande: orgs,
        allOrganismes: allOrgReg,
      },
      loading: false,
      networkStatus: 7,
    };
    const responseApps = {
      data: {
        getDistAppByEnvOrgFromCommande: apps,
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.getDistinctEnvsFromCommande.and.returnValue(of(responseEnvs));
    apiAdelaideCommandeServiceSpy.getDistinctOrgsByEnvs.and.returnValue(of(responseOrgs));
    apiAdelaideCommandeServiceSpy.getDistAppsByEnvOrg.and.returnValue(of(responseApps));
    spyOn(component, 'validerPreselection');
    spyOn(SharedUtil, 'getOrgFormByOrgData');

    component.validerPreselectionAfterAddNewCommande(data);
    fixture.detectChanges();

    expect(apiAdelaideCommandeServiceSpy.getDistinctEnvsFromCommande).toHaveBeenCalled();
    expect(component.environnementList).toEqual(envs);
    expect(Object.keys((component.formPreselection.controls.environnement as FormGroup).controls).length).toEqual(3);
    expect(apiAdelaideCommandeServiceSpy.getDistinctOrgsByEnvs).toHaveBeenCalledWith(data.environnement);
    expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
    expect(Object.keys((component.formPreselection.controls.organisme as FormGroup).controls).length).toEqual(2);
    expect(apiAdelaideCommandeServiceSpy.getDistAppsByEnvOrg).toHaveBeenCalledWith(data.environnement, data.organisme);
    expect(component.applicationOptions).toEqual(apps);
    expect(component.formPreselection.controls.application.value).toEqual(data.application);
    expect(component.validerPreselection).toHaveBeenCalled();
  });

  it('saveNewSelectedApp validity', () => {
    const selectedApp = 'aa';
    component.formPreselection.controls.application.setValue(selectedApp);
    component.saveNewSelectedApp();
    fixture.detectChanges();
    expect(component.selectedApp).toEqual(selectedApp);
  });

  it('onChangeOrganisme validity', () => {
    const selectedOrgs = ['117'];
    const selectedApp = 'MAS';
    const event = {
      selectedOrgs: selectedOrgs,
    };
    const apps = ['SNV2', 'MAS'];
    const responseApps = {
      data: {
        getDistAppByEnvOrgFromCommande: apps,
      },
      loading: false,
      networkStatus: 7,
    };
    component.formPreselection.controls.environnement = formBuilder.group({
      P: [true],
    });

    apiAdelaideCommandeServiceSpy.getDistAppsByEnvOrg.and.returnValue(of(responseApps));
    component.selectedApp = selectedApp;

    component.onChangeOrganisme(event);
    fixture.detectChanges();

    expect(component.listOfOldSelectedOrganismesCode).toEqual(selectedOrgs);
    expect(component.applicationOptions).toEqual(apps);
    expect(component.formPreselection.controls.application.value).toEqual(selectedApp);
  });

  it('onChangeOrganisme fail', () => {
    spyOn(component.formPreselection.controls.application, 'reset');
    const event = {
      selectedOrgs: [],
    };

    component.onChangeOrganisme(event);
    fixture.detectChanges();

    expect(component.applicationOptions).toEqual([]);
    expect(component.formPreselection.controls.application.reset).toHaveBeenCalledWith(false, { emitEvent: true });
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

  it('onDeleteRow validity', () => {
    component.commandes = allCommandes;
    let event = [
      {
        codapp: 'SNV2',
        code: 'TZ43',
        codenv: 'P',
        codorg: '010',
        codreg: '827',
      },
      {
        codapp: 'SNV2',
        code: 'TP18',
        codenv: 'P',
        codorg: '092',
        codreg: '092',
      },
    ];
    const response = {
      data: {
        deleteCommandes: 'ok',
      },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.deleteCommandes.and.returnValue(of(response));
    spyOn(SharedUtil, 'getNumberTotalRows').and.returnValue(0);
    component.gridApi = gridApiSpy;

    component.onDeleteRow(event);
    fixture.detectChanges();

    expect(gridApiSpy.applyTransaction).toHaveBeenCalledWith({ remove: event });
    expect(gridApiSpy.redrawRows).toHaveBeenCalled();
    expect(notesServiceSpy.show).toHaveBeenCalledWith({
      title: 'Les commandes ont été supprimées avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(component.nombreCommandesTotal).toBe(0);
    expect(component.commandes.length).toBe(0);

    event = [
      {
        codapp: 'SNV2',
        code: 'TZ43',
        codenv: 'P',
        codorg: '010',
        codreg: '827',
      },
    ];
    component.onDeleteRow(event);
    expect(notesServiceSpy.show).toHaveBeenCalledWith({
      title: 'La commande a été supprimée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('onDeleteRow fail', () => {
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    apiAdelaideCommandeServiceSpy.deleteCommandes.and.returnValue(throwError(error));

    component.onDeleteRow([]);
    fixture.detectChanges();

    expect(notesServiceSpy.show).toHaveBeenCalledWith({
      title: 'Impossible de supprimer les commandes, elles sont liées à des fichiers',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });

    component.onDeleteRow([
      {
        codapp: 'SNV2',
        code: 'TZ43',
        codenv: 'P',
        codorg: '010',
        codreg: '827',
      },
    ]);
    expect(notesServiceSpy.show).toHaveBeenCalledWith({
      title: 'Impossible de supprimer la commande, elle est liée à des fichiers',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('should update existing row successfully', () => {
    const updateRow = {
      codapp: 'SNV2',
      code: 'TZ43',
      codenv: 'P',
      codorg: '010',
      libelle: 'lib',
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const updateResponse = {
      data: { updateCommande: updateRow },
      loading: false,
      networkStatus: 7,
    };
    apiAdelaideCommandeServiceSpy.updateCommande.and.returnValue(of(updateResponse));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(notesServiceSpy.show).toHaveBeenCalledWith({
      title: 'La commande "P-010-SNV2-TZ43" a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle update error', () => {
    const updateRow = {
      codapp: 'SNV2',
      code: 'TZ43',
      codenv: 'P',
      codorg: '010',
      libelle: 'lib',
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de la modification' }] };
    apiAdelaideCommandeServiceSpy.updateCommande.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('compare validity', () => {
    let a = {
      codapp: 'A',
      code: 'A',
      codenv: 'A',
      codorg: 'A',
    };
    let b = {
      codapp: 'B',
      code: 'B',
      codenv: 'B',
      codorg: 'B',
    };
    let num = component.compare(a, b);
    fixture.detectChanges();
    expect(num).toEqual(-1);

    a = {
      codapp: 'A',
      code: 'A',
      codenv: 'A',
      codorg: 'A',
    };
    b = {
      codapp: 'A',
      code: 'A',
      codenv: 'A',
      codorg: 'A',
    };
    num = component.compare(a, b);
    fixture.detectChanges();
    expect(num).toEqual(0);

    num = component.compare({ codapp: 'B' }, { codapp: 'A' });
    fixture.detectChanges();
    expect(num).toEqual(1);
  });
});
