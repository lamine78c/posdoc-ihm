import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerrouComponent } from './verrou.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauVerrouService } from './service/tableau-verrou.service';
import { ApiAdelaideVerrouService } from 'src/app/services/api-adelaide-verrou.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridOptions, GridApi } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { AddType } from '@app/models/enums/add-type';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('VerrouComponent', () => {
  let component: VerrouComponent;
  let fixture: ComponentFixture<VerrouComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauVerrouService: jasmine.SpyObj<TableauVerrouService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideVerrouService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockGridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
  };

  const mockColumnDefs = [
    { field: 'code', headerName: 'Verrou' },
    { field: 'libelle', headerName: 'Libellé' },
    { field: 'maxExecution', headerName: 'Valeur Maxi' },
  ];

  const mockVerrous = [
    { code: 'VERROU1', libelle: 'Test Verrou 1', maxExecution: 5 },
    { code: 'VERROU2', libelle: 'Test Verrou 2', maxExecution: 10 },
  ];

  beforeEach(() => {
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'createGridConfiguration',
    ]);
    mockTableauVerrouService = jasmine.createSpyObj('TableauVerrouService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideVerrouService', [
      'getAllVerrous',
      'createVerrou',
      'updateVerrou',
      'deleteVerrous',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);

    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'applyTransaction',
      'redrawRows',
      'forEachNode',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort',
    ]);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions);
    mockTableauVerrouService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauVerrouService.getOverlayNoRowsTemplate.and.returnValue('<span class="no-rows">Aucun résultat</span>');

    TestBed.configureTestingModule({
      declarations: [VerrouComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauVerrouService, useValue: mockTableauVerrouService },
        { provide: ApiAdelaideVerrouService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: NotesService, useValue: mockNoteService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerrouComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties on construction', () => {
    expect(component.addType).toBe(AddType.INLINE_ROW);
    expect(component.rowData).toEqual([]);
    expect(component.asynchronousErrors$).toBeDefined();
  });

  it('should initialize grid options and column definitions on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauVerrouService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauVerrouService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toEqual(mockGridOptions);
    expect(component.columnDefs).toEqual(mockColumnDefs);
    expect(component.overlayNoRowsTemplate).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should load verrous on grid ready', () => {
    const mockResponse = { data: { allVerrous: mockVerrous }, loading: false, networkStatus: 7 };
    mockApiAdelaideService.getAllVerrous.and.returnValue(of(mockResponse as any));

    const gridReadyEvent = { api: mockGridApi } as any;

    component.onGridReady(gridReadyEvent);

    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiAdelaideService.getAllVerrous).toHaveBeenCalled();
    expect(component.rowData).toEqual(mockVerrous);
    expect(component.nombreVerrouTotal).toBe(2);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should create a new verrou successfully', () => {
    const newVerrou = {
      code: 'VERROU3',
      libelle: 'New Verrou',
      maxExecution: 15,
      newRow: true,
      nullField: null,
    };
    const editedRow = new Map([[0, newVerrou]]);
    const mockResponse = { data: { createVerrou: { code: 'VERROU3' } } };

    mockApiAdelaideService.createVerrou.and.returnValue(of(mockResponse));
    spyOn(SharedUtil, 'getNumberTotalRows').and.returnValue(3);
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow as any);

    expect(mockApiAdelaideService.createVerrou).toHaveBeenCalledWith({
      code: 'VERROU3',
      libelle: 'New Verrou',
      maxExecution: 15,
    });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Le verrou VERROU3 a été avec créé succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(mockGridApi.forEachNode).toHaveBeenCalled();
    expect(component.nombreVerrouTotal).toBe(3);
  });

  it('should handle error when creating a new verrou', () => {
    const newVerrou = {
      code: 'VERROU3',
      libelle: 'New Verrou',
      maxExecution: 15,
      newRow: true,
    };
    const editedRow = new Map([[0, newVerrou]]);
    const mockError = {
      graphQLErrors: [{ message: 'Le verrou existe déjà' }],
    };

    mockApiAdelaideService.createVerrou.and.returnValue(throwError(mockError));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow as any);

    expect(mockApiAdelaideService.createVerrou).toHaveBeenCalled();
    expect(newVerrou.newRow).toBe(true);
    expect(mockNoteService.show).not.toHaveBeenCalled();

    component.asynchronousErrors$.subscribe(errors => {
      expect(errors).not.toBeNull();
      expect(errors.has(1)).toBe(true);
      expect(errors.get(1)[0].message).toBe('Le verrou existe déjà');
    });
  });

  it('should update an existing verrou successfully', () => {
    const existingVerrou = {
      code: 'VERROU1',
      libelle: 'Updated Verrou',
      maxExecution: 20,
      nullField: null,
    };
    const editedRow = new Map([[0, existingVerrou]]);
    const mockResponse = { data: { updateVerrou: { code: 'VERROU1' } } };

    mockApiAdelaideService.updateVerrou.and.returnValue(of(mockResponse));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow as any);

    expect(mockApiAdelaideService.updateVerrou).toHaveBeenCalledWith({
      code: 'VERROU1',
      libelle: 'Updated Verrou',
      maxExecution: 20,
    });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Le verrou VERROU1 a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle error when updating an existing verrou', () => {
    const existingVerrou = {
      code: 'VERROU1',
      libelle: 'Updated Verrou',
      maxExecution: 20,
    };
    const editedRow = new Map([[0, existingVerrou]]);
    const mockError = {
      graphQLErrors: [{ message: 'Erreur de mise à jour' }],
    };

    mockApiAdelaideService.updateVerrou.and.returnValue(throwError(mockError));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow as any);

    expect(mockApiAdelaideService.updateVerrou).toHaveBeenCalled();
    expect(mockNoteService.show).not.toHaveBeenCalled();

    component.asynchronousErrors$.subscribe(errors => {
      expect(errors).not.toBeNull();
      expect(errors.has(1)).toBe(true);
      expect(errors.get(1)[0].message).toBe('Erreur de mise à jour');
    });
  });

  it('should delete a single verrou successfully', () => {
    const verrouToDelete = [{ code: 'VERROU1' }];
    const mockResponse = { data: {} };

    mockApiAdelaideService.deleteVerrous.and.returnValue(of(mockResponse));
    spyOn(SharedUtil, 'getNumberTotalRows').and.returnValue(1);
    component.gridApi = mockGridApi;

    component.onDeleteRow(verrouToDelete);

    expect(mockApiAdelaideService.deleteVerrous).toHaveBeenCalledWith(['VERROU1']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: verrouToDelete });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Le verrou a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(component.nombreVerrouTotal).toBe(1);
  });

  it('should delete multiple verrous successfully', () => {
    const verrousToDelete = [{ code: 'VERROU1' }, { code: 'VERROU2' }];
    const mockResponse = { data: {} };

    mockApiAdelaideService.deleteVerrous.and.returnValue(of(mockResponse));
    spyOn(SharedUtil, 'getNumberTotalRows').and.returnValue(0);
    component.gridApi = mockGridApi;

    component.onDeleteRow(verrousToDelete);

    expect(mockApiAdelaideService.deleteVerrous).toHaveBeenCalledWith(['VERROU1', 'VERROU2']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: verrousToDelete });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Les verrous  ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(component.nombreVerrouTotal).toBe(0);
  });

  it('should handle error when deleting verrous', () => {
    const verrousToDelete = [{ code: 'VERROU1' }];
    const mockError = {
      graphQLErrors: [{ message: 'Impossible de supprimer le verrou' }],
    };

    mockApiAdelaideService.deleteVerrous.and.returnValue(throwError(mockError));
    component.gridApi = mockGridApi;

    component.onDeleteRow(verrousToDelete);

    expect(mockApiAdelaideService.deleteVerrous).toHaveBeenCalled();
    expect(mockGridApi.applyTransaction).not.toHaveBeenCalled();
    expect(mockNoteService.show).not.toHaveBeenCalled();

    component.asynchronousErrors$.subscribe(errors => {
      expect(errors).not.toBeNull();
      expect(errors.has(1)).toBe(true);
      expect(errors.get(1)[0].message).toBe('Impossible de supprimer le verrou');
    });
  });

  it('should add error to existing error map in setError', () => {
    const errors = new Map();
    const error1 = { isError: true, message: 'Error 1', id: null };
    const error2 = { isError: true, message: 'Error 2', id: null };

    component.setError(1, error1, errors);
    component.setError(1, error2, errors);

    expect(errors.has(1)).toBe(true);
    expect(errors.get(1).length).toBe(2);
    expect(errors.get(1)[0]).toEqual(error1);
    expect(errors.get(1)[1]).toEqual(error2);
  });

  it('should export data as PDF', () => {
    component.gridApi = mockGridApi;
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);

    const mockNodes = mockVerrous.map(data => ({ data }));
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: any) => {
      mockNodes.forEach(node => callback(node));
    });

    const exportEvent = { type: 'exportAsPDF' };
    component.export(exportEvent);

    expect(mockGridApi.getColumnDefs).toHaveBeenCalled();
    expect(mockGridApi.forEachNodeAfterFilterAndSort).toHaveBeenCalled();
    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [
        ['VERROU1', 'Test Verrou 1', 5],
        ['VERROU2', 'Test Verrou 2', 10],
      ],
      ['Verrou', 'Libellé', 'Valeur Maxi'],
      'Liste des verrous'
    );
  });

  it('should export data as Excel', () => {
    component.gridApi = mockGridApi;
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);

    const mockNodes = mockVerrous.map(data => ({ data }));
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: any) => {
      mockNodes.forEach(node => callback(node));
    });

    const exportEvent = { type: 'exportAsExcel' };
    component.export(exportEvent);

    expect(mockGridApi.getColumnDefs).toHaveBeenCalled();
    expect(mockGridApi.forEachNodeAfterFilterAndSort).toHaveBeenCalled();
    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [
        ['VERROU1', 'Test Verrou 1', 5],
        ['VERROU2', 'Test Verrou 2', 10],
      ],
      ['Verrou', 'Libellé', 'Valeur Maxi'],
      'Liste des verrous'
    );
  });
});
