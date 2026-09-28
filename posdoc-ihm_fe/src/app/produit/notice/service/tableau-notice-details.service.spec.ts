import { TestBed } from '@angular/core/testing';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { TableauNoticeDetailsService } from './tableau-notice-details.service';

describe('TableauNoticeDetailsService', () => {
  let service: TableauNoticeDetailsService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [TableauNoticeDetailsService, { provide: TableauUtilService, useValue: mockTableauUtilService }],
    }).compileComponents();

    service = TestBed.inject(TableauNoticeDetailsService);
    mockTableauUtilService.getColsDefAction.and.returnValue([{ headerName: 'Actions', field: 'actions' }]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toBe('<span class="no-rows"><b>Aucun détail de notice trouvé pour ce fichier</b></span>');
  });

  it('should return all columns with action columns', () => {
    const result = service.getColumnDefs();

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.NOTICES.NOTICES_FICHIERS,
      jasmine.objectContaining({
        isColCollapse: false,
        isNoColEdit: true,
        isNoColDelete: true,
        isColSelectAll: false,
      }),
      jasmine.any(Object)
    );

    // 1 action column + 6 data columns
    expect(result.length).toEqual(7);
  });

  it('main columns with definition validity', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();

    const colCodeNotice = columnDefs.find((col: any) => col.field === 'codeNotice') as ColDef;
    const colFormat = columnDefs.find((col: any) => col.field === 'format') as ColDef;
    const colPoids = columnDefs.find((col: any) => col.field === 'poids') as ColDef;
    const colPortee = columnDefs.find((col: any) => col.field === 'portee') as ColDef;
    const colDateDebut = columnDefs.find((col: any) => col.field === 'dateDebut') as ColDef;
    const colDateFin = columnDefs.find((col: any) => col.field === 'dateFin') as ColDef;

    expect(colCodeNotice).toBeDefined();
    expect(colFormat).toBeDefined();
    expect(colPoids).toBeDefined();
    expect(colPortee).toBeDefined();
    expect(colDateDebut).toBeDefined();
    expect(colDateFin).toBeDefined();

    expect(colCodeNotice.headerName).toBe('Code notice');
    expect(colFormat.headerName).toBe('Format');
    expect(colPoids.headerName).toBe('Poids');
    expect(colPortee.headerName).toBe('Portée');
    expect(colDateDebut.headerName).toBe('Date début');
    expect(colDateFin.headerName).toBe('Date fin');

    expect(colCodeNotice.filter).toBe('agSetColumnFilter');
    expect(colCodeNotice.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colFormat.filter).toBe('agSetColumnFilter');
    expect(colFormat.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colPoids.filter).toBe('agSetColumnFilter');
    expect(colPoids.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colPortee.filter).toBe('agSetColumnFilter');
    expect(colPortee.floatingFilterComponent).toBe('multiSelectFloatingFilter');

    expect(colCodeNotice.sortable).toBeTruthy();
    expect(colFormat.sortable).toBeTruthy();
    expect(colPoids.sortable).toBeTruthy();
    expect(colPortee.sortable).toBeTruthy();
    expect(colDateDebut.sortable).toBeTruthy();
    expect(colDateFin.sortable).toBeTruthy();

    // Vérifier le floating filter
    expect(colCodeNotice.floatingFilter).toBeTruthy();
    expect(colFormat.floatingFilter).toBeTruthy();
    expect(colPoids.floatingFilter).toBeTruthy();
    expect(colPortee.floatingFilter).toBeTruthy();
  });

  it('should have sort ascending on codeNotice column', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();
    const colCodeNotice = columnDefs.find((col: any) => col.field === 'codeNotice') as ColDef;

    expect(colCodeNotice.sort).toBe('asc');
  });

  it('should have valueFormatter for poids column', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();
    const colPoids = columnDefs.find((col: any) => col.field === 'poids') as ColDef;

    expect(colPoids.valueFormatter).toBeDefined();

    // Test the formatter
    const formatter = colPoids.valueFormatter as any;
    const formattedWithValue = formatter({ value: 50 });
    const formattedWithoutValue = formatter({ value: null });

    expect(formattedWithValue).toBe('50 g');
    expect(formattedWithoutValue).toBe('');
  });

  it('should have valueFormatter for date columns', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();
    const colDateDebut = columnDefs.find((col: any) => col.field === 'dateDebut') as ColDef;
    const colDateFin = columnDefs.find((col: any) => col.field === 'dateFin') as ColDef;

    expect(colDateDebut.valueFormatter).toBeDefined();
    expect(colDateFin.valueFormatter).toBeDefined();

    // Test the formatter
    const testDate = '2025-01-15';
    const formatterDebut = colDateDebut.valueFormatter as any;
    const formatterFin = colDateFin.valueFormatter as any;
    const formattedDateDebut = formatterDebut({ value: testDate });
    const formattedDateFin = formatterFin({ value: testDate });

    expect(formattedDateDebut).toBe('15/01/2025');
    expect(formattedDateFin).toBe('15/01/2025');

    // Test with null value
    const formattedNullDateDebut = formatterDebut({ value: null });
    const formattedNullDateFin = formatterFin({ value: null });

    expect(formattedNullDateDebut).toBe('');
    expect(formattedNullDateFin).toBe('');
  });

  it('should have correct minWidth values', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();

    const colCodeNotice = columnDefs.find((col: any) => col.field === 'codeNotice') as ColDef;
    const colFormat = columnDefs.find((col: any) => col.field === 'format') as ColDef;
    const colPoids = columnDefs.find((col: any) => col.field === 'poids') as ColDef;
    const colPortee = columnDefs.find((col: any) => col.field === 'portee') as ColDef;
    const colDateDebut = columnDefs.find((col: any) => col.field === 'dateDebut') as ColDef;
    const colDateFin = columnDefs.find((col: any) => col.field === 'dateFin') as ColDef;

    expect(colCodeNotice).toBeDefined();
    expect(colFormat).toBeDefined();
    expect(colPoids).toBeDefined();
    expect(colPortee).toBeDefined();
    expect(colDateDebut).toBeDefined();
    expect(colDateFin).toBeDefined();

    expect(colCodeNotice!.minWidth).toBe(120);
    expect(colFormat!.minWidth).toBe(100);
    expect(colPoids!.minWidth).toBe(100);
    expect(colPortee!.minWidth).toBe(100);
    expect(colDateDebut!.minWidth).toBe(120);
    expect(colDateFin!.minWidth).toBe(120);
  });

  it('should have correct flex values', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();

    const colCodeNotice = columnDefs.find((col: any) => col.field === 'codeNotice') as ColDef;
    const colFormat = columnDefs.find((col: any) => col.field === 'format') as ColDef;
    const colPoids = columnDefs.find((col: any) => col.field === 'poids') as ColDef;
    const colPortee = columnDefs.find((col: any) => col.field === 'portee') as ColDef;
    const colDateDebut = columnDefs.find((col: any) => col.field === 'dateDebut') as ColDef;
    const colDateFin = columnDefs.find((col: any) => col.field === 'dateFin') as ColDef;

    expect(colCodeNotice).toBeDefined();
    expect(colFormat).toBeDefined();
    expect(colPoids).toBeDefined();
    expect(colPortee).toBeDefined();
    expect(colDateDebut).toBeDefined();
    expect(colDateFin).toBeDefined();

    expect(colCodeNotice!.flex).toBe(1);
    expect(colFormat!.flex).toBe(1);
    expect(colPoids!.flex).toBe(1);
    expect(colPortee!.flex).toBe(1);
    expect(colDateDebut!.flex).toBe(1);
    expect(colDateFin!.flex).toBe(1);
  });
});
