import { TestBed } from '@angular/core/testing';
import { TableauOccurrenceApplicationService } from './tableau-occurrence-application.service';
import { ColDef } from 'ag-grid-community';

describe('TableauOccurrenceApplicationService', () => {
  let service: TableauOccurrenceApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableauOccurrenceApplicationService],
    });

    service = TestBed.inject(TableauOccurrenceApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return overlay no rows template', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toContain('<span class="no-rows">');
    expect(template).toContain("Veuillez remplir le formulaire pour sélectionner les occurrences d'application à charger");
  });

  it('should return column definitions', () => {
    const columnDefs = service.getColumnDefs();
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(13);
  });

  it('should have Application column with correct configuration', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const applicationCol = columnDefs.find(col => col.field === 'codenv');

    expect(applicationCol).toBeDefined();
    expect(applicationCol.headerName).toBe('Application');
    expect(applicationCol.filter).toBe('agSetColumnFilter');
    expect(applicationCol.floatingFilter).toBe(true);
  });

  it('should format Application column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const applicationCol = columnDefs.find(col => col.field === 'codenv');

    const mockData = {
      node: {
        group: true,
        allLeafChildren: [
          {
            data: {
              codenv: 'P',
              codorg: '117',
              codapp: 'SNV2',
            },
          },
        ],
      },
    };

    expect(typeof applicationCol.valueGetter).toBe('function');
    const result = (applicationCol.valueGetter as any)(mockData);
    expect(result).toBe('P-117-SNV2');
  });

  it('should handle missing Application data', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const applicationCol = columnDefs.find(col => col.field === 'codenv');

    const mockData = {
      node: {
        group: true,
        allLeafChildren: [
          {
            data: {
              codenv: null,
              codorg: null,
              codapp: null,
            },
          },
        ],
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
    expect(periodeCol.filter).toBe('agSetColumnFilter');
    expect(periodeCol.floatingFilter).toBe(true);
  });

  it('should format Site/Fichier column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const fichierCol = columnDefs.find(col => col.field === 'codsit');

    const mockData = {
      data: {
        codcom: 'COM1',
        codfic: 'FIC1',
        numcom: 'NUM1',
      },
      node: { group: false },
    };

    expect(typeof fichierCol.valueGetter).toBe('function');
    const result = (fichierCol.valueGetter as any)(mockData);
    expect(result).toBe('COM1-FIC1-NUM1');
  });

  it('should format Statut column value correctly for parent line', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const statutCol = columnDefs.find(col => col.field === 'statut');

    const mockData = {
      node: {
        group: true,
        allLeafChildren: [
          {
            data: {
              appsta: 'STA1',
              appinf: 'INF1',
            },
          },
        ],
      },
    };

    expect(typeof statutCol.valueGetter).toBe('function');
    const result = (statutCol.valueGetter as any)(mockData);
    expect(result).toBe('STA1-INF1');
  });

  it('should format Statut column value correctly for child line', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const statutCol = columnDefs.find(col => col.field === 'statut');

    const mockData = {
      data: {
        ficsta: 'STA1',
        ficinf: 'INF1',
      },
      node: { group: false },
    };

    expect(typeof statutCol.valueGetter).toBe('function');
    const result = (statutCol.valueGetter as any)(mockData);
    expect(result).toBe('STA1-INF1');
  });

  it('should have Refection column with InterrupteurRadioComponent renderer', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const refectionCol = columnDefs.find(col => col.field === 'frefec');

    const mockData = {
      node: { group: true },
    };

    expect(refectionCol).toBeDefined();
    expect(refectionCol.headerName).toBe('Réfection?');
    expect(refectionCol.cellRenderer).toBeDefined();
    expect(typeof refectionCol.cellRendererParams).toBe('function');
    expect(refectionCol.cellRendererParams(mockData)).toEqual({
      formKey: 'arefec',
    });
  });

  it('should have FicVide column with InterrupteurRadioComponent renderer', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const ficVideCol = columnDefs.find(col => col.field === 'ficvid');

    expect(ficVideCol).toBeDefined();
    expect(ficVideCol.headerName).toBe('Fic. vide?');
    expect(ficVideCol.cellRenderer).toBeDefined();
    expect(ficVideCol.cellRendererParams).toEqual({
      formKey: 'ficvid',
    });
  });

  it('should format date columns correctly using SharedUtil', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const dateApplicol = columnDefs.find(col => col.field === 'dappcr');
    const dateDebutCol = columnDefs.find(col => col.field === 'dfichd');
    const dateFinCol = columnDefs.find(col => col.field === 'dficht');
    const dateSuspensionCol = columnDefs.find(col => col.field === 'dfichs');

    expect(dateApplicol).toBeDefined();
    expect(dateApplicol.headerName).toBe('Date appli.');
    expect(dateDebutCol).toBeDefined();
    expect(dateDebutCol.headerName).toBe('Date début');
    expect(dateFinCol).toBeDefined();
    expect(dateFinCol.headerName).toBe('Date fin');
    expect(dateSuspensionCol).toBeDefined();
    expect(dateSuspensionCol.headerName).toBe('Date suspension');

    // Vérifier que les colonnes ont des valueFormatter et valueGetter
    expect(dateApplicol.valueFormatter).toBeDefined();
    expect(dateApplicol.filterValueGetter).toBeDefined();
    expect(dateDebutCol.valueFormatter).toBeDefined();
    expect(dateDebutCol.valueGetter).toBeDefined();
    expect(dateDebutCol.filterValueGetter).toBeDefined();
    expect(dateFinCol.valueFormatter).toBeDefined();
    expect(dateFinCol.valueGetter).toBeDefined();
    expect(dateFinCol.filterValueGetter).toBeDefined();
    expect(dateSuspensionCol.valueFormatter).toBeDefined();
    expect(dateSuspensionCol.valueGetter).toBeDefined();
    expect(dateSuspensionCol.filterValueGetter).toBeDefined();
  });
});
