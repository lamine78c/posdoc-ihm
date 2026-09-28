import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { OrganismesComponent, Organisme } from './organismes.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauOrganismeService } from './service/tableau-organisme.service';
import { ApiAdelaideOrganismeService } from 'src/app/services/api-adelaide-organisme.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { ApolloQueryResult } from '@apollo/client/core';

interface OrganismeWithNewRow extends Organisme {
  newRow?: boolean;
}

describe('OrganismesComponent', () => {
  let component: OrganismesComponent;
  let fixture: ComponentFixture<OrganismesComponent>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauOrganismeService: jasmine.SpyObj<TableauOrganismeService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideOrganismeService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockOrganismesData: ApolloQueryResult<any> = {
    data: {
      allOrganismes: [
        { code: 'ORG001', libelle: 'Organisme 1', type: 'TYPE1', codeRegion: 'R1', codeSite: 'S1' },
        { code: 'ORG002', libelle: 'Organisme 2', type: 'TYPE2', codeRegion: 'R2', codeSite: 'S2' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  const mockSelectConfigData: ApolloQueryResult<any> = {
    data: {
      allRegions: [{ code: 'R1' }, { code: 'R2' }],
      allSitesCNP: [{ code: 'S1' }, { code: 'S2' }]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauOrganismeService = jasmine.createSpyObj('TableauOrganismeService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiService = jasmine.createSpyObj('ApiAdelaideOrganismeService', ['getAllOrganismes', 'getAllSelectConfig', 'createOrganisme', 'updateOrganisme', 'deleteOrganismes']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption', 'forEachNode', 'applyTransaction', 'redrawRows', 'getColumnDefs', 'forEachNodeAfterFilterAndSort']);

    TestBed.configureTestingModule({
      declarations: [OrganismesComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigService },
        { provide: TableauOrganismeService, useValue: mockTableauOrganismeService },
        { provide: ApiAdelaideOrganismeService, useValue: mockApiService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauOrganismeService.getColumnDefs.and.returnValue([
      { field: 'codeRegion', cellRendererParams: {} },
      { field: 'codeSite', cellRendererParams: {} }
    ]);
    mockTableauOrganismeService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiService.getAllOrganismes.and.returnValue(of(mockOrganismesData));
    mockApiService.getAllSelectConfig.and.returnValue(of(mockSelectConfigData));

    fixture = TestBed.createComponent(OrganismesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauOrganismeService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauOrganismeService.getOverlayNoRowsTemplate).toHaveBeenCalled();
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
    expect(mockApiService.getAllOrganismes).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
  });

  it('should process data and update grids after successful data load', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(component.rowData).toEqual(mockOrganismesData.data.allOrganismes);
    expect(component.nombreTotal).toBe(2);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should create new organisme successfully', () => {
    const newOrganisme: OrganismeWithNewRow = {
      code: 'ORG003',
      libelle: 'Nouveau',
      newRow: true,
      adresse1: null, adresse2: null, adresse3: null, adresse4: null,
      type: 'TYPE1', codeRegion: 'R1', codeSite: 'S1'
    };
    const editedRow = [[1, newOrganisme]];

    mockApiService.createOrganisme.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow);

    expect(mockApiService.createOrganisme).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'ORG003',
      libelle: 'Nouveau',
      type: 'TYPE1'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: "L'organisme a été ajoutée avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle create organisme error', () => {
    const newOrganisme: OrganismeWithNewRow = {
      code: 'ORG003',
      libelle: 'Nouveau',
      newRow: true,
      adresse1: null, adresse2: null, adresse3: null, adresse4: null,
      type: 'TYPE1', codeRegion: 'R1', codeSite: 'S1'
    };
    const editedRow = [[1, newOrganisme]];
    const error = { graphQLErrors: [{ message: 'Erreur création' }] };

    mockApiService.createOrganisme.and.returnValue(throwError(error));

    component.onSaveEdition(editedRow);

    expect(newOrganisme.newRow).toBe(true);
    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should update existing organisme successfully', () => {
    const existingOrganisme: Organisme = {
      code: 'ORG001',
      libelle: 'Modifié',
      adresse1: null, adresse2: null, adresse3: null, adresse4: null,
      type: 'TYPE1', codeRegion: 'R1', codeSite: 'S1'
    };
    const editedRow = [[1, existingOrganisme]];

    mockApiService.updateOrganisme.and.returnValue(of({ data: { updateOrganisme: { code: 'ORG001' } } }));

    component.onSaveEdition(editedRow);

    expect(mockApiService.updateOrganisme).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'ORG001',
      libelle: 'Modifié'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'L\'organisme "ORG001" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete organismes successfully', () => {
    const organismesToDelete = [
      { code: 'ORG001', libelle: 'Organisme 1' },
      { code: 'ORG002', libelle: 'Organisme 2' }
    ];

    mockApiService.deleteOrganismes.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onDeleteRow(organismesToDelete);

    expect(mockApiService.deleteOrganismes).toHaveBeenCalledWith(['ORG001', 'ORG002']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: organismesToDelete });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les organismes  ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'libelle', headerName: 'Libellé' }
    ];
    const mockData = [{ code: 'ORG001', libelle: 'Test' }];

    // Create a proper IRowNode mock
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
      [['ORG001', 'Test']],
      ['Code', 'Libellé'],
      'Liste des Organismes'
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
