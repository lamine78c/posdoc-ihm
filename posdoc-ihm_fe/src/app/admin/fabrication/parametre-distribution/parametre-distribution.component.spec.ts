import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { ParametreDistributionComponent } from './parametre-distribution.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauParametreDistributionService } from './service/tableau-parametre-distribution.service';
import { ApiAdelaideParamDistriService } from '@app/services/api-adelaide-param-distri.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent } from 'ag-grid-community';

describe('ParametreDistributionComponent', () => {
  let component: ParametreDistributionComponent;
  let fixture: ComponentFixture<ParametreDistributionComponent>;
  let mockTableauConfigurationBuilder: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauParamDistriService: jasmine.SpyObj<TableauParametreDistributionService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideParamDistriService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockParametresDistribution = [
    { reference: 'PARAM001', libelle: 'Test Param 1', actif: true },
    { reference: 'PARAM002', libelle: 'Test Param 2', actif: false }
  ];

  beforeEach(waitForAsync(() => {
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const tableauParamSpy = jasmine.createSpyObj('TableauParametreDistributionService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const apiSpy = jasmine.createSpyObj('ApiAdelaideParamDistriService', ['getAllParamDistri', 'deleteParamDistris', 'createParamDistri', 'updateParamDistri']);
    const generateFileSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const notesSpy = jasmine.createSpyObj('NotesService', ['show']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    const gridApiSpy = jasmine.createSpyObj('GridApi', [
      'setGridOption', 'applyTransaction', 'redrawRows', 'forEachNode', 'getColumnDefs', 'forEachNodeAfterFilterAndSort'
    ]);

    TestBed.configureTestingModule({
      declarations: [ParametreDistributionComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: TableauParametreDistributionService, useValue: tableauParamSpy },
        { provide: ApiAdelaideParamDistriService, useValue: apiSpy },
        { provide: GenerateFileService, useValue: generateFileSpy },
        { provide: NotesService, useValue: notesSpy },
        { provide: PermissionService, useValue: permissionSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    mockTableauConfigurationBuilder = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockTableauParamDistriService = TestBed.inject(TableauParametreDistributionService) as jasmine.SpyObj<TableauParametreDistributionService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaideParamDistriService) as jasmine.SpyObj<ApiAdelaideParamDistriService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockGridApi = gridApiSpy;
  }));

  beforeEach(() => {
    // Configuration des mocks avant la création du composant
    mockTableauConfigurationBuilder.createGridConfiguration.and.returnValue({});
    mockTableauParamDistriService.getColumnDefs.and.returnValue([]);
    mockTableauParamDistriService.getOverlayNoRowsTemplate.and.returnValue('Aucun résultat');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    fixture = TestBed.createComponent(ParametreDistributionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    const expectedGridOptions = { masterDetail: true, detailRowAutoHeight: false };
    mockTableauConfigurationBuilder.createGridConfiguration.and.returnValue(expectedGridOptions);

    component.ngOnInit();

    expect(mockTableauConfigurationBuilder.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(component.gridOptions.masterDetail).toBe(true);
    expect(component.gridOptions.detailRowAutoHeight).toBe(false);
    expect(component.gridOptions.detailRowHeight).toBe(122);
    expect(component.gridOptions.detailCellRenderer).toBe('detailsParamDistrComponent');
  });

  it('should load data on grid ready', () => {
    const mockApolloResult: ApolloQueryResult<any> = {
      data: {
        allParametresDistribution: mockParametresDistribution
      },
      loading: false,
      networkStatus: 7
    };
    mockApiAdelaideService.getAllParamDistri.and.returnValue(of(mockApolloResult));
    component.gridApi = mockGridApi;

    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(mockApiAdelaideService.getAllParamDistri).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
    expect(component.rowData).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ reference: 'PARAM001', collapse: '' }),
      jasmine.objectContaining({ reference: 'PARAM002', collapse: '' })
    ]));
    expect(component.nombreParamDitributionTotal).toBe(2);
  });

  it('should delete single parameter successfully', () => {
    const parametreToDelete = [{ reference: 'PARAM001', libelle: 'Test Param 1' }];
    const mockApolloResult: ApolloQueryResult<any> = {
      data: { deleteParametreDistribution: true },
      loading: false,
      networkStatus: 7
    };
    mockApiAdelaideService.deleteParamDistris.and.returnValue(of(mockApolloResult));
    component.gridApi = mockGridApi;

    component.onDeleteRow(parametreToDelete);

    expect(mockApiAdelaideService.deleteParamDistris).toHaveBeenCalledWith(['PARAM001']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: parametreToDelete });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le paramètre de distribution a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete multiple parameters successfully', () => {
    const parametresToDelete = [
      { reference: 'PARAM001', libelle: 'Test Param 1' },
      { reference: 'PARAM002', libelle: 'Test Param 2' }
    ];
    const mockApolloResult: ApolloQueryResult<any> = {
      data: { deleteParametreDistribution: true },
      loading: false,
      networkStatus: 7
    };
    mockApiAdelaideService.deleteParamDistris.and.returnValue(of(mockApolloResult));
    component.gridApi = mockGridApi;

    component.onDeleteRow(parametresToDelete);

    expect(mockApiAdelaideService.deleteParamDistris).toHaveBeenCalledWith(['PARAM001', 'PARAM002']);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les paramètres de distribution ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle delete error and set asynchronous errors', () => {
    const parametreToDelete = [{ reference: 'PARAM001' }];
    const errorResponse = {
      graphQLErrors: [{ message: 'Erreur lors de la suppression' }]
    };
    mockApiAdelaideService.deleteParamDistris.and.returnValue(throwError(errorResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(parametreToDelete);

    expect(mockApiAdelaideService.deleteParamDistris).toHaveBeenCalled();
    expect(component.asynchronousErrors$.value).not.toBeNull();
    expect(component.asynchronousErrors$.value.get(1)).toEqual([{
      isError: true,
      message: 'Erreur lors de la suppression',
      id: null
    }]);
  });

  it('should create new parameter successfully', () => {
    const newParameter = {
      reference: 'NEW001',
      libelle: 'Nouveau paramètre',
      newRow: true,
      collapse: ''
    };
    const editedRow = [[0, newParameter]];
    const mockApolloResult: ApolloQueryResult<any> = {
      data: {
        createParametreDistribution: { reference: 'NEW001' }
      },
      loading: false,
      networkStatus: 7
    };
    mockApiAdelaideService.createParamDistri.and.returnValue(of(mockApolloResult));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.createParamDistri).toHaveBeenCalledWith(jasmine.objectContaining({
      reference: 'NEW001',
      libelle: 'Nouveau paramètre'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le paramètre de distribution NEW001 a été créé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should update existing parameter successfully', () => {
    const existingParameter = {
      reference: 'PARAM001',
      libelle: 'Paramètre modifié',
      collapse: ''
    };
    const editedRow = [[0, existingParameter]];
    const mockApolloResult: ApolloQueryResult<any> = {
      data: {
        updateParametreDistribution: { reference: 'PARAM001' }
      },
      loading: false,
      networkStatus: 7
    };
    mockApiAdelaideService.updateParamDistri.and.returnValue(of(mockApolloResult));

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.updateParamDistri).toHaveBeenCalledWith(jasmine.objectContaining({
      reference: 'PARAM001',
      libelle: 'Paramètre modifié'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le paramètre de distribution PARAM001 a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const mockColumnDefs = [
      { field: 'reference', headerName: 'Référence' },
      { field: 'libelle', headerName: 'Libellé' }
    ];
    const mockData = [
      { reference: 'PARAM001', libelle: 'Test Param 1' }
    ];

    component.gridApi = mockGridApi;
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback({ data: mockData[0] } as any, 0);
    });

    const exportEvent = { type: 'exportAsPDF' };

    component.export(exportEvent);

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['PARAM001', 'Test Param 1']],
      ['Référence', 'Libellé'],
      'Liste des paramètres de distribution'
    );
  });

  it('should export data as Excel', () => {
    const mockColumnDefs = [
      { field: 'reference', headerName: 'Référence' },
      { field: 'libelle', headerName: 'Libellé' }
    ];
    const mockData = [
      { reference: 'PARAM001', libelle: 'Test Param 1' }
    ];

    component.gridApi = mockGridApi;
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback({ data: mockData[0] } as any, 0);
    });

    const exportEvent = { type: 'exportAsExcel' };

    component.export(exportEvent);

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['PARAM001', 'Test Param 1']],
      ['Référence', 'Libellé'],
      'Liste des paramètres de distribution'
    );
  });
});
