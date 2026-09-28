import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ServiceComponent } from './service.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauServicePosdocService } from './service/tableau-service.service';
import { ApiAdelaideServicePosdocService } from '@app/services/api-adelaide/admin/service/api-adelaide-service.service';
import { of, throwError } from 'rxjs';

describe('ServiceComponent', () => {
  let component: ServiceComponent;
  let fixture: ComponentFixture<ServiceComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauServicePosdocService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideServicePosdocService>;

  const mockResponse = {
    data: {
      findAllServices: [
        {
          id: 1,
          libelle: 'SERV1',
          url: 'https://testtesttesttesttesttesttesttesttesttesttesttesttesttesttest.fr',
          createdAt: '2025-11-28T11:11:11',
          updatedAt: '2025-11-29T12:11:11',
          createdBy: 'AC750G0092',
          updatedBy: 'AC750G0092',
        },
        {
          id: 2,
          libelle: 'SERV2',
          url: 'https://testtesttesttettesttesttesttest.fr',
          createdAt: '2025-11-28T11:11:11',
          updatedAt: '2025-11-29T12:11:11',
          createdBy: 'AC750G0092',
          updatedBy: 'AC750G0092',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauService = jasmine.createSpyObj('TableauServicePosdocService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiService = jasmine.createSpyObj('ApiAdelaideServicePosdocService', ['getAllServices', 'createService', 'updateService', 'deleteServices']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'forEachNode',
      'applyTransaction',
      'redrawRows',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort',
    ]);

    TestBed.configureTestingModule({
      declarations: [ServiceComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigService },
        { provide: TableauServicePosdocService, useValue: mockTableauService },
        { provide: ApiAdelaideServicePosdocService, useValue: mockApiService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue([]);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiService.getAllServices.and.returnValue(of(mockResponse));

    fixture = TestBed.createComponent(ServiceComponent);
    component = fixture.componentInstance;
    component.gridApi = mockGridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucun résultat</span>');
  });

  it('should load data on grid ready', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady',
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiService.getAllServices).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.nombreServicesTotal).toBe(2);
  });

  it('should export data as PDF', () => {
    const mockColumnDefs = [
      { field: 'libelle', headerName: 'Libellé' },
      { field: 'url', headerName: 'Url' },
    ];
    const exportEvent = { type: 'exportAsPDF' };
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { libelle: 'serv1', url: 'http://ss.fr' } } as RowNode;
      callback(mockNode, 0);
    });

    component.export(exportEvent);

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith([['serv1', 'http://ss.fr']], ['Libellé', 'Url'], 'Liste des services');
  });

  it('should export data as Excel', () => {
    const mockColumnDefs = [
      { field: 'libelle', headerName: 'Libellé' },
      { field: 'url', headerName: 'Url' },
    ];
    const exportEvent = { type: 'exportAsExcel' };
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { libelle: 'serv1', url: 'http://ss.fr' } } as RowNode;
      callback(mockNode, 0);
    });

    component.export(exportEvent);

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
  });

  it('should create new row successfully', () => {
    const rowToCreate = {
      libelle: 'test',
      url: 'http://',
      newRow: true,
    };
    const data: any = [
      {
        id: 1,
        libelle: 'test',
        url: 'http://',
      },
    ];
    const editedRowMap = new Map([[1, rowToCreate]]);
    const createResponse = {
      data: { createServicePosdoc: data },
      loading: false,
      networkStatus: 7,
    };

    mockApiService.createService.and.returnValue(of(createResponse));
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });

    component.onSaveEdition(editedRowMap);

    expect(mockApiService.createService).toHaveBeenCalledWith({
      libelle: 'test',
      url: 'http://',
    });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le service a été ajoutée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle create error', () => {
    const rowToCreate = {
      libelle: 'test',
      url: 'http://',
      newRow: true,
    };
    const editedRowMap = new Map([[1, rowToCreate]]);
    const messageError = 'Erreur de la création';
    mockApiService.createService.and.returnValue(throwError(() => ({ graphQLErrors: [{ message: messageError }] })));

    component.onSaveEdition(editedRowMap);

    expect(component.asynchronousErrors$.value).not.toBeNull();
    expect(component.asynchronousErrors$.value.get(1)).toEqual([
      {
        isError: true,
        message: messageError,
        id: null,
      },
    ]);
  });

  it('should update row successfully', () => {
    const rowToUpdate = {
      id: 1,
      libelle: 'test',
      url: 'http://',
    };
    const data: any = [rowToUpdate];
    const editedRowMap = new Map([[1, rowToUpdate]]);
    const updateResponse = {
      data: { updateServicePosdoc: data },
      loading: false,
      networkStatus: 7,
    };
    mockApiService.updateService.and.returnValue(of(updateResponse));
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });

    component.onSaveEdition(editedRowMap);

    expect(mockApiService.updateService).toHaveBeenCalledWith({ libelle: 'test', url: 'http://', id: 1 });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le service a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle update error', () => {
    const rowToUpdate = {
      id: 1,
      libelle: 'test',
      url: 'http://',
    };
    const editedRowMap = new Map([[1, rowToUpdate]]);
    const messageError = 'Erreur de la modification';
    mockApiService.updateService.and.returnValue(throwError(() => ({ graphQLErrors: [{ message: messageError }] })));

    component.onSaveEdition(editedRowMap);

    expect(component.asynchronousErrors$.value).not.toBeNull();
    expect(component.asynchronousErrors$.value.get(1)).toEqual([
      {
        isError: true,
        message: messageError,
        id: null,
      },
    ]);
  });

  it('should handle url error', () => {
    const rowToUpdate = {
      id: 1,
      libelle: 'test',
      url: 'httsp://',
    };
    const editedRowMap = new Map([[1, rowToUpdate]]);

    component.onSaveEdition(editedRowMap);

    expect(component.asynchronousErrors$.value).not.toBeNull();
    expect(component.asynchronousErrors$.value.get(1)).toEqual([
      {
        isError: true,
        message: "L'Url doit commencer par http:// ou https://",
        id: null,
      },
    ]);
  });

  it('should delete row successfully', () => {
    const rowToDelete = [
      {
        id: 1,
        libelle: 'test',
        url: 'http://',
      },
    ];

    mockApiService.deleteServices.and.returnValue(of({}));

    component.onDeleteRow(rowToDelete);

    expect(mockApiService.deleteServices).toHaveBeenCalledWith(['1']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: rowToDelete });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le service a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should delete rows successfully', () => {
    const rowToDelete = [
      {
        id: 1,
        libelle: 'test',
        url: 'http://',
      },
      {
        id: 2,
        libelle: 'test2',
        url: 'http://',
      },
    ];

    mockApiService.deleteServices.and.returnValue(of({}));

    component.onDeleteRow(rowToDelete);

    expect(mockApiService.deleteServices).toHaveBeenCalledWith(['1', '2']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: rowToDelete });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les services ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle delete error', () => {
    const rowToDelete = [
      {
        id: 1,
        libelle: 'test',
        url: 'http://',
      },
    ];
    const messageError = 'Erreur de la suppression';
    mockApiService.deleteServices.and.returnValue(throwError(() => ({ graphQLErrors: [{ message: messageError }] })));

    component.onDeleteRow(rowToDelete);

    expect(component.asynchronousErrors$.value).not.toBeNull();
    expect(component.asynchronousErrors$.value.get(1)).toEqual([
      {
        isError: true,
        message: messageError,
        id: null,
      },
    ]);
  });
});
