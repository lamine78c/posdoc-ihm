import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';

import {OccurrencesFichiersComponent} from './occurrences-fichiers.component';
import {
  TableauConfigurationBuilderService
} from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import {TableauOccurrencesFichiersService} from './service/tableau-occurrences-fichiers.service';
import {ApiOccurrenceFichierService} from '@app/services/api-adelaide/suivi/api-occurrence-fichier.service';
import {PopupConfirmationService} from '@app/shared/services/PopupConfirmationService';
import {OccurrenceFichier, OccurrencesFichiersFilters} from '@app/models/suivi/occurrence-fichier.model';
import {GridApi, GridOptions} from 'ag-grid-community';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('OccurrencesFichiersComponent', () => {
  let component: OccurrencesFichiersComponent;
  let fixture: ComponentFixture<OccurrencesFichiersComponent>;
  let tableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauOccurrencesFichiersService: jasmine.SpyObj<TableauOccurrencesFichiersService>;
  let apiOccurrenceFichierService: jasmine.SpyObj<ApiOccurrenceFichierService>;
  let popupConfirmationService: jasmine.SpyObj<PopupConfirmationService>;

  const mockColumnDefs = [
    { field: 'codenv', headerName: 'Code Environnement' },
    { field: 'codorg', headerName: 'Code Organisation' }
  ];

  const mockGridOptions: GridOptions = {
    defaultColDef: { sortable: true }
  };

  const mockOccurrencesFichiers: OccurrenceFichier[] = [
    {
      codenv: 'P',
      codorg: '117',
      codapp: 'SNV2',
      percod: '001',
      codcom: 'COM1',
      codfic: 'FIC1',
      numcom: 'NUM1',
      codprd: 'PRD1',
      ficsta: 'STA1',
      ficinf: 'INF1',
      frefec: false,
      ficvid: false,
      dappcr: new Date('2025-01-01'),
      dfichd: new Date('2025-01-01'),
      dficht: new Date('2025-01-02')
    },
    {
      codenv: 'P',
      codorg: '117',
      codapp: 'SNV2',
      percod: '002',
      codcom: 'COM2',
      codfic: 'FIC2',
      numcom: 'NUM2',
      codprd: 'PRD2',
      ficsta: 'STA2',
      ficinf: 'INF2',
      frefec: true,
      ficvid: false,
      dappcr: new Date('2025-01-02'),
      dfichd: new Date('2025-01-02'),
      dficht: new Date('2025-01-03')
    }
  ];

  beforeEach(async () => {
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'createGridConfiguration',
      'getNoDataMessage'
    ]);
    const tableauOccurrencesSpy = jasmine.createSpyObj('TableauOccurrencesFichiersService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
      'setModalCallback'
    ]);
    const apiOccurrenceSpy = jasmine.createSpyObj('ApiOccurrenceFichierService', [
      'getOccurrencesFichiers'
    ]);
    const popupSpy = jasmine.createSpyObj('PopupConfirmationService', [
      'popupTooManyResultsConfirmation'
    ]);

    await TestBed.configureTestingModule({
      declarations: [OccurrencesFichiersComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: TableauOccurrencesFichiersService, useValue: tableauOccurrencesSpy },
        { provide: ApiOccurrenceFichierService, useValue: apiOccurrenceSpy },
        { provide: PopupConfirmationService, useValue: popupSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurrencesFichiersComponent);
    component = fixture.componentInstance;
    tableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    tableauOccurrencesFichiersService = TestBed.inject(TableauOccurrencesFichiersService) as jasmine.SpyObj<TableauOccurrencesFichiersService>;
    apiOccurrenceFichierService = TestBed.inject(ApiOccurrenceFichierService) as jasmine.SpyObj<ApiOccurrenceFichierService>;
    popupConfirmationService = TestBed.inject(PopupConfirmationService) as jasmine.SpyObj<PopupConfirmationService>;

    // Setup default spies
    tableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions);
    tableauOccurrencesFichiersService.getColumnDefs.and.returnValue(mockColumnDefs);
    tableauOccurrencesFichiersService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucune donnée</span>');
  });

  it('should create', () => {
    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(of({
      data: {
        getOccurrencesFichiers: {
          occurrencesFichiers: [],
          message: null
        }
      },
      loading: false,
      networkStatus: 7
    }));
    expect(component).toBeTruthy();
  });

  it('should initialize grid configuration on ngOnInit', () => {
    component.ngOnInit();

    expect(tableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.gridOptions.onFilterChanged).toBeDefined();
    expect(component.gridOptions.onRowDataUpdated).toBeDefined();
  });

  it('should initialize column definitions on ngOnInit', () => {
    component.ngOnInit();

    expect(tableauOccurrencesFichiersService.getColumnDefs).toHaveBeenCalled();
    expect(component.columnDefs).toEqual(mockColumnDefs);
  });

  it('should load occurrences fichiers successfully', () => {
    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(of({
      data: {
        getOccurrencesFichiers: {
          occurrencesFichiers: mockOccurrencesFichiers,
          message: null
        }
      },
      loading: false,
      networkStatus: 7
    }));

    const filters: OccurrencesFichiersFilters = {
      codenv: 'P',
      codorg: ['117'],
      codapp: 'SNV2',
      percod: null,
      codcom: null,
      codfic: null,
      codprd: null,
      codsta: null
    };

    component.onSearchOccurrencesFichiers(filters);

    expect(apiOccurrenceFichierService.getOccurrencesFichiers).toHaveBeenCalledWith(filters);
    expect(component.rowData).toEqual(mockOccurrencesFichiers);
    expect(component.rowData.length).toBe(2);
  });

  it('should handle empty results and show no data message', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['showNoRowsOverlay']);
    component.gridApi = mockGridApi as GridApi;

    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(of({
      data: {
        getOccurrencesFichiers: {
          occurrencesFichiers: [],
          message: null
        }
      },
      loading: false,
      networkStatus: 7
    }));

    const filters: OccurrencesFichiersFilters = {
      codenv: 'P',
      codorg: ['117'],
      codapp: 'SNV2',
      percod: null,
      codcom: null,
      codfic: null,
      codprd: null,
      codsta: null
    };

    component.onSearchOccurrencesFichiers(filters);

    expect(component.rowData).toEqual([]);
    expect(tableauConfigurationBuilderService.getNoDataMessage).toHaveBeenCalledWith(mockGridApi);
  });

  it('should handle too many results message', () => {
    const warningMessage = 'Trop de résultats, veuillez affiner votre recherche';
    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(of({
      data: {
        getOccurrencesFichiers: {
          occurrencesFichiers: [],
          message: warningMessage
        }
      },
      loading: false,
      networkStatus: 7
    }));

    const filters: OccurrencesFichiersFilters = {
      codenv: 'P',
      codorg: ['117'],
      codapp: 'SNV2',
      percod: null,
      codcom: null,
      codfic: null,
      codprd: null,
      codsta: null
    };

    component.onSearchOccurrencesFichiers(filters);

    expect(popupConfirmationService.popupTooManyResultsConfirmation).toHaveBeenCalledWith(warningMessage);
    expect(component.rowData).toEqual([]);
  });

  it('should handle error when loading occurrences fichiers', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['showNoRowsOverlay']);
    component.gridApi = mockGridApi as GridApi;
    const errorMessage = 'Network error';

    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    spyOn(console, 'error');

    const filters: OccurrencesFichiersFilters = {
      codenv: 'P',
      codorg: ['117'],
      codapp: 'SNV2',
      percod: null,
      codcom: null,
      codfic: null,
      codprd: null,
      codsta: null
    };

    component.onSearchOccurrencesFichiers(filters);

    expect(console.error).toHaveBeenCalled();
    expect(component.rowData).toEqual([]);
    expect(tableauConfigurationBuilderService.getNoDataMessage).toHaveBeenCalledWith(mockGridApi);
  });

  it('should set gridApi on grid ready', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['sizeColumnsToFit']);
    const gridReadyEvent = {
      api: mockGridApi,
      columnApi: null,
      type: 'gridReady'
    };

    component.onGridReady(gridReadyEvent as any);

    expect(component.gridApi).toBe(mockGridApi);
  });

  it('should not call onSearch on ngOnInit', () => {
    spyOn(component, 'onSearchOccurrencesFichiers');

    component.ngOnInit();

    expect(component.onSearchOccurrencesFichiers).not.toHaveBeenCalled();
  });

  it('should update rowData when search returns different results', () => {
    const firstResults = [mockOccurrencesFichiers[0]];
    const secondResults = mockOccurrencesFichiers;

    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(of({
      data: {
        getOccurrencesFichiers: {
          occurrencesFichiers: firstResults,
          message: null
        }
      },
      loading: false,
      networkStatus: 7
    }));

    const filters: OccurrencesFichiersFilters = {
      codenv: 'P',
      codorg: ['117'],
      codapp: 'SNV2',
      percod: '001',
      codcom: null,
      codfic: null,
      codprd: null,
      codsta: null
    };

    component.onSearchOccurrencesFichiers(filters);
    expect(component.rowData.length).toBe(1);

    apiOccurrenceFichierService.getOccurrencesFichiers.and.returnValue(of({
      data: {
        getOccurrencesFichiers: {
          occurrencesFichiers: secondResults,
          message: null
        }
      },
      loading: false,
      networkStatus: 7
    }));

    component.onSearchOccurrencesFichiers(filters);
    expect(component.rowData.length).toBe(2);
  });

  it('should initialize overlay template on ngOnInit', () => {
    component.ngOnInit();

    expect(tableauOccurrencesFichiersService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucune donnée</span>');
  });

  it('should call generateExcelFile with correct data, headers and title', () => {
    const mockColumnDefsFromGrid = [
      { field: 'codenv', headerName: 'Code Environnement' },
      { field: 'frefec', headerName: 'Réfection' }
    ];

    // Service provides the column defs used by export
    tableauOccurrencesFichiersService.getColumnDefs.and.returnValue(mockColumnDefsFromGrid);

    const rows = [
      { codenv: 'P', frefec: true },
      { codenv: 'T', frefec: false }
    ];

    const mockGridApi = {
      getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue(mockColumnDefsFromGrid),
      forEachNodeAfterFilterAndSort: (cb: any) => rows.forEach(r => cb({ data: r }))
    } as any as GridApi;

    (component as any).generateFileService = {
      generatePDFFile: jasmine.createSpy('generatePDFFile'),
      generateExcelFile: jasmine.createSpy('generateExcelFile')
    } as any;

    component.gridApi = mockGridApi;

    component.export({ type: 'exportAsExcel' });

    const columnDefs = (mockColumnDefsFromGrid as any[]).filter(cd => !!cd.field && !!cd.headerName);
    const headers = columnDefs.map((col: any) => col.headerName);
    const fields = columnDefs.map((col: any) => col.field);
    const expectedData = rows.map(r => fields.map(f => (component as any).formatFieldValue(f, r)));

    expect((component as any).generateFileService.generateExcelFile).toHaveBeenCalledWith(expectedData, headers, 'Liste des Occurrences de Fichiers');
  });

  it('should call generateExcelFile when event.type is exportAsExcel', () => {
    const mockColumnDefsFromGrid = [
      { field: 'codenv', headerName: 'Code Environnement' }
    ];

    tableauOccurrencesFichiersService.getColumnDefs.and.returnValue(mockColumnDefsFromGrid);

    const rows = [ { codenv: 'P' } ];
    const mockGridApi = {
      getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue(mockColumnDefsFromGrid),
      forEachNodeAfterFilterAndSort: (cb: any) => rows.forEach(r => cb({ data: r }))
    } as any as GridApi;

    (component as any).generateFileService = {
      generatePDFFile: jasmine.createSpy('generatePDFFile'),
      generateExcelFile: jasmine.createSpy('generateExcelFile')
    } as any;

    component.gridApi = mockGridApi;

    component.export({ type: 'exportAsExcel' });

    const columnDefs = (mockColumnDefsFromGrid as any[]).filter(cd => !!cd.field && !!cd.headerName);
    const headers = columnDefs.map((col: any) => col.headerName);
    const fields = columnDefs.map((col: any) => col.field);
    const expectedData = rows.map(r => fields.map(f => (component as any).formatFieldValue(f, r)));

    expect((component as any).generateFileService.generateExcelFile).toHaveBeenCalledWith(expectedData, headers, 'Liste des Occurrences de Fichiers');
    expect((component as any).generateFileService.generatePDFFile).not.toHaveBeenCalled();
  });

  it('should exclude columns without field or headerName when building headers/fields (Excel)', () => {
    const mockRawColumnDefs = [
      { field: 'codenv', headerName: 'Code Environnement' },
      { field: '', headerName: 'No Field' },
      { field: 'codorg', headerName: null }
    ];

    // Service returns raw defs; export filters them
    tableauOccurrencesFichiersService.getColumnDefs.and.returnValue(mockRawColumnDefs);

    const rows = [ { codenv: 'P', codorg: '117' } ];
    const mockGridApi = {
      getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue(mockRawColumnDefs),
      forEachNodeAfterFilterAndSort: (cb: any) => rows.forEach(r => cb({ data: r }))
    } as any as GridApi;

    (component as any).generateFileService = {
      generatePDFFile: jasmine.createSpy('generatePDFFile'),
      generateExcelFile: jasmine.createSpy('generateExcelFile')
    } as any;

    component.gridApi = mockGridApi;

    component.export({ type: 'exportAsExcel' });

    const columnDefs = (mockRawColumnDefs as any[]).filter(cd => !!cd.field && !!cd.headerName);
    const headers = columnDefs.map((col: any) => col.headerName);
    const fields = columnDefs.map((col: any) => col.field);
    const expectedData = rows.map(r => fields.map(f => (component as any).formatFieldValue(f, r)));

    expect((component as any).generateFileService.generateExcelFile).toHaveBeenCalledWith(expectedData, headers, 'Liste des Occurrences de Fichiers');
  });

  it('should call file service with empty data when grid has no rows (Excel)', () => {
    const mockColumnDefsFromGrid = [ { field: 'codenv', headerName: 'Code Environnement' } ];

    tableauOccurrencesFichiersService.getColumnDefs.and.returnValue(mockColumnDefsFromGrid);

    const mockGridApi = {
      getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue(mockColumnDefsFromGrid),
      forEachNodeAfterFilterAndSort: () => { /* no rows */ }
    } as any as GridApi;

    (component as any).generateFileService = {
      generatePDFFile: jasmine.createSpy('generatePDFFile'),
      generateExcelFile: jasmine.createSpy('generateExcelFile')
    } as any;

    component.gridApi = mockGridApi;

    component.export({ type: 'exportAsExcel' });

    const columnDefs = (mockColumnDefsFromGrid as any[]).filter(cd => !!cd.field && !!cd.headerName);
    const headers = columnDefs.map((col: any) => col.headerName);
    const expectedData: any[] = [];

    expect((component as any).generateFileService.generateExcelFile).toHaveBeenCalledWith(expectedData, headers, 'Liste des Occurrences de Fichiers');
  });

  it('should format dates using SharedUtil when date fields are present (Excel)', () => {
    spyOn((SharedUtil as any), 'formatDateToDDMMYYYYHHMMSS').and.callFake(() => 'FORMATTED');

    const mockColumnDefsFromGrid = [ { field: 'dficht', headerName: 'Date' } ];

    tableauOccurrencesFichiersService.getColumnDefs.and.returnValue(mockColumnDefsFromGrid);

    const rows = [ { dficht: new Date('2025-02-02T12:00:00') } ];
    const mockGridApi = {
      getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue(mockColumnDefsFromGrid),
      forEachNodeAfterFilterAndSort: (cb: any) => rows.forEach(r => cb({ data: r }))
    } as any as GridApi;

    (component as any).generateFileService = {
      generatePDFFile: jasmine.createSpy('generatePDFFile'),
      generateExcelFile: jasmine.createSpy('generateExcelFile')
    } as any;

    component.gridApi = mockGridApi;

    component.export({ type: 'exportAsExcel' });

    const columnDefs = (mockColumnDefsFromGrid as any[]).filter(cd => !!cd.field && !!cd.headerName);
    const headers = columnDefs.map((col: any) => col.headerName);
    const fields = columnDefs.map((col: any) => col.field);
    const expectedData = rows.map(r => fields.map(f => (component as any).formatFieldValue(f, r)));

    expect((SharedUtil as any).formatDateToDDMMYYYYHHMMSS).toHaveBeenCalled();
    expect((component as any).generateFileService.generateExcelFile).toHaveBeenCalledWith(expectedData, headers, 'Liste des Occurrences de Fichiers');
  });
});
