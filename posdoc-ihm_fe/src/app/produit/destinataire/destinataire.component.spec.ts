import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApolloQueryResult } from '@apollo/client/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { of, throwError } from 'rxjs';

import { ApiAdelaideDestinataireService } from '@app/services/api-adelaide-destinataire.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DestinataireComponent } from './destinataire.component';
import { TableauDestinataireService } from './service/tableau-destinataire.service';

describe('DestinataireComponent', () => {
  let component: DestinataireComponent;
  let fixture: ComponentFixture<DestinataireComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauDestinataireService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideDestinataireService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  const mockData: ApolloQueryResult<any> = {
    data: {
      allDestinataires: [
        {
          code: 'testA',
          codeOrg: '117',
          libelle: 'test',
          refPri: '',
          isNotAuthorisedToBeDeleted: true,
        },
        {
          code: 'testB',
          codeOrg: '117',
          libelle: 'test',
          refPri: '',
          isNotAuthorisedToBeDeleted: true,
        },
      ],
      allOrganismes: [
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
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockColumnDefs = [{ headerName: 'Organisme', field: 'codeOrg', floatingFilterComponentParams: { selectData: null } }];

  beforeEach(waitForAsync(() => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show', 'removeAllStatic']);
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const apiAdelaideSpy = jasmine.createSpyObj('ApiAdelaideDestinataireService', [
      'getAllDestinataires',
      'createDestinataires',
      'updateDestinataire',
      'deleteDestinataires',
    ]);
    const generateFileSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const tableauGammeSpy = jasmine.createSpyObj('TableauDestinataireService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    const gridApiSpy = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'applyTransaction',
      'redrawRows',
      'forEachNode',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort',
    ]);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      declarations: [DestinataireComponent],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: ApiAdelaideDestinataireService, useValue: apiAdelaideSpy },
        { provide: GenerateFileService, useValue: generateFileSpy },
        { provide: TableauDestinataireService, useValue: tableauGammeSpy },
        { provide: PermissionService, useValue: permissionSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
      ],
    }).compileComponents();

    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaideDestinataireService) as jasmine.SpyObj<ApiAdelaideDestinataireService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockTableauService = TestBed.inject(TableauDestinataireService) as jasmine.SpyObj<TableauDestinataireService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockGridApi = gridApiSpy;
    mockModalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideService.getAllDestinataires.and.returnValue(of(mockData));
    fixture = TestBed.createComponent(DestinataireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize grid options and column definitions on ngOnInit', () => {
    fixture.detectChanges();
    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('nodata');
  });

  it('should set correct permission properties', () => {
    fixture.detectChanges();
    expect(component.canAddPermPosition).toBe(AUTH.FICHIER_EDITION.DESTINATAIRES[KEY_AJOUTER_AUTH]);
    expect(component.canRemovePermPosition).toBe(AUTH.FICHIER_EDITION.DESTINATAIRES[KEY_SUPPRIMER_AUTH]);
    expect(component.addType).toBe(AddType.INLINE_ROW);
  });

  it('should load data on grid ready', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent;

    component.onGridReady(mockParams);
    fixture.detectChanges();

    expect(mockApiAdelaideService.getAllDestinataires).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.nombreTotal).toBe(2);
  });

  it('should update existing row successfully', () => {
    const updateRow = {
      code: 'DEST',
      codeOrg: '117',
      libelle: 'TEST',
      refPri: 'abc',
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const updateResponse: ApolloQueryResult<any> = {
      data: { updateDestinataire: updateRow },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.updateDestinataire.and.returnValue(of(updateResponse));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le destinataire DEST a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle update error', () => {
    const updateRow = {
      code: 'DEST',
      codeOrg: '117',
      libelle: 'TEST',
      refPri: false,
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de la modification' }] };
    mockApiAdelaideService.updateDestinataire.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should delete single row successfully', () => {
    const singleDeleteDTO = [
      {
        code: 'DEST',
        codeOrg: '117',
        libelle: 'TEST',
        refPri: false,
      },
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deleteDestinataires: true },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deleteDestinataires.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(singleDeleteDTO);
    fixture.detectChanges();

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: singleDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le destinataire a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });

    const multiDeleteDTO = [
      {
        code: 'DEST',
        codeOrg: '117',
        libelle: 'TEST',
        refPri: false,
      },
      {
        code: 'DESB',
        codeOrg: '116',
        libelle: 'TESB',
        refPri: false,
      },
    ];
    component.onDeleteRow(multiDeleteDTO);

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: multiDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les destinataires ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should delete multi row successfully', () => {
    const multiDeleteDTO = [
      {
        code: 'DEST',
        codeOrg: '117',
        libelle: 'TEST',
        refPri: false,
      },
      {
        code: 'DESB',
        codeOrg: '116',
        libelle: 'TESB',
        refPri: false,
      },
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deleteDestinataires: true },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deleteDestinataires.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;
    component.onDeleteRow(multiDeleteDTO);
    fixture.detectChanges();

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: multiDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les destinataires ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle delete error', () => {
    const singleDeleteDTO = [
      {
        code: 'DESB',
        codeOrg: '116',
        libelle: 'TESB',
        refPri: false,
      },
    ];
    const error = { graphQLErrors: [{ message: 'Erreur de la suppression' }] };
    mockApiAdelaideService.deleteDestinataires.and.returnValue(throwError(error));

    component.onDeleteRow(singleDeleteDTO);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    const mockColumnDefs = [
      { headerName: 'Destinataire', field: 'code' },
      { headerName: 'Organisme', field: 'codeOrg' },
    ];
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { code: 'DEST', codeOrg: '' } } as RowNode;
      callback(mockNode, 0);
    });
    component.gridApi = mockGridApi;

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalled();
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    const mockColumnDefs = [
      { headerName: 'Destinataire', field: 'code' },
      { headerName: 'Organisme', field: 'codeOrg' },
    ];
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { code: 'DEST', codeOrg: '' } } as RowNode;
      callback(mockNode, 0);
    });
    component.gridApi = mockGridApi;

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
  });

  it('should properly set errors in asynchronousErrors$', () => {
    const errors = new Map();
    const error = { isError: true, message: 'Test error', id: null };

    component.setError(1, error, errors);

    expect(errors.get(1)).toEqual([error]);

    // Test adding another error to same key
    const error2 = { isError: true, message: 'Test error 2', id: null };
    component.setError(1, error2, errors);

    expect(errors.get(1)).toEqual([error, error2]);
  });

  it('should open popup and call communication service on success', () => {
    const mockModalRef = {
      componentInstance: {
        organismes: null,
        title: '',
        passEntry: of(1),
      },
    };
    mockModalService.open.and.returnValue(mockModalRef as any);
    component.openPopup({});
  });
});
