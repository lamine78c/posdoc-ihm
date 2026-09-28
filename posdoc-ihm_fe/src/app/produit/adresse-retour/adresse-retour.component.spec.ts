import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { AdresseRetourComponent } from './adresse-retour.component';
import { DetailAdresseRetourComponent } from './detail-adresse-retour/detail-adresse-retour.component';
import { CommunicationAdresseRetourService } from './service/communication-adresse-retour.service';
import { TableauAdresseRetourService } from './service/tableau-adresse-retour.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { ModalAddAdressComponent } from './modal/modal-add-adress/modal-add-adress.component';

describe('AdresseRetourComponent', () => {
  let component: AdresseRetourComponent;
  let fixture: ComponentFixture<AdresseRetourComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauAdresseRetourService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideAdresseRetourService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockCommunicationAdresseRetourService: CommunicationAdresseRetourService;
  const mockColumnDefs = [
    {
      headerName: 'Organisme',
      field: 'codeOrganisme',
      floatingFilterComponentParams: { selectData: null },
      cellRendererParams: { selectData: null },
    },
  ];
  const mockResponseDataAllAdress = [
    {
      code: 't',
      codeOrganisme: '117',
      adresse1: 't',
      adresse2: 't',
      adresse3: 't',
      adresse4: 't',
      isNotAuthorisedToBeDeleted: false,
      fichiers: [
        {
          codeEnv: 'I',
          codeApp: 'SNV2',
          codeCom: 'ADEH',
          codeFich: 'L00',
          codeProd: 'AD16A',
          refImprime: 'AD16A03',
          libFichier: 'Appels de cotisations trimestriel                                               ',
          codeOrg: '117',
          codeAdr: 't',
          refFormat: null,
          typeFormat: 'B',
          page: 5,
          codeClient: null,
          typeMultif: '-',
          typeSupport: 'S',
          typeSig: '',
          refSupport: null,
          eclatement: 0,
          codeDocument: null,
        },
        {
          codeEnv: 'I',
          codeApp: 'MAS',
          codeCom: 'ED29',
          codeFich: 'L02',
          codeProd: 'PD24B',
          refImprime: 'PD24A09',
          libFichier: 'TABLEAUX RECAPITULATIFS ACT                                                     ',
          codeOrg: '117',
          codeAdr: 't',
          refFormat: null,
          typeFormat: 'B',
          page: 5,
          codeClient: null,
          typeMultif: '-',
          typeSupport: 'I',
          typeSig: '',
          refSupport: null,
          eclatement: 0,
          codeDocument: null,
        },
        {
          codeEnv: 'I',
          codeApp: 'MAS',
          codeCom: 'ED28',
          codeFich: 'L00',
          codeProd: 'PD24B',
          refImprime: '',
          libFichier: 'TABLEAUX RECAPITULATIFS ACT                                                     ',
          codeOrg: '117',
          codeAdr: 't',
          refFormat: null,
          typeFormat: 'B',
          page: 5,
          codeClient: null,
          typeMultif: '-',
          typeSupport: 'I',
          typeSig: '',
          refSupport: null,
          eclatement: 0,
          codeDocument: null,
        },
      ],
    },
    {
      code: 'a',
      codeOrganisme: '116',
      adresse1: 'a',
      adresse2: 'a',
      adresse3: 'a',
      adresse4: 'a',
      isNotAuthorisedToBeDeleted: true,
      fichiers: null,
    },
    {
      code: 's',
      codeOrganisme: '116',
      adresse1: 's',
      adresse2: 's',
      adresse3: 's',
      adresse4: 's',
      isNotAuthorisedToBeDeleted: false,
      fichiers: [
        {
          codeEnv: 'I',
          codeApp: 'SNV2',
          codeCom: 'ADEH',
          codeFich: 'L00',
          codeProd: 'AD16A',
          refImprime: 'AD16A03',
          libFichier: 'Appels de cotisations trimestriel                                               ',
          codeOrg: '116',
          codeAdr: 's',
          refFormat: null,
          typeFormat: 'B',
          page: 5,
          codeClient: null,
          typeMultif: '-',
          typeSupport: 'S',
          typeSig: '',
          refSupport: null,
          eclatement: 0,
          codeDocument: null,
        },

        {
          codeEnv: 'I',
          codeApp: 'MAS',
          codeCom: 'ED28',
          codeFich: 'L01',
          codeProd: '',
          refImprime: 'PD24A09',
          libFichier: 'TABLEAUX RECAPITULATIFS ACT                                                     ',
          codeOrg: '116',
          codeAdr: 's',
          refFormat: null,
          typeFormat: 'B',
          page: 5,
          codeClient: null,
          typeMultif: '-',
          typeSupport: 'I',
          typeSig: '',
          refSupport: null,
          eclatement: 0,
          codeDocument: null,
        },
        {
          codeEnv: 'P',
          codeApp: 'PNR',
          codeCom: 'ED29',
          codeFich: 'L00',
          codeProd: 'PD24A',
          refImprime: 'PD24A09',
          libFichier: 'TABLEAUX RECAPITULATIFS RG                                                      ',
          codeOrg: '116',
          codeAdr: 's',
          refFormat: null,
          typeFormat: 'B',
          page: 5,
          codeClient: null,
          typeMultif: '-',
          typeSupport: 'I',
          typeSig: '',
          refSupport: null,
          eclatement: 0,
          codeDocument: null,
        },
      ],
    },
  ];
  const mockResponseDataAllOrgs = [
    {
      code: '117',
      codeRegion: '117',
    },
    {
      code: '116',
      codeRegion: '116',
    },
  ];
  const mockResponseDataAllApps = [
    {
      code: 'SNV2',
      codeOrganisation: '117',
      codeEnvironnement: 'I',
    },
    {
      code: 'SNV2',
      codeOrganisation: '116',
      codeEnvironnement: 'I',
    },
    {
      code: 'PNR',
      codeOrganisation: '116',
      codeEnvironnement: 'P',
    },
    {
      code: 'MAS',
      codeOrganisation: '116',
      codeEnvironnement: 'I',
    },
    {
      code: 'MAS',
      codeOrganisation: '117',
      codeEnvironnement: 'I',
    },
  ];
  const mockResponse = {
    data: {
      allAdressesRetour: mockResponseDataAllAdress,
      allOrganismes: mockResponseDataAllOrgs,
      allApplications: mockResponseDataAllApps,
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseUpdateData = {
    code: 's',
    codeOrganisme: 's',
    adresse1: 's',
    adresse2: 's',
    adresse3: 's',
    adresse4: 's',
  };
  const mockResponseUpdate = {
    data: {
      updateAdresseRetour: mockResponseUpdateData,
    },
  };
  const mockResponseCreateData = [
    {
      code: 's',
      codeOrganisme: 's',
      adresse1: 's',
      adresse2: 's',
      adresse3: 's',
      adresse4: 's',
    },
    {
      code: 't',
      codeOrganisme: 't',
      adresse1: 't',
      adresse2: 't',
      adresse3: 't',
      adresse4: 't',
    },
  ];
  const mockResponseCreate = {
    data: {
      createAdressesRetour: mockResponseCreateData,
    },
  };
  const mockResponseDelete = {
    data: {
      deleteAdressesRetour: 'ok',
    },
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideAdresseRetourService', [
      'createAdressesRetour',
      'updateAdresseRetour',
      'deleteAdressesRetour',
      'getAllAdressesRetour',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockTableauService = jasmine.createSpyObj('TableauAdresseRetourService', ['getColumnDefs', 'getOverlayNoRowsTemplate', 'getDetailColumnDefs']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'forEachNode',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort',
      'applyTransaction',
      'redrawRows',
    ]);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      declarations: [AdresseRetourComponent],
      providers: [
        CommunicationAdresseRetourService,
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: ApiAdelaideAdresseRetourService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: TableauAdresseRetourService, useValue: mockTableauService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NgbModal, useValue: mockModalService },
      ],
    }).compileComponents();

    mockCommunicationAdresseRetourService = TestBed.inject(CommunicationAdresseRetourService);
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideService.getAllAdressesRetour.and.returnValue(of(mockResponse));
    mockApiAdelaideService.createAdressesRetour.and.returnValue(of(mockResponseCreate));
    mockApiAdelaideService.updateAdresseRetour.and.returnValue(of(mockResponseUpdate));
    mockApiAdelaideService.deleteAdressesRetour.and.returnValue(of(mockResponseDelete));

    fixture = TestBed.createComponent(AdresseRetourComponent);
    component = fixture.componentInstance;
    component.gridApi = mockGridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit validity', () => {
    spyOn(SharedUtil, 'getCodeRegionByCodeOrg');
    spyOn(component, 'appelServiceApi');
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(component.overlayNoRowsTemplate).toEqual('nodata');
    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(component.gridOptions.masterDetail).toBeTruthy();
    expect(component.gridOptions.detailRowAutoHeight).toBeFalsy();
    expect(component.gridOptions.detailRowHeight).toBeDefined();
    expect(component.gridOptions.detailCellRenderer).toEqual(DetailAdresseRetourComponent);

    mockCommunicationAdresseRetourService.callOtherComponentMethod();
    expect(component.appelServiceApi).toHaveBeenCalled();
  });

  it('appelServiceApi validity', () => {
    component.appelServiceApi();
    fixture.detectChanges();

    expect(mockApiAdelaideService.getAllAdressesRetour).toHaveBeenCalled();
    expect(component.nombreTotal).toBe(3);
    expect(component.organismes).toEqual(mockResponseDataAllOrgs);
    expect(component.applications).toEqual(mockResponseDataAllApps);
    expect(component.allAdressesRetourId).toEqual([
      { code: 't', codeOrganisme: '117' },
      { code: 'a', codeOrganisme: '116' },
      { code: 's', codeOrganisme: '116' },
    ]);
  });

  it('onGridReady validity', () => {
    spyOn(component, 'appelServiceApi');
    const mockGridReadyEvent = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.onGridReady(mockGridReadyEvent);
    fixture.detectChanges();

    expect(component.gridApi).toEqual(mockGridApi);
    expect(component.gridColumnApi).toEqual(mockGridApi);
    expect(component.params).toEqual(mockGridReadyEvent);
    expect(component.appelServiceApi).toHaveBeenCalled();
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

  it('openPopupAjoutEnMasse validity', () => {
    spyOn(component, 'appelServiceApi');
    const fakeModalRef = {
      componentInstance: {
        modalRef: null,
        organismes: null,
        applications: null,
        allAdressesRetourId: null,
        passEntry: of(1),
      },
    };
    mockModalService.open.and.returnValue(fakeModalRef as NgbModalRef);
    component.openPopupAjoutEnMasse();
    fixture.detectChanges();

    expect(mockModalService.open).toHaveBeenCalledWith(ModalAddAdressComponent);
    expect(fakeModalRef.componentInstance.organismes).toEqual(component.organismes);
    expect(fakeModalRef.componentInstance.applications).toEqual(component.applications);
    expect(fakeModalRef.componentInstance.allAdressesRetourId).toEqual(component.allAdressesRetourId);
    fakeModalRef.componentInstance.passEntry.subscribe(() => {
      expect(component.appelServiceApi).toHaveBeenCalled();
    });
  });

  it('onDeleteRow validity', () => {
    let event = [
      {
        codeOrganisme: 'SNV2',
        code: 'TZ43',
      },
      {
        codeOrganisme: 'SNV2',
        code: 'TP18',
      },
    ];
    spyOn(SharedUtil, 'getNumberTotalRows');
    component.onDeleteRow(event);
    fixture.detectChanges();

    expect(mockApiAdelaideService.deleteAdressesRetour).toHaveBeenCalled();
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: event });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les adresses retour ont été supprimées avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });

    event = [
      {
        codeOrganisme: 'SNV2',
        code: 'TZ43',
      },
    ];
    component.onDeleteRow(event);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: "L'adresse retour a été supprimée avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('onDeleteRow fail', () => {
    spyOn(component, 'setError');
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiAdelaideService.deleteAdressesRetour.and.returnValue(throwError(error));

    component.onDeleteRow([]);
    fixture.detectChanges();

    expect(component.setError).toHaveBeenCalled();
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    mockGridApi.getColumnDefs.and.returnValue([{ field: 'a', headerName: 'a' }]);
    mockTableauService.getDetailColumnDefs.and.returnValue([{ field: 'b', headerName: 'b' }]);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode1 = { data: { a: 'a', detail: [{ b: 'b' }, { b: '' }] } } as RowNode;
      callback(mockNode1, 0);
      const mockNode2 = { data: { a: '' } } as RowNode;
      callback(mockNode2, 1);
    });
    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalled();
  });

  it('should export data as EXCEL', () => {
    const exportEvent = { type: 'exportAsExcel' };
    mockGridApi.getColumnDefs.and.returnValue([{ field: 'a', headerName: 'a' }]);
    mockTableauService.getDetailColumnDefs.and.returnValue([{ field: 'b', headerName: 'b' }]);
    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
  });

  it('should not export data', () => {
    const exportEvent = { type: 'exportAsNull' };
    mockGridApi.getColumnDefs.and.returnValue([{ field: 'a', headerName: 'a' }]);
    mockTableauService.getDetailColumnDefs.and.returnValue([{ field: 'b', headerName: 'b' }]);
    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).not.toHaveBeenCalled();
    expect(mockGenerateFileService.generatePDFFile).not.toHaveBeenCalled();
  });

  it('on create validity', () => {
    spyOn(SharedUtil, 'getNumberTotalRows');
    spyOn(SharedUtil, 'getCodeRegionByCodeOrg');
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });
    const createRow = {
      newRow: true,
    };
    const editedRowMap = new Map([[1, createRow]]);
    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(mockApiAdelaideService.createAdressesRetour).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'L\'adresse retour "s" a été créée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('on create fail', () => {
    spyOn(component, 'setError');
    const createRow = {
      newRow: true,
    };
    const editedRowMap = new Map([[1, createRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiAdelaideService.createAdressesRetour.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.setError).toHaveBeenCalled();
  });

  it('on update validity', () => {
    const editedRowMap = new Map([[1, { code: 'a', k1: null }]]);
    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(mockApiAdelaideService.updateAdresseRetour).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'L\'adresse retour "s" a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('on update fail', () => {
    spyOn(component, 'setError');
    const editedRowMap = new Map([[1, {}]]);
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiAdelaideService.updateAdresseRetour.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.setError).toHaveBeenCalled();
  });
});
