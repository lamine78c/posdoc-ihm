import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RegionsComponent } from './regions.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauRegionService } from './service/tableau-region.service';
import { ApiAdelaideRegionService } from 'src/app/services/api-adelaide-region.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { ApolloQueryResult } from '@apollo/client/core';

interface RegionWithNewRow {
  code: string;
  libelle: string;
  newRow?: boolean;
}

describe('RegionsComponent', () => {
  let component: RegionsComponent;
  let fixture: ComponentFixture<RegionsComponent>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauRegionService: jasmine.SpyObj<TableauRegionService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideRegionService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockRegionsData: ApolloQueryResult<any> = {
    data: {
      allRegions: [
        { code: 'R1', libelle: 'Région 1' },
        { code: 'R2', libelle: 'Région 2' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauRegionService = jasmine.createSpyObj('TableauRegionService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiService = jasmine.createSpyObj('ApiAdelaideRegionService', ['getAllRegions', 'createRegion', 'updateRegion', 'deleteRegions']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption', 'forEachNode', 'applyTransaction', 'redrawRows', 'getColumnDefs', 'forEachNodeAfterFilterAndSort']);

    TestBed.configureTestingModule({
      declarations: [RegionsComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigService },
        { provide: TableauRegionService, useValue: mockTableauRegionService },
        { provide: ApiAdelaideRegionService, useValue: mockApiService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauRegionService.getColumnDefs.and.returnValue([]);
    mockTableauRegionService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiService.getAllRegions.and.returnValue(of(mockRegionsData));

    fixture = TestBed.createComponent(RegionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauRegionService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauRegionService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucun résultat</span>');
  });

  it('should load data on grid ready', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiService.getAllRegions).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
  });

  it('should process data and update grid after successful data load', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(component.rowData).toEqual(mockRegionsData.data.allRegions);
    expect(component.nombreRegionTotal).toBe(2);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should create new region successfully', () => {
    const newRegion: RegionWithNewRow = {
      code: 'R3',
      libelle: 'Nouvelle Région',
      newRow: true
    };
    const editedRow = [[1, newRegion]];

    mockApiService.createRegion.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow);

    expect(mockApiService.createRegion).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'R3',
      libelle: 'Nouvelle Région'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La région a été ajoutée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle create region error', () => {
    const newRegion: RegionWithNewRow = {
      code: 'R3',
      libelle: 'Nouvelle',
      newRow: true
    };
    const editedRow = [[1, newRegion]];
    const error = { graphQLErrors: [{ message: 'Erreur création' }] };

    mockApiService.createRegion.and.returnValue(throwError(error));

    component.onSaveEdition(editedRow);

    expect(newRegion.newRow).toBe(true);
    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should update existing region successfully', () => {
    const existingRegion: RegionWithNewRow = {
      code: 'R1',
      libelle: 'Région Modifiée'
    };
    const editedRow = [[1, existingRegion]];

    mockApiService.updateRegion.and.returnValue(of({ data: { updateRegion: { code: 'R1' } } }));

    component.onSaveEdition(editedRow);

    expect(mockApiService.updateRegion).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'R1',
      libelle: 'Région Modifiée'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La région "R1" a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete regions successfully', () => {
    const regionsToDelete = [
      { code: 'R1', libelle: 'Région 1' },
      { code: 'R2', libelle: 'Région 2' }
    ];

    mockApiService.deleteRegions.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onDeleteRow(regionsToDelete);

    expect(mockApiService.deleteRegions).toHaveBeenCalledWith(['R1', 'R2']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: regionsToDelete });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les regions ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete single region with correct message', () => {
    const regionToDelete = [{ code: 'R1', libelle: 'Région 1' }];

    mockApiService.deleteRegions.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onDeleteRow(regionToDelete);

    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La region a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const mockColumnDefs = [
      { field: 'code', headerName: 'Région' },
      { field: 'libelle', headerName: 'Libellé' }
    ];
    const mockData = [{ code: 'R1', libelle: 'Test' }];

    const mockRowNode = {
      data: mockData[0],
      setSelected: jasmine.createSpy(),
      isSelected: jasmine.createSpy(),
      isRowPinned: jasmine.createSpy(),
      isExpandable: jasmine.createSpy()
    } as any;

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback(mockRowNode, 0);
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['R1', 'Test']],
      ['Région', 'Libellé'],
      'Liste des Régions'
    );
  });

  it('should set errors correctly in error map', () => {
    const errors = new Map();
    const error = { isError: true, message: 'Test error', id: null };

    component.setError(1, error, errors);

    expect(errors.has(1)).toBe(true);
    expect(errors.get(1)).toContain(error);

    const secondError = { isError: true, message: 'Second error', id: null };
    component.setError(1, secondError, errors);

    expect(errors.get(1).length).toBe(2);
    expect(errors.get(1)).toContain(secondError);
  });
});

