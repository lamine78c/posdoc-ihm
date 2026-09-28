import { TestBed } from '@angular/core/testing';
import { TableauOccurrencesFichiersService } from './tableau-occurrences-fichiers.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef } from 'ag-grid-community';

describe('TableauOccurrencesFichiersService', () => {
  let service: TableauOccurrencesFichiersService;
  let tableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockClearFilterCol: ColDef = {
    headerName: '',
    field: 'clearFilter',
    width: 50,
  };

  beforeEach(() => {
    const tableauUtilSpy = jasmine.createSpyObj('TableauUtilService', ['getColClearFilter']);

    TestBed.configureTestingModule({
      providers: [TableauOccurrencesFichiersService, { provide: TableauUtilService, useValue: tableauUtilSpy }],
    });

    service = TestBed.inject(TableauOccurrencesFichiersService);
    tableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;

    // Setup default spy
    tableauUtilService.getColClearFilter.and.returnValue(mockClearFilterCol);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return overlay no rows template', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toContain('<span class="no-rows">');
    expect(template).toContain('Veuillez remplir le formulaire pour sélectionner les occurrences de fichiers à charger');
  });

  it('should return column definitions', () => {
    const columnDefs = service.getColumnDefs();
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(11); // 1 clear filter + 10 colonnes de données
    expect(tableauUtilService.getColClearFilter).toHaveBeenCalled();
  });

  it('should have Application column with correct configuration', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const applicationCol = columnDefs.find(col => col.field === 'application');

    expect(applicationCol).toBeDefined();
    expect(applicationCol.headerName).toBe('Application');
    expect(applicationCol.sortable).toBe(true);
    expect(applicationCol.filter).toBe('agSetColumnFilter');
    expect(applicationCol.floatingFilter).toBe(true);
  });

  it('should format Application column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const applicationCol = columnDefs.find(col => col.field === 'application');

    const mockData = {
      data: {
        codenv: 'P',
        codorg: '117',
        codapp: 'SNV2',
      },
    };

    expect(typeof applicationCol.valueGetter).toBe('function');
    const result = (applicationCol.valueGetter as any)(mockData);
    expect(result).toBe('P-117-SNV2');
  });

  it('should handle missing Application data', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const applicationCol = columnDefs.find(col => col.field === 'application');

    const mockData = {
      data: {
        codenv: null,
        codorg: null,
        codapp: null,
      },
    };

    expect(typeof applicationCol.valueGetter).toBe('function');
    const result = (applicationCol.valueGetter as any)(mockData);
    expect(result).toBe('');
  });

  it('should have Periode column with correct configuration', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const periodeCol = columnDefs.find(col => col.field === 'percod');

    expect(periodeCol).toBeDefined();
    expect(periodeCol.headerName).toBe('Période');
    expect(periodeCol.sortable).toBe(true);
    expect(periodeCol.filter).toBe('agSetColumnFilter');
    expect(periodeCol.floatingFilter).toBe(true);
  });

  it('should format Fichier column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const fichierCol = columnDefs.find(col => col.field === 'fichier');

    const mockData = {
      data: {
        codcom: 'COM1',
        codfic: 'FIC1',
        numcom: 'NUM1',
      },
    };

    expect(typeof fichierCol.valueGetter).toBe('function');
    const result = (fichierCol.valueGetter as any)(mockData);
    expect(result).toBe('COM1FIC1-NUM1');
  });

  it('should handle missing Fichier data', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const fichierCol = columnDefs.find(col => col.field === 'fichier');

    const mockData = {
      data: {
        codcom: null,
        codfic: null,
        numcom: null,
      },
    };

    expect(typeof fichierCol.valueGetter).toBe('function');
    const result = (fichierCol.valueGetter as any)(mockData);
    expect(result).toBe('');
  });

  it('should format Statut column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const statutCol = columnDefs.find(col => col.field === 'statut');

    const mockData = {
      data: {
        ficsta: 'STA1',
        ficinf: 'INF1',
      },
    };

    expect(typeof statutCol.valueGetter).toBe('function');
    const result = (statutCol.valueGetter as any)(mockData);
    expect(result).toBe('STA1-INF1');
  });

  it('should handle Statut with only ficsta', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const statutCol = columnDefs.find(col => col.field === 'statut');

    const mockData = {
      data: {
        ficsta: 'STA1',
        ficinf: null,
      },
    };

    expect(typeof statutCol.valueGetter).toBe('function');
    const result = (statutCol.valueGetter as any)(mockData);
    expect(result).toBe('STA1');
  });

  it('should have Refection column with InterrupteurRadioComponent renderer', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const refectionCol = columnDefs.find(col => col.field === 'frefec');

    expect(refectionCol).toBeDefined();
    expect(refectionCol.headerName).toBe('Réfection');
    expect(refectionCol.cellRenderer).toBeDefined();
    expect(refectionCol.cellRendererParams).toEqual({
      formKey: 'frefec',
      isAllTimeClickable: false,
      isnotEditableOnNewRow: true,
    });
  });

  it('should return false for Refection when data is missing', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const refectionCol = columnDefs.find(col => col.field === 'frefec');

    const mockData = {
      data: {},
    };

    expect(typeof refectionCol.valueGetter).toBe('function');
    const result = (refectionCol.valueGetter as any)(mockData);
    expect(result).toBe(false);
  });

  it('should have FicVide column with InterrupteurRadioComponent renderer', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const ficVideCol = columnDefs.find(col => col.field === 'ficvid');

    expect(ficVideCol).toBeDefined();
    expect(ficVideCol.headerName).toBe('Fic vide ?');
    expect(ficVideCol.cellRenderer).toBeDefined();
    expect(ficVideCol.cellRendererParams).toEqual({
      formKey: 'ficvid',
      isAllTimeClickable: false,
      isnotEditableOnNewRow: true,
    });
  });

  it('should format date columns correctly using SharedUtil', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const dateApplicol = columnDefs.find(col => col.field === 'dappcr');
    const dateDebutCol = columnDefs.find(col => col.field === 'dfichd');
    const dateFinCol = columnDefs.find(col => col.field === 'dficht');

    expect(dateApplicol).toBeDefined();
    expect(dateApplicol.headerName).toBe('Date appli');
    expect(dateDebutCol).toBeDefined();
    expect(dateDebutCol.headerName).toBe('Date début');
    expect(dateFinCol).toBeDefined();
    expect(dateFinCol.headerName).toBe('Date fin');

    // Vérifier que les colonnes ont des cellRenderer qui appellent SharedUtil
    expect(dateApplicol.cellRenderer).toBeDefined();
    expect(dateDebutCol.cellRenderer).toBeDefined();
    expect(dateFinCol.cellRenderer).toBeDefined();

    // Tester le rendu effectif des cellRenderer
    const mockDataDateApp = { data: { dappcr: '2025-09-05T03:26:21' } };
    const mockDataDateDeb = { data: { dfichd: '2025-09-05T03:26:21' } };
    const mockDataDateFin = { data: { dficht: '2025-09-05T03:26:21' } };

    const resultApp = (dateApplicol.cellRenderer as Function)(mockDataDateApp);
    const resultDeb = (dateDebutCol.cellRenderer as Function)(mockDataDateDeb);
    const resultFin = (dateFinCol.cellRenderer as Function)(mockDataDateFin);

    expect(resultApp).toBe('05/09/2025 03:26:21');
    expect(resultDeb).toBe('05/09/2025 03:26:21');
    expect(resultFin).toBe('05/09/2025 03:26:21');
  });

  it('should have Code Prd column with correct configuration', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const codePrdCol = columnDefs.find(col => col.field === 'codprd');

    expect(codePrdCol).toBeDefined();
    expect(codePrdCol.headerName).toBe('Code Prd');
    expect(codePrdCol.sortable).toBe(true);
    expect(codePrdCol.filter).toBe('agSetColumnFilter');
  });
});
