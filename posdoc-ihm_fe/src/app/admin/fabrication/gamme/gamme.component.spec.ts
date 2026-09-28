import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client/core';

import { GammeComponent } from './gamme.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideGammeService } from 'src/app/services/api-adelaide-gamme.service';
import { GenerateFileService } from 'src/app/services/generate-file.service';
import { TableauGammeService } from './service/tableau-gamme.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { AddType } from '@app/models/enums/add-type';
import { AUTH } from '@app/services/permission/PermissionsFile';

describe('GammeComponent', () => {
  let component: GammeComponent;
  let fixture: ComponentFixture<GammeComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideGammeService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockTableauGammeService: jasmine.SpyObj<TableauGammeService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockGammesData: ApolloQueryResult<any> = {
    data: {
      allGammes: [
        { id: 1, code: 'CC', libelle: 'Courrier Chèque', codeVerrou: 'JAVA' },
        { id: 2, code: 'DM', libelle: 'Domiciliation', codeVerrou: 'MA' },
        { id: 3, code: 'FT', libelle: 'Fichier de Transfert', codeVerrou: 'MB' },
        { id: 4, code: 'CM', libelle: 'Courrier Mixte', codeVerrou: 'MD' },
        { id: 5, code: 'DC', libelle: 'Document Commercial', codeVerrou: 'MM' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  const mockVerrousData: ApolloQueryResult<any> = {
    data: {
      allVerrous: [
        { code: 'JAVA', libelle: 'Java Verrou' },
        { code: 'MA', libelle: 'Mainframe A' },
        { code: 'MB', libelle: 'Mainframe B' },
        { code: 'MD', libelle: 'Mainframe D' },
        { code: 'MM', libelle: 'Mainframe M' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const apiAdelaideSpy = jasmine.createSpyObj('ApiAdelaideGammeService', ['getAllGammes', 'getAllSelectConfig', 'createGamme', 'updateGamme', 'deleteGammes']);
    const generateFileSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const tableauGammeSpy = jasmine.createSpyObj('TableauGammeService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    const gridApiSpy = jasmine.createSpyObj('GridApi', ['setGridOption', 'applyTransaction', 'redrawRows', 'forEachNode', 'getColumnDefs', 'forEachNodeAfterFilterAndSort']);

    TestBed.configureTestingModule({
      declarations: [GammeComponent],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: ApiAdelaideGammeService, useValue: apiAdelaideSpy },
        { provide: GenerateFileService, useValue: generateFileSpy },
        { provide: TableauGammeService, useValue: tableauGammeSpy },
        { provide: PermissionService, useValue: permissionSpy }
      ]
    }).compileComponents();

    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaideGammeService) as jasmine.SpyObj<ApiAdelaideGammeService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockTableauGammeService = TestBed.inject(TableauGammeService) as jasmine.SpyObj<TableauGammeService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockGridApi = gridApiSpy;
  }));

  beforeEach(() => {
    // Configuration par défaut des mocks
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauGammeService.getColumnDefs.and.returnValue([
      { field: 'code', headerName: 'Code' },
      { field: 'codeVerrou', headerName: 'Code Verrou', cellRendererParams: { selectData: new BehaviorSubject([]) } }
    ]);
    mockTableauGammeService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucune donnée</span>');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideService.getAllGammes.and.returnValue(of(mockGammesData));
    mockApiAdelaideService.getAllSelectConfig.and.returnValue(of(mockVerrousData));

    fixture = TestBed.createComponent(GammeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize grid options and column definitions on ngOnInit', () => {
    fixture.detectChanges();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauGammeService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauGammeService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucune donnée</span>');
  });

  it('should set correct permission properties', () => {
    fixture.detectChanges();

    expect(component.canAddPermPosition).toBe(AUTH.ADMINISTRATION.FABRICATION.GAMMES.ajouter);
    expect(component.canRemovePermPosition).toBe(AUTH.ADMINISTRATION.FABRICATION.GAMMES.supprimer);
    expect(component.addType).toBe(AddType.INLINE_ROW);
  });

  it('should load data on grid ready', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {}
    } as unknown as GridReadyEvent;

    fixture.detectChanges();
    component.onGridReady(mockParams);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiAdelaideService.getAllGammes).toHaveBeenCalled();
    expect(mockApiAdelaideService.getAllSelectConfig).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.rowData).toEqual(mockGammesData.data.allGammes);
    expect(component.nombreGammeTotal).toBe(5);
  });

  it('should create new gamme successfully', () => {
    const newGamme = { code: 'FT', libelle: 'Fichier de Transfert', codeVerrou: 'JAVA', newRow: true };
    const editedRowMap = new Map([[1, newGamme]]);
    const createResponse: ApolloQueryResult<any> = {
      data: { createGamme: { code: 'FT' } },
      loading: false,
      networkStatus: 7
    };

    mockApiAdelaideService.createGamme.and.returnValue(of(createResponse));
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });

    fixture.detectChanges();
    component.gridApi = mockGridApi;
    component.onSaveEdition(editedRowMap);

    expect(mockApiAdelaideService.createGamme).toHaveBeenCalledWith({
      code: 'FT',
      libelle: 'Fichier de Transfert',
      codeVerrou: 'JAVA'
    });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La gamme "FT" a été créée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle create gamme error', () => {
    const newGamme = { code: 'CM', libelle: 'Courrier Mixte', newRow: true };
    const editedRowMap = new Map([[1, newGamme]]);
    const error = { graphQLErrors: [{ message: 'Erreur de création' }] };

    mockApiAdelaideService.createGamme.and.returnValue(throwError(error));

    fixture.detectChanges();
    component.onSaveEdition(editedRowMap);

    expect(newGamme.newRow).toBe(true);
    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should update existing gamme successfully', () => {
    const existingGamme = { code: 'DC', libelle: 'Document Commercial Modifié', codeVerrou: 'MM' };
    const editedRowMap = new Map([[1, existingGamme]]);
    const updateResponse: ApolloQueryResult<any> = {
      data: { updateGamme: { code: 'DC' } },
      loading: false,
      networkStatus: 7
    };

    mockApiAdelaideService.updateGamme.and.returnValue(of(updateResponse));

    fixture.detectChanges();
    component.onSaveEdition(editedRowMap);

    expect(mockApiAdelaideService.updateGamme).toHaveBeenCalledWith({
      code: 'DC',
      libelle: 'Document Commercial Modifié',
      codeVerrou: 'MM'
    });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La gamme "DC" a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete gammes successfully', () => {
    const gammesToDelete = [
      { code: 'CC', libelle: 'Courrier Chèque' },
      { code: 'DM', libelle: 'Domiciliation' }
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deleteGammes: true },
      loading: false,
      networkStatus: 7
    };

    mockApiAdelaideService.deleteGammes.and.returnValue(of(deleteResponse));

    fixture.detectChanges();
    component.gridApi = mockGridApi;
    component.onDeleteRow(gammesToDelete);

    expect(mockApiAdelaideService.deleteGammes).toHaveBeenCalledWith(['CC', 'DM']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: gammesToDelete });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les gammes ont été supprimées avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle delete single gamme', () => {
    const gammeToDelete = [{ code: 'FT', libelle: 'Fichier de Transfert' }];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deleteGammes: true },
      loading: false,
      networkStatus: 7
    };

    mockApiAdelaideService.deleteGammes.and.returnValue(of(deleteResponse));

    fixture.detectChanges();
    component.gridApi = mockGridApi;
    component.onDeleteRow(gammeToDelete);

    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La gamme a été supprimée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'libelle', headerName: 'Libellé' }
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { code: 'CC', libelle: 'Courrier Chèque' } } as RowNode;
      callback(mockNode, 0);
    });

    fixture.detectChanges();
    component.gridApi = mockGridApi;
    component.export(exportEvent);

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['CC', 'Courrier Chèque']],
      ['Code', 'Libellé'],
      'Liste des gammes'
    );
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    const mockColumnDefs = [{ field: 'code', headerName: 'Code' }];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { code: 'DM' } } as RowNode;
      callback(mockNode, 0);
    });

    fixture.detectChanges();
    component.gridApi = mockGridApi;
    component.export(exportEvent);

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
});
