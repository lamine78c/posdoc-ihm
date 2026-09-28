import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {BehaviorSubject, of} from 'rxjs';
import {ApolloQueryResult} from '@apollo/client/core';

import {EnvironnementComponent} from './environnement.component';
import {
  TableauConfigurationBuilderService
} from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import {TableauEnvironnementService} from './service/tableau-environnement.service';
import {ApiAdelaideEnvironnementService} from '@app/services/api-adelaide-environnement.service';
import {GenerateFileService} from 'src/app/services/generate-file.service';
import {NotesService, ToastCategoryEnum} from '@app/fullstack-components/notes/services/notes.service';
import {PermissionService} from '@app/services/permission/permission.service';
import {GridApi, GridReadyEvent, IRowNode} from 'ag-grid-community';
import {AddType} from '@app/models/enums/add-type';

describe('EnvironnementComponent', () => {
  let component: EnvironnementComponent;
  let fixture: ComponentFixture<EnvironnementComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauEnvironnementService: jasmine.SpyObj<TableauEnvironnementService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideEnvironnementService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockEnvironnementData: ApolloQueryResult<any> = {
    data: {
      allEnvironnements: [
        { id: 1, code: 'ENV1', description: 'Environnement 1' },
        { id: 2, code: 'ENV2', description: 'Environnement 2' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    const tableauConfigurationBuilderServiceSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const tableauEnvironnementServiceSpy = jasmine.createSpyObj('TableauEnvironnementService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const apiAdelaideServiceSpy = jasmine.createSpyObj('ApiAdelaideEnvironnementService', ['getAllEnvironnement', 'createEnvironnement', 'updateEnvironnement', 'deleteEnvironnements']);
    const generateFileServiceSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    const gridApiSpy = jasmine.createSpyObj('GridApi', ['setGridOption', 'forEachNode', 'applyTransaction', 'redrawRows', 'getColumnDefs', 'forEachNodeAfterFilterAndSort']);

    TestBed.configureTestingModule({
      declarations: [EnvironnementComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceSpy },
        { provide: TableauEnvironnementService, useValue: tableauEnvironnementServiceSpy },
        { provide: ApiAdelaideEnvironnementService, useValue: apiAdelaideServiceSpy },
        { provide: GenerateFileService, useValue: generateFileServiceSpy },
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy }
      ]
    }).compileComponents();

    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockTableauEnvironnementService = TestBed.inject(TableauEnvironnementService) as jasmine.SpyObj<TableauEnvironnementService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaideEnvironnementService) as jasmine.SpyObj<ApiAdelaideEnvironnementService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockGridApi = gridApiSpy;
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauEnvironnementService.getColumnDefs.and.returnValue([]);
    mockTableauEnvironnementService.getOverlayNoRowsTemplate.and.returnValue('Aucun résultat');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideService.getAllEnvironnement.and.returnValue(of(mockEnvironnementData));

    fixture = TestBed.createComponent(EnvironnementComponent);
    component = fixture.componentInstance;

    component.asynchronousErrors$ = new BehaviorSubject(new Map());

    (component as any).apiAdelaideService = mockApiAdelaideService;
    (component as any).noteService = mockNotesService;
    (component as any).generateFileService = mockGenerateFileService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauEnvironnementService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauEnvironnementService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.addType).toBe(AddType.INLINE_ROW);
  });

  it('should handle onGridReady event correctly', () => {
    const gridReadyEvent: GridReadyEvent = {
      api: mockGridApi,
      type: 'gridReady',
      columnApi: mockGridApi,
      context: {}
    } as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiAdelaideService.getAllEnvironnement).toHaveBeenCalled();
  });

  it('should load environment data on grid ready', () => {
    const gridReadyEvent: GridReadyEvent = {
      api: mockGridApi,
      type: 'gridReady',
      columnApi: mockGridApi,
      context: {}
    } as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(component.rowData).toEqual(mockEnvironnementData.data.allEnvironnements);
    expect(component.nombreEnvironnementTotal).toBe(2);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should update existing environment successfully', () => {
    // Pas de newRow pour déclencher la mise à jour
    const mockEditedRow = new Map([[0, [0, { id: 1, code: 'ENV1', description: 'Environnement modifié' }]]]);
    const mockUpdateResponse = { data: { updateEnvironnement: { code: 'ENV1' } } };

    mockApiAdelaideService.updateEnvironnement.and.returnValue(of(mockUpdateResponse));

    component.onSaveEdition(mockEditedRow);

    expect(mockApiAdelaideService.updateEnvironnement).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'L\'environnement "ENV1" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete environments successfully', () => {
    const mockEnvironmentsToDelete = [
      { code: 'ENV1', description: 'Environnement 1' },
      { code: 'ENV2', description: 'Environnement 2' }
    ];
    const mockDeleteResponse = { data: { deleteEnvironnements: ['ENV1', 'ENV2'] } };

    mockApiAdelaideService.deleteEnvironnements.and.returnValue(of(mockDeleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(mockEnvironmentsToDelete);

    expect(mockApiAdelaideService.deleteEnvironnements).toHaveBeenCalledWith(['ENV1', 'ENV2']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: mockEnvironmentsToDelete });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les environnements ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const mockEvent = { type: 'exportAsPDF' };
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'description', headerName: 'Description' }
    ];

    const mockRowNode1 = { data: { code: 'ENV1', description: 'Environnement 1' } } as IRowNode;
    const mockRowNode2 = { data: { code: 'ENV2', description: 'Environnement 2' } } as IRowNode;

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback(mockRowNode1, 0);
      callback(mockRowNode2, 1);
    });
    component.gridApi = mockGridApi;

    component.export(mockEvent);

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['ENV1', 'Environnement 1'], ['ENV2', 'Environnement 2']],
      ['Code', 'Description'],
      'Liste des Environnements'
    );
  });

  it('should export data as Excel', () => {
    const mockEvent = { type: 'exportAsExcel' };
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'description', headerName: 'Description' }
    ];

    const mockRowNode = { data: { code: 'ENV1', description: 'Environnement 1' } } as IRowNode;

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback(mockRowNode, 0);
    });
    component.gridApi = mockGridApi;

    component.export(mockEvent);

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['ENV1', 'Environnement 1']],
      ['Code', 'Description'],
      'Liste des Environnements'
    );
  });
});
