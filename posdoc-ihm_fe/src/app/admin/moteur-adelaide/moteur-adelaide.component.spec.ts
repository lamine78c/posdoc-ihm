import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MoteurAdelaideComponent } from './moteur-adelaide.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauParamsAdelaideService } from './service/tableau-params-adelaide.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { of, throwError } from 'rxjs';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AddType } from '@app/models/enums/add-type';
import { ApolloQueryResult } from '@apollo/client/core';

describe('MoteurAdelaideComponent', () => {
  let component: MoteurAdelaideComponent;
  let fixture: ComponentFixture<MoteurAdelaideComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauParamsAdelaideService: jasmine.SpyObj<TableauParamsAdelaideService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideParametreService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockParamsData: ApolloQueryResult<any> = {
    data: {
      allParametres: [
        { code: 'PARAM1', valeur: 'valeur1', description: 'desc1' },
        { code: 'PARAM2', valeur: 'valeur2', description: 'desc2' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauParamsAdelaideService = jasmine.createSpyObj('TableauParamsAdelaideService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideParametreService', ['getAllParamsAdelaide', 'createParamAdelaide', 'updateParamAdelaide', 'deleteParamAdelaide']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);

    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'forEachNode',
      'applyTransaction',
      'redrawRows',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort'
    ]);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauParamsAdelaideService.getColumnDefs.and.returnValue([]);
    mockTableauParamsAdelaideService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucune donnée</span>');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [MoteurAdelaideComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauParamsAdelaideService, useValue: mockTableauParamsAdelaideService },
        { provide: ApiAdelaideParametreService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoteurAdelaideComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    fixture.detectChanges();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalled();
    expect(mockTableauParamsAdelaideService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauParamsAdelaideService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucune donnée</span>');
  });

  it('should set addType to INLINE_ROW', () => {
    expect(component.addType).toBe(AddType.INLINE_ROW);
  });

  // Test 4 : Chargement des données au onGridReady
  it('should load data on grid ready', () => {
    mockApiAdelaideService.getAllParamsAdelaide.and.returnValue(of(mockParamsData));
    component.gridApi = mockGridApi;

    const gridReadyEvent = {
      api: mockGridApi,
      context: undefined,
      type: 'gridReady'
    } as unknown as GridReadyEvent;
    component.onGridReady(gridReadyEvent);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiAdelaideService.getAllParamsAdelaide).toHaveBeenCalled();
    expect(component.rowData).toEqual(mockParamsData.data.allParametres);
    expect(component.nombreParamAdelaideTotal).toBe(2);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should create new parameter successfully', () => {
    const newParam = { code: 'NEW_PARAM', valeur: 'new_value', description: 'new desc', newRow: true };
    const editedRow = new Map([[0, newParam]]);
    const createResponse = { data: { createParametre: { code: 'NEW_PARAM' } } };

    mockApiAdelaideService.createParamAdelaide.and.returnValue(of(createResponse));
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.stub();

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.createParamAdelaide).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le paramètre Adélaïde "NEW_PARAM" a été créé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle error when creating new parameter', () => {
    const newParam = { code: 'NEW_PARAM', valeur: 'new_value', newRow: true };
    const editedRow = new Map([[0, newParam]]);
    const errorResponse = { graphQLErrors: [{ message: 'Erreur de création' }] };

    mockApiAdelaideService.createParamAdelaide.and.returnValue(throwError(errorResponse));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.createParamAdelaide).toHaveBeenCalled();
    expect(newParam.newRow).toBe(true);
    component.asynchronousErrors$.subscribe(errors => {
      expect(errors).toBeDefined();
      expect(errors.get(1)).toBeDefined();
      expect(errors.get(1)[0].message).toBe('Erreur de création');
    });
  });

  it('should update existing parameter successfully', () => {
    const existingParam = { code: 'PARAM1', valeur: 'updated_value', description: 'updated desc' };
    const editedRow = new Map([[0, existingParam]]);
    const updateResponse = { data: { updateParametre: { code: 'PARAM1' } } };

    mockApiAdelaideService.updateParamAdelaide.and.returnValue(of(updateResponse));

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.updateParamAdelaide).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le paramètre Adélaïde "PARAM1" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle error when updating parameter', () => {
    const existingParam = { code: 'PARAM1', valeur: 'updated_value' };
    const editedRow = new Map([[0, existingParam]]);
    const errorResponse = { graphQLErrors: [{ message: 'Erreur de mise à jour' }] };

    mockApiAdelaideService.updateParamAdelaide.and.returnValue(throwError(errorResponse));

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.updateParamAdelaide).toHaveBeenCalled();
    component.asynchronousErrors$.subscribe(errors => {
      if (errors) {
        expect(errors.get(1)).toBeDefined();
        expect(errors.get(1)[0].message).toBe('Erreur de mise à jour');
      }
    });
  });

  it('should delete single parameter successfully', () => {
    const paramsToDelete = [{ code: 'PARAM1' }];

    mockApiAdelaideService.deleteParamAdelaide.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onDeleteRow(paramsToDelete);

    expect(mockApiAdelaideService.deleteParamAdelaide).toHaveBeenCalledWith(['PARAM1']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: paramsToDelete });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le paramètre Adelaïde a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete multiple parameters successfully', () => {
    const paramsToDelete = [{ code: 'PARAM1' }, { code: 'PARAM2' }];

    mockApiAdelaideService.deleteParamAdelaide.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onDeleteRow(paramsToDelete);

    expect(mockApiAdelaideService.deleteParamAdelaide).toHaveBeenCalledWith(['PARAM1', 'PARAM2']);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les paramètres Adelaïde ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle error when deleting parameters', () => {
    const paramsToDelete = [{ code: 'PARAM1' }];
    const errorResponse = { graphQLErrors: [{ message: 'Erreur de suppression' }] };

    mockApiAdelaideService.deleteParamAdelaide.and.returnValue(throwError(errorResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(paramsToDelete);

    expect(mockApiAdelaideService.deleteParamAdelaide).toHaveBeenCalled();
    component.asynchronousErrors$.subscribe(errors => {
      if (errors) {
        expect(errors.get(1)).toBeDefined();
        expect(errors.get(1)[0].message).toBe('Erreur de suppression');
      }
    });
  });

  it('should export data as PDF', () => {
    component.gridApi = mockGridApi;
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'valeur', headerName: 'Valeur' }
    ];
    const mockData = [
      { code: 'PARAM1', valeur: 'valeur1' },
      { code: 'PARAM2', valeur: 'valeur2' }
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach((data, index) => callback({ data } as any, index));
    });

    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalled();
    const args = mockGenerateFileService.generatePDFFile.calls.argsFor(0);
    expect(args[1]).toEqual(['Code', 'Valeur']);
    expect(args[2]).toBe('Liste des paramètres du moteur Adelaïde');
  });

  it('should export data as Excel', () => {
    component.gridApi = mockGridApi;
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'valeur', headerName: 'Valeur' }
    ];
    const mockData = [
      { code: 'PARAM1', valeur: 'valeur1' }
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach((data, index) => callback({ data } as any, index));
    });

    component.export({ type: 'exportAsExcel' });

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
    const args = mockGenerateFileService.generateExcelFile.calls.argsFor(0);
    expect(args[1]).toEqual(['Code', 'Valeur']);
    expect(args[2]).toBe('Liste des paramètres du moteur Adelaïde');
  });


  it('should add errors correctly with setError method', () => {
    const errors = new Map();
    const error1 = { isError: true, message: 'Erreur 1', id: null };
    const error2 = { isError: true, message: 'Erreur 2', id: null };

    component.setError(1, error1, errors);
    expect(errors.get(1)).toEqual([error1]);

    component.setError(1, error2, errors);
    expect(errors.get(1)).toEqual([error1, error2]);
    expect(errors.get(1).length).toBe(2);
  });
});
