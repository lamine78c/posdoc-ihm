import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { FormBuilder, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { FichiersComponent } from './fichiers.component';
import { TableauFichierService } from './service/tableau-fichier.service';
import { of, throwError } from 'rxjs';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';

describe('FichiersComponent', () => {
  let component: FichiersComponent;
  let fixture: ComponentFixture<FichiersComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauFichierService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideFichierService>;
  let mockApiAdelaideDistributionService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let fb: FormBuilder;

  const mockColumnDefs = [{ headerName: 'Organisme', field: 'codeOrg', floatingFilterComponentParams: { selectData: null } }];
  const mockOverlayNoRowsTemplate = '';
  const mockGridOptions = {};

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'createGridConfiguration',
      'getNoDataMessage',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideFichierService', [
      'updateFichiers',
      'deleteFichiers',
      'getDistinctEnvironnements',
      'getConfigData',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'getDistComsByEnvOrgApp',
      'preselectedData',
    ]);
    mockApiAdelaideDistributionService = jasmine.createSpyObj('ApiAdelaideDistributionService', ['getDistFicsByEnvOrgAppCom']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockTableauService = jasmine.createSpyObj('TableauFichierService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode', 'getColumnDefs']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      declarations: [FichiersComponent],
      providers: [
        FormBuilder,
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauFichierService, useValue: mockTableauService },
        { provide: ApiAdelaideFichierService, useValue: mockApiAdelaideService },
        { provide: ApiAdelaideDistributionService, useValue: mockApiAdelaideDistributionService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: NgbModal, useValue: mockModalService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPermissionService.hasActionDeMasse.and.returnValue(false);
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions);
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue(mockOverlayNoRowsTemplate);

    fixture = TestBed.createComponent(FichiersComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    fixture.detectChanges();
  });

  it('ngOnInit validity', () => {
    spyOn(component, 'onChangeEnv');
    spyOn(component, 'onChangeApplication');
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(false);
    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(false);
    expect(component.gridOptions.masterDetail).toBeTruthy();
    expect(component.gridOptions.detailRowAutoHeight).toBeFalsy();
    expect(component.gridOptions.detailRowHeight).toBeDefined();
    expect(component.gridOptions.detailCellRenderer).toBeDefined();
    expect(component.gridOptions.detailCellRendererParams).toBeDefined();
    expect(component.gridOptions.detailCellRendererParams.client).toBeDefined();
    expect(component.gridOptions.detailCellRendererParams.format).toBeDefined();
    expect(component.gridOptions.detailCellRendererParams.document).toBeDefined();
    expect(component.gridOptions.detailCellRendererParams.imprime).toBeDefined();
    expect(component.columnDefs).toEqual(mockColumnDefs);
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.overlayNoRowsTemplate).toEqual(mockOverlayNoRowsTemplate);

    expect(component.formPreselection.controls.environnement).toBeTruthy();
    expect(component.formPreselection.controls.organisme).toBeTruthy();
    expect(component.formPreselection.controls.application).toBeTruthy();
    expect(component.formPreselection.controls.commande).toBeTruthy();

    expect(component.onChangeEnv).toHaveBeenCalled();
    expect(component.onChangeApplication).toHaveBeenCalled();
  });

  it('onGridReady validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [false],
      }),
    });
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    const envs = ['P', 'T', 'D'];
    const allOrgReg = [
      {
        code: '117',
        libelle: '117',
        codeRegion: '117',
        codeSite: 'CIRTIL',
      },
      {
        code: '116',
        libelle: '116',
        codeRegion: '116',
        codeSite: 'CIRTIL',
      },
    ];
    const responseEnvs = {
      data: {
        getDistinctEnvsFromFichier: envs,
        allOrganismes: allOrgReg,
      },
      loading: false,
      networkStatus: 7,
    };
    const allFormats = [
      {
        value: 'fv1',
        text: 'ft1',
      },
      {
        value: 'fv2',
        text: 'ft2',
      },
    ];
    const allClients = [{ code: 'c1' }, { code: 'c2' }];
    const allImprimes = [
      {
        reference: 'ir1',
        libelle: 'il1',
      },
      {
        reference: 'ir2',
        libelle: 'il2',
      },
    ];
    const responseConfig = {
      data: {
        allFormats: allFormats,
        allClients: allClients,
        allImprimes: allImprimes,
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.getDistinctEnvironnements.and.returnValue(of(responseEnvs));
    mockApiAdelaideService.getConfigData.and.returnValue(of(responseConfig));
    spyOn(component.organismeData$, 'next');
    spyOn(component.formatData$, 'next');
    spyOn(component.clientData$, 'next');
    spyOn(component.documentData$, 'next');
    spyOn(component.imprimeData$, 'next');

    component.onGridReady(mockParams);
    fixture.detectChanges();

    const allDocuments = ['a', 'r', 'g'];
    expect(mockApiAdelaideService.getDistinctEnvironnements).toHaveBeenCalled();
    expect(Object.keys((component.formPreselection.controls.environnement as FormGroup).controls).length).toEqual(3);
    expect(component.isEnvOptionsInitialized).toBeTruthy();
    expect(component.allOrgReg).toEqual(allOrgReg);
    expect(component.organismeData$.next).toHaveBeenCalledWith(allOrgReg);
    expect(mockApiAdelaideService.getConfigData).toHaveBeenCalled();
    expect(component.formatData$.next).toHaveBeenCalledWith(allFormats);
    expect(component.clientData$.next).toHaveBeenCalledWith(allClients.map(e => e.code));
    expect(component.documentData$.next).toHaveBeenCalledWith(allDocuments);
    expect(component.imprimeData$.next).toHaveBeenCalledWith(allImprimes);
  });

  it('onChangeEnv validity with debounceTime', fakeAsync(() => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [false],
        T: [false],
        I: [false],
      }),
    });
    const responseOrgs = {
      data: {
        getDistOrgByEnvFromFichier: ['117'],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.getDistinctOrgsByEnvs.and.returnValue(of(responseOrgs));
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    spyOn(component, 'getSearchFichierFilterQuery');
    spyOn(component, 'onChangeOrganisme');
    component.isOrgOptionsInitialized = true;
    component.onChangeEnv();
    const formState = component.formPreselection.controls.environnement.getRawValue();
    for (const elem in formState) {
      formState[elem] = true;
    }
    component.formPreselection.controls.environnement.patchValue(formState, { emitEvent: true });
    tick(DELAI_VALUE_CHANGE);
    fixture.detectChanges();

    expect(mockApiAdelaideService.getDistinctOrgsByEnvs).toHaveBeenCalled();
    expect(component.getSearchFichierFilterQuery).toHaveBeenCalled();
    expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
    expect(component.onChangeOrganisme).toHaveBeenCalled();
  }));

  it('onChangeApplication validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
    });
    const comm = ['comm2'];
    const responseComs = {
      data: {
        getDistComByEnvOrgAppFromFichier: comm,
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.getDistComsByEnvOrgApp.and.returnValue(of(responseComs));
    spyOn(SharedUtil, 'extractSelectedOrgs').and.callFake((rawOrg, selectedOrgs) => {
      selectedOrgs.push('117');
    });
    spyOn(component, 'getSearchFichierFilterQuery');
    spyOn(component.formPreselection.controls.commande, 'reset');

    component.onChangeApplication();
    fixture.detectChanges();
    component.formPreselection.controls.application.setValue('SNV2');

    expect(mockApiAdelaideService.getDistComsByEnvOrgApp).toHaveBeenCalled();
    expect(SharedUtil.extractSelectedOrgs).toHaveBeenCalled();
    expect(component.getSearchFichierFilterQuery).toHaveBeenCalled();
    expect(component.commandeOptions).toEqual(comm);
    expect(component.formPreselection.controls.commande.reset).toHaveBeenCalledWith(false, { emitEvent: true });
  });

  it('onChangeOrganisme validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
    });
    const apps = ['MAS'];
    const responseApps = {
      data: {
        getDistAppByEnvOrgFromFichier: apps,
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.getDistAppsByEnvOrg.and.returnValue(of(responseApps));
    spyOn(component, 'getSearchFichierFilterQuery');
    spyOn(component.formPreselection.controls.application, 'reset');
    const selectedOrgs = ['117'];
    const event = {
      selectedOrgs: selectedOrgs,
    };

    component.onChangeOrganisme(event);
    fixture.detectChanges();

    expect(mockApiAdelaideService.getDistAppsByEnvOrg).toHaveBeenCalled();
    expect(component.getSearchFichierFilterQuery).toHaveBeenCalled();
    expect(component.listOfOldSelectedOrganismesCode).toEqual(selectedOrgs);
    expect(component.applicationOptions).toEqual(apps);
  });

  it('onChangeOrganisme vide validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [false],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [false] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
    });
    spyOn(component.formPreselection.controls.application, 'reset');
    const selectedOrgs = [];
    const event = {
      selectedOrgs: selectedOrgs,
    };

    component.onChangeOrganisme(event);
    fixture.detectChanges();

    expect(mockApiAdelaideService.getDistAppsByEnvOrg).not.toHaveBeenCalled();
    expect(component.listOfOldSelectedOrganismesCode).toEqual(selectedOrgs);
    expect(component.applicationOptions).toEqual([]);
    expect(component.formPreselection.controls.application.reset).toHaveBeenCalledWith(false, { emitEvent: true });
  });

  it('validerPreselection validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [false],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [false] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
      fichier: ['fic1'],
    });
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    spyOn(SharedUtil, 'extractSelectedOrgs');
    spyOn(component, 'getSearchFichierFilterQuery');
    const response = {
      data: {
        getPreselectedFichier: [
          {
            codeEnv: '',
            codeOrg: '117',
            codeApp: '',
            codeCom: '',
            codeFich: '',
            libFichier: '',
            refImprime: '',
            codeAdr: '',
            codeProd: '',
            refFormat: '',
            typeFormat: '',
            page: '',
            codeClient: '',
            typeMultif: '',
            typeSig: '',
            typeSupport: '',
            codeDocument: '',
            eclatement: '',
            refSupport: '',
            isNotAuthorisedToBeDeleted: false,
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.preselectedData.and.returnValue(of(response));
    const allOrgReg: [{ code: string; codeRegion: string }] = [
      {
        code: '117',
        codeRegion: '117',
      },
    ];
    component.allOrgReg = allOrgReg;

    component.validerPreselection();
    fixture.detectChanges();

    expect(component.nombreFichierTotal).toBe(1);
    expect(component.rowData).toBeDefined();
    expect(mockTableauConfigurationBuilderService.getNoDataMessage).not.toHaveBeenCalled();
  });

  it('validerPreselection getNoDataMessage validity', () => {
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    spyOn(SharedUtil, 'extractSelectedOrgs');
    spyOn(component, 'getSearchFichierFilterQuery');
    const response = {
      data: {
        getPreselectedFichier: [],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.preselectedData.and.returnValue(of(response));
    const allOrgReg: [{ code: string; codeRegion: string }] = [
      {
        code: '117',
        codeRegion: '117',
      },
    ];
    component.allOrgReg = allOrgReg;

    component.validerPreselection();
    fixture.detectChanges();

    expect(component.nombreFichierTotal).toBe(0);
    expect(component.rowData).toEqual([]);
    expect(mockTableauConfigurationBuilderService.getNoDataMessage).toHaveBeenCalled();
  });

  it('addModal validity', fakeAsync(() => {
    const modalRefSpy = jasmine.createSpyObj('NgbModalRef', ['componentInstance', 'result']);
    mockModalService.open.and.returnValue(modalRefSpy);
    let resolveResult: (value?: unknown) => void;
    modalRefSpy.result = new Promise(formData => {
      resolveResult = formData;
    });
    spyOn(component, 'reloadPreselectedFichier');

    component.addModal();
    resolveResult('formData');
    tick();

    expect(mockModalService.open).toHaveBeenCalled();
    expect(component.reloadPreselectedFichier).toHaveBeenCalledWith('formData');
  }));

  it('updateFichier validity', () => {
    const updateRow = [
      {
        codeFich: 'fic',
        codeEnv: 'env',
        codeOrg: 'org',
        codeApp: 'app',
        codeCom: 'com',
      },
    ];
    const editedRow = new Map([[1, updateRow]]);
    const updateResponse = {
      data: { updateFichiers: updateRow },
      loading: false,
      networkStatus: 7,
    };
    const mockUpdateFichiers = mockApiAdelaideService.updateFichiers.and.returnValue(of(updateResponse));

    component.updateFichier(editedRow);
    fixture.detectChanges();

    expect(mockUpdateFichiers).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le fichier "env, org, app, com, fic" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('updateFichier fail', () => {
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    const mockUpdateFichiers = mockApiAdelaideService.updateFichiers.and.returnValue(throwError(error));
    const mockSetError = spyOn(component, 'setError');
    const updateRow = [
      {
        codeFich: 'fic',
        codeEnv: 'env',
        codeOrg: 'org',
        codeApp: 'app',
        codeCom: 'com',
      },
    ];
    const editedRow = new Map([[1, updateRow]]);
    component.updateFichier(editedRow);
    fixture.detectChanges();

    expect(mockUpdateFichiers).toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalled();
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

  it('should delete multi row successfully', () => {
    const multiDeleteDTO = [
      {
        codeFich: 'fic',
        codeEnv: 'env',
        codeOrg: 'org',
        codeApp: 'app',
        codeCom: 'com',
      },
      {
        codeFich: 'fic2',
        codeEnv: 'env',
        codeOrg: 'org',
        codeApp: 'app',
        codeCom: 'com',
      },
    ];
    const deleteResponse = {
      data: { deleteFichiers: true },
      loading: false,
      networkStatus: 7,
    };
    const mockDeleteFichiers = mockApiAdelaideService.deleteFichiers.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(multiDeleteDTO);
    fixture.detectChanges();

    expect(mockDeleteFichiers).toHaveBeenCalled();
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: multiDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les fichiers ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should delete single row successfully', () => {
    const deleteDTO = [
      {
        codeFich: 'fic',
        codeEnv: 'env',
        codeOrg: 'org',
        codeApp: 'app',
        codeCom: 'com',
      },
    ];
    const deleteResponse = {
      data: { deleteFichiers: true },
      loading: false,
      networkStatus: 7,
    };
    const mockDeleteFichiers = mockApiAdelaideService.deleteFichiers.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(deleteDTO);
    fixture.detectChanges();

    expect(mockDeleteFichiers).toHaveBeenCalled();
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: deleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le fichier a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle delete error', () => {
    const deleteDTO = [
      {
        codeFich: 'fic',
        codeEnv: 'env',
        codeOrg: 'org',
        codeApp: 'app',
        codeCom: 'com',
      },
    ];
    const error = { graphQLErrors: [{ message: 'Erreur de la suppression' }] };
    mockApiAdelaideService.deleteFichiers.and.returnValue(throwError(error));

    component.onDeleteRow(deleteDTO);
    fixture.detectChanges();

    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Impossible de supprimer le fichier, il est lié à une Produit ',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });

    component.onDeleteRow([...deleteDTO, ...deleteDTO]);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Impossible de supprimer les fichiers, ils sont liés à des Produit',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    const mockResponse = {
      data: {
        getPreselectedFichier: [
          {
            codeEnv: '',
            codeOrg: '117',
            codeApp: '',
            codeCom: '',
            codeFich: '',
            libFichier: '',
            refImprime: '',
            codeAdr: '',
            codeProd: '',
            refFormat: '',
            typeFormat: '',
            page: '',
            codeClient: '',
            typeMultif: '',
            typeSig: '',
            typeSupport: '',
            codeDocument: '',
            eclatement: '',
            refSupport: '',
            isNotAuthorisedToBeDeleted: false,
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.preselectedData.and.returnValue(of(mockResponse));
    component.gridApi = mockGridApi;
    mockGridApi.getColumnDefs.and.returnValue([
      { field: 'code', headerName: 'Code' } as ColDef,
      { field: 'libelle', headerName: 'Libellé' } as ColDef,
      { field: null, headerName: null } as ColDef,
    ]);
    const allOrgReg: [{ code: string; codeRegion: string }] = [
      {
        code: '117',
        codeRegion: '117',
      },
    ];
    component.allOrgReg = allOrgReg;
    spyOn(SharedUtil, 'extractSelectedOrgs');
    spyOn(SharedUtil, 'formatOuiNon');

    component.export(exportEvent);
    fixture.detectChanges();
  });

  it('should export data as exportAsExcel', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [true],
        T: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      commande: ['comm'],
      application: ['app'],
      fichier: ['fic'],
    });
    const exportEvent = { type: 'exportAsExcel' };
    const mockResponse = {
      data: {
        getPreselectedFichier: [
          {
            codeEnv: 'A',
            codeOrg: '117',
            codeApp: 'A',
            codeCom: 'A',
            codeFich: 'A',
            libFichier: '',
            refImprime: '',
            codeAdr: '',
            codeProd: '',
            refFormat: '',
            typeFormat: '',
            page: '',
            codeClient: '',
            typeMultif: '',
            typeSig: '',
            typeSupport: '',
            codeDocument: '',
            eclatement: '',
            refSupport: '',
            isNotAuthorisedToBeDeleted: false,
          },
          {
            codeEnv: 'A',
            codeOrg: '117',
            codeApp: 'A',
            codeCom: 'A',
            codeFich: 'A',
            libFichier: '',
            refImprime: '',
            codeAdr: '',
            codeProd: '',
            refFormat: '',
            typeFormat: '',
            page: '',
            codeClient: '',
            typeMultif: '',
            typeSig: '',
            typeSupport: '',
            codeDocument: '',
            eclatement: '',
            refSupport: '',
            isNotAuthorisedToBeDeleted: false,
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.preselectedData.and.returnValue(of(mockResponse));
    component.gridApi = mockGridApi;
    mockGridApi.getColumnDefs.and.returnValue([
      { field: 'code', headerName: 'Code' } as ColDef,
      { field: 'libelle', headerName: 'Libellé' } as ColDef,
      { field: null, headerName: null } as ColDef,
    ]);
    const allOrgReg: [{ code: string; codeRegion: string }] = [
      {
        code: '117',
        codeRegion: '117',
      },
    ];
    component.allOrgReg = allOrgReg;
    spyOn(SharedUtil, 'formatOuiNon');

    component.export(exportEvent);
    fixture.detectChanges();
  });

  it('getSearchFichierFilterQuery vide validity', () => {
    const result = component.getSearchFichierFilterQuery(null, null, null);
    fixture.detectChanges();
    expect(result).toEqual({
      codenvs: null,
      codorgs: null,
      codapp: null,
      codcom: undefined,
      codfic: undefined,
    });
  });

  it('reloadPreselectedFichier validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [false],
        T: [false],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [false] }),
      }),
      commande: ['comm'],
      application: ['app'],
      fichier: ['fic'],
    });
    const formData = {
      environnement: 'P',
      organisme: [{ '117': true }],
      application: 'app',
      commande: 'comm,',
      fichier: 'fic',
    };
    const apps = ['MAS'];
    const mockResponseApps = {
      data: {
        getDistAppByEnvOrgFromFichier: apps,
      },
      loading: false,
      networkStatus: 7,
    };
    const comm = ['comm2'];
    const mockResponseComs = {
      data: {
        getDistComByEnvOrgAppFromFichier: comm,
      },
      loading: false,
      networkStatus: 7,
    };
    const fich = [
      {
        codfic: 'fich',
        refImprime: 'ref1',
        codeProd: 'qq1',
      },
    ];
    const mockResponseFics = {
      data: {
        getDistFicByEnvOrgAppComFromExemplaire: fich,
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponsePreselectedData = {
      data: {
        getPreselectedFichier: [
          {
            codeEnv: 'A',
            codeOrg: '117',
            codeApp: 'A',
            codeCom: 'A',
            codeFich: 'A',
            libFichier: '',
            refImprime: '',
            codeAdr: '',
            codeProd: '',
            refFormat: '',
            typeFormat: '',
            page: '',
            codeClient: '',
            typeMultif: '',
            typeSig: '',
            typeSupport: '',
            codeDocument: '',
            eclatement: '',
            refSupport: '',
            isNotAuthorisedToBeDeleted: false,
          },
          {
            codeEnv: 'A',
            codeOrg: '117',
            codeApp: 'A',
            codeCom: 'A',
            codeFich: 'A',
            libFichier: '',
            refImprime: '',
            codeAdr: '',
            codeProd: '',
            refFormat: '',
            typeFormat: '',
            page: '',
            codeClient: '',
            typeMultif: '',
            typeSig: '',
            typeSupport: '',
            codeDocument: '',
            eclatement: '',
            refSupport: '',
            isNotAuthorisedToBeDeleted: false,
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseOrgs = {
      data: {
        getDistOrgByEnvFromFichier: ['117'],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.getDistinctOrgsByEnvs.and.returnValue(of(mockResponseOrgs));
    mockApiAdelaideService.getDistAppsByEnvOrg.and.returnValue(of(mockResponseApps));
    mockApiAdelaideService.getDistComsByEnvOrgApp.and.returnValue(of(mockResponseComs));
    mockApiAdelaideDistributionService.getDistFicsByEnvOrgAppCom.and.returnValue(of(mockResponseFics));
    mockApiAdelaideService.preselectedData.and.returnValue(of(mockResponsePreselectedData));
    const allOrgReg: [{ code: string; codeRegion: string }] = [
      {
        code: '117',
        codeRegion: '117',
      },
    ];
    component.allOrgReg = allOrgReg;
    const mockExtractSelectedOrgs = spyOn(SharedUtil, 'extractSelectedOrgs');
    const mockGetOrgFormByOrgData = spyOn(SharedUtil, 'getOrgFormByOrgData');
    const mockSetValueApp = spyOn(component.formPreselection.controls.application, 'setValue');
    const mockSetValueCom = spyOn(component.formPreselection.controls.commande, 'setValue');

    component.reloadPreselectedFichier(formData);
    fixture.detectChanges();

    expect(mockExtractSelectedOrgs).toHaveBeenCalled();
    expect(mockGetOrgFormByOrgData).toHaveBeenCalled();
    expect(mockSetValueApp).toHaveBeenCalledWith(formData.application, { emitEvent: false });
    expect(mockSetValueCom).toHaveBeenCalledWith(formData.commande, { emitEvent: false });
    expect(component.rowData).toBeDefined();
  });

  it('onChangeCommande validity', () => {
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      application: ['SNV2'],
      commande: [''],
      fichier: ['fich'],
    });
    const fich = [
      {
        codfic: 'fich',
        refImprime: 'ref1',
        codeProd: 'qq1',
      },
      {
        codfic: 'fich2',
        refImprime: 'ref2',
        codeProd: 'qq2',
      },
    ];
    const mockResponseFics = {
      data: {
        getDistFicByEnvOrgAppComFromExemplaire: fich,
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideDistributionService.getDistFicsByEnvOrgAppCom.and.returnValue(of(mockResponseFics));
    component.onChangeCommande();
    component.formPreselection.controls.commande.setValue('comm1');

    expect(mockApiAdelaideDistributionService.getDistFicsByEnvOrgAppCom).toHaveBeenCalled();
    expect(component.fichierOptions).toEqual([
      {
        value: '',
        columns: [
          { label: 'Fichier', value: '' },
          { label: 'Code Prd', value: '' },
          { label: 'Imprimé', value: '' },
        ],
      },
      {
        value: 'fich',
        columns: [
          { label: 'Fichier', value: 'fich' },
          { label: 'Code Prd', value: 'qq1' },
          { label: 'Imprimé', value: 'ref1' },
        ],
      },
      {
        value: 'fich2',
        columns: [
          { label: 'Fichier', value: 'fich2' },
          { label: 'Code Prd', value: 'qq2' },
          { label: 'Imprimé', value: 'ref2' },
        ],
      },
    ]);
    expect(component.formPreselection.controls.fichier.value).toEqual('fich');

    mockApiAdelaideDistributionService.getDistFicsByEnvOrgAppCom.and.returnValue(of(null));
    component.formPreselection.controls.commande.setValue('');
    expect(mockApiAdelaideService.getDistComsByEnvOrgApp).not.toHaveBeenCalled();
    expect(component.fichierOptions).toEqual([
      {
        value: '',
        columns: [
          { label: 'Fichier', value: '' },
          { label: 'Code Prd', value: '' },
          { label: 'Imprimé', value: '' },
        ],
      },
    ]);
  });

  it('openUpdateRowsPopup control one codeEnv validity', () => {
    spyOn(component, 'setError');
    const event = {
      selectedNodes: [
        {
          data: { codeEnv: 'P', codeFich: 'Fic', codeRegion: '117' },
        },
        {
          data: { codeEnv: 'I', codeFich: 'Fic', codeRegion: '117' },
        },
      ],
    };
    component.openUpdateRowsPopup(event);
    expect(component.setError).toHaveBeenCalled();
    expect(mockModalService.open).not.toHaveBeenCalled();
  });

  it('openUpdateRowsPopup control one codeFich validity', () => {
    spyOn(component, 'setError');
    const event = {
      selectedNodes: [
        {
          data: { codeEnv: 'P', codeFich: 'Fic', codeRegion: '117' },
        },
        {
          data: { codeEnv: 'P', codeFich: 'Fic2', codeRegion: '117' },
        },
      ],
    };
    component.openUpdateRowsPopup(event);
    expect(component.setError).toHaveBeenCalled();
    expect(mockModalService.open).not.toHaveBeenCalled();
  });

  it('update fichier définition validity', fakeAsync(() => {
    spyOn(component, 'updateFichiers');
    const formDefData = {
      designation: 'test',
      codeProduit: 'test',
      refFormat: 'test',
      typeFormat: 'test',
      fondPage: 'test',
      page: 0,
      signature: 'test',
      codeDocument: 'test',
      typeSupport: 'test',
      eclatement: true,
    };
    const modalRefSpy = {
      componentInstance: {},
      result: Promise.resolve({ formDefData: formDefData }),
    } as NgbModalRef;
    mockModalService.open.and.returnValue(modalRefSpy);
    const event = {
      selectedNodes: [
        {
          data: {
            codeEnv: 'P',
            codeFich: 'Fic',
            codeRegion: '117',
            codeApp: 'SNV2',
            codeOrg: '117',
            codeClient: 'UR117',
            libFichier: 'test',
            codeProd: '',
            refFormat: null,
            typeFormat: 'B',
            refImprime: '',
            page: 5,
            typeSig: ' ',
            codeDocument: null,
            typeSupport: 'I',
            eclatement: 0,
          },
        },
        {
          data: {
            codeEnv: 'P',
            codeFich: 'Fic',
            codeRegion: '109',
            codeApp: 'SNV2',
            codeOrg: '219',
            codeClient: 'UR109',
            libFichier: 'test',
            codeProd: '',
            refFormat: null,
            typeFormat: 'B',
            refImprime: '',
            page: 5,
            typeSig: ' ',
            codeDocument: null,
            typeSupport: 'I',
            eclatement: 0,
          },
        },
        {
          data: {
            codeEnv: 'P',
            codeFich: 'Fic',
            codeRegion: '',
            codeApp: 'SNV2',
            codeOrg: '110',
            codeClient: 'CIP',
            libFichier: 'test',
            codeProd: '',
            refFormat: null,
            typeFormat: 'B',
            refImprime: '',
            page: 5,
            typeSig: ' ',
            codeDocument: null,
            typeSupport: 'I',
            eclatement: 0,
          },
        },
      ],
    };
    component.openUpdateRowsPopup(event);
    tick();
    expect(mockModalService.open).toHaveBeenCalled();
    expect(component.updateFichiers).toHaveBeenCalledWith([
      {
        codeEnv: 'P',
        codeFich: 'Fic',
        codeRegion: '117',
        codeApp: 'SNV2',
        codeOrg: '117',
        codeClient: 'UR117',
        libFichier: 'test',
        codeProd: 'test',
        refFormat: 'test',
        typeFormat: 'test',
        refImprime: 'test',
        page: 0,
        typeSig: 'test',
        codeDocument: 'test',
        typeSupport: 'test',
        eclatement: 1,
      },
      {
        codeEnv: 'P',
        codeFich: 'Fic',
        codeRegion: '109',
        codeApp: 'SNV2',
        codeOrg: '219',
        codeClient: 'UR109',
        libFichier: 'test',
        codeProd: 'test',
        refFormat: 'test',
        typeFormat: 'test',
        refImprime: 'test',
        page: 0,
        typeSig: 'test',
        codeDocument: 'test',
        typeSupport: 'test',
        eclatement: 1,
      },
      {
        codeEnv: 'P',
        codeFich: 'Fic',
        codeRegion: '',
        codeApp: 'SNV2',
        codeOrg: '110',
        codeClient: 'CIP',
        libFichier: 'test',
        codeProd: 'test',
        refFormat: 'test',
        typeFormat: 'test',
        refImprime: 'test',
        page: 0,
        typeSig: 'test',
        codeDocument: 'test',
        typeSupport: 'test',
        eclatement: 1,
      },
    ]);
  }));

  it('update fichier code client validity', fakeAsync(() => {
    spyOn(component, 'updateFichiers');
    const formCodcliData = {
      codeClient: 'UR***',
    };
    const formOrgCliData = { '110': 'CNAV' };
    const modalRefSpy = {
      componentInstance: {},
      result: Promise.resolve({ formCodcliData: formCodcliData, formOrgCliData: formOrgCliData }),
    } as NgbModalRef;
    mockModalService.open.and.returnValue(modalRefSpy);
    const event = {
      selectedNodes: [
        {
          data: {
            codeEnv: 'P',
            codeFich: 'Fic',
            codeRegion: '117',
            codeApp: 'SNV2',
            codeOrg: '117',
            codeClient: 'UR117',
            libFichier: 'test',
            codeProd: '',
            refFormat: null,
            typeFormat: 'B',
            refImprime: '',
            page: 5,
            typeSig: ' ',
            codeDocument: null,
            typeSupport: 'I',
            eclatement: 0,
          },
        },
        {
          data: {
            codeEnv: 'P',
            codeFich: 'Fic',
            codeRegion: '109',
            codeApp: 'SNV2',
            codeOrg: '219',
            codeClient: 'UR109',
            libFichier: 'test',
            codeProd: '',
            refFormat: null,
            typeFormat: 'B',
            refImprime: '',
            page: 5,
            typeSig: ' ',
            codeDocument: null,
            typeSupport: 'I',
            eclatement: 0,
          },
        },
        {
          data: {
            codeEnv: 'P',
            codeFich: 'Fic',
            codeRegion: '',
            codeApp: 'SNV2',
            codeOrg: '110',
            codeClient: 'CIP',
            libFichier: 'test',
            codeProd: '',
            refFormat: null,
            typeFormat: 'B',
            refImprime: '',
            page: 5,
            typeSig: ' ',
            codeDocument: null,
            typeSupport: 'I',
            eclatement: 0,
          },
        },
      ],
    };
    component.allOrgCliSnv2 = [{ codorg: '219', codcli: 'spcc' }];
    component.allClientList = ['UR117', 'UR109', 'CIP', 'spcc', 'CNAV'];
    component.allOrgReg = [
      { code: '110', codeRegion: '' },
      { code: '117', codeRegion: '117' },
      { code: '219', codeRegion: '109' },
    ];
    component.openUpdateRowsPopup(event);
    expect(mockModalService.open).toHaveBeenCalled();
    tick();
    expect(component.updateFichiers).toHaveBeenCalledWith([
      {
        codeEnv: 'P',
        codeFich: 'Fic',
        codeRegion: '117',
        codeApp: 'SNV2',
        codeOrg: '117',
        codeClient: 'UR117',
        libFichier: 'test',
        codeProd: '',
        refFormat: null,
        typeFormat: 'B',
        refImprime: '',
        page: 5,
        typeSig: ' ',
        codeDocument: null,
        typeSupport: 'I',
        eclatement: 0,
      },
      {
        codeEnv: 'P',
        codeFich: 'Fic',
        codeRegion: '109',
        codeApp: 'SNV2',
        codeOrg: '219',
        codeClient: 'spcc',
        libFichier: 'test',
        codeProd: '',
        refFormat: null,
        typeFormat: 'B',
        refImprime: '',
        page: 5,
        typeSig: ' ',
        codeDocument: null,
        typeSupport: 'I',
        eclatement: 0,
      },
      {
        codeEnv: 'P',
        codeFich: 'Fic',
        codeRegion: '',
        codeApp: 'SNV2',
        codeOrg: '110',
        codeClient: 'CNAV',
        libFichier: 'test',
        codeProd: '',
        refFormat: null,
        typeFormat: 'B',
        refImprime: '',
        page: 5,
        typeSig: ' ',
        codeDocument: null,
        typeSupport: 'I',
        eclatement: 0,
      },
    ]);
  }));
});
