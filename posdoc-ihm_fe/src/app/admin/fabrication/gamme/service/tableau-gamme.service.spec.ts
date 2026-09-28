import {TestBed} from '@angular/core/testing';

import {TableauGammeService} from './tableau-gamme.service';
import {PermissionService} from '@app/services/permission/permission.service';
import {TableauUtilService} from '@app/services/tableau-util.service';
import {FormattersService} from '@app/fullstack-components/tableau/services/formatters.service';
import {
  InputEditorComponent
} from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import {
  SelectEditorComponent
} from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import {AUTH} from '@app/services/permission/PermissionsFile';
import {ColDef} from 'ag-grid-community';

describe('TableauGammeService', () => {
  let service: TableauGammeService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;

  const mockActionColumns = [
    {
      headerName: '',
      field: 'actions',
      cellRenderer: 'actionButtonsComponent',
      suppressMovable: true,
      pinned: 'left' as const,
      width: 120
    }
  ];

  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    const formattersServiceSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    permissionServiceSpy.hasPermission.and.returnValue(true);
    tableauUtilServiceSpy.getColsDefAction.and.returnValue(mockActionColumns);
    formattersServiceSpy.toUpperCase.and.returnValue({ value: 'MOCK', cursorPos: 0 });

    TestBed.configureTestingModule({
      providers: [
        TableauGammeService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
        { provide: FormattersService, useValue: formattersServiceSpy }
      ]
    });

    service = TestBed.inject(TableauGammeService);
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockFormattersService = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct overlay template for no rows', () => {
    const template = service.getOverlayNoRowsTemplate();

    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions with select all column when isColSelectAll is true', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([
      ...mockActionColumns,
      {
        headerName: '',
        field: 'selectAll',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50
      }
    ]);

    const columnDefs = service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.FABRICATION.GAMMES,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['code'],
            messages: jasmine.arrayContaining([
              "Suppression d'une gamme",
              'Vous êtes sur le point de supprimer la la gamme',
              'Vous êtes sur le point de supprimer les gammes'
            ])
          })
        })
      })
    );

    expect(columnDefs.length).toBeGreaterThan(3);
  });

  it('should return column definitions without select all column when isColSelectAll is false', () => {
    const columnDefs = service.getColumnDefs(false);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.FABRICATION.GAMMES,
      { isColSelectAll: false },
      jasmine.any(Object)
    );

    expect(columnDefs.length).toBeGreaterThan(3);
  });

  it('should configure code column correctly', () => {
    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const codeColumn = columnDefs.find(col => col.field === 'code');

    expect(codeColumn).toBeDefined();
    expect(codeColumn.headerName).toBe('Gamme');
    expect(codeColumn.sort).toBe('asc');
    expect(codeColumn.sortable).toBe(true);
    expect(codeColumn.filter).toBe('agSetColumnFilter');
    expect(codeColumn.floatingFilter).toBe(true);
    expect(codeColumn.cellRenderer).toBe(InputEditorComponent);
    expect(codeColumn.cellRendererParams.formKey).toBe('code');
    expect(codeColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(codeColumn.cellRendererParams.validators).toBeDefined();
    expect(codeColumn.cellRendererParams.validators.length).toBe(1);
  });

  it('should configure libelle column correctly', () => {
    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const libelleColumn = columnDefs.find(col => col.field === 'libelle');

    expect(libelleColumn).toBeDefined();
    expect(libelleColumn.headerName).toBe('Libellé');
    expect(libelleColumn.sortable).toBe(true);
    expect(libelleColumn.filter).toBe('agTextColumnFilter');
    expect(libelleColumn.floatingFilter).toBe(true);
    expect(libelleColumn.cellRenderer).toBe(InputEditorComponent);
    expect(libelleColumn.cellRendererParams.formKey).toBe('libelle');
    expect(libelleColumn.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', '/', '(', ')', '.']);
  });

  it('should configure libelle column as non-editable when user has no permission', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm !== AUTH.ADMINISTRATION.FABRICATION.GAMMES.libelle;
    });

    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const libelleColumn = columnDefs.find(col => col.field === 'libelle');

    expect(libelleColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should configure libelle column as editable when user has permission', () => {
    mockPermissionService.hasPermission.and.returnValue(true);

    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const libelleColumn = columnDefs.find(col => col.field === 'libelle');

    expect(libelleColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should configure codeVerrou column correctly', () => {
    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const codeVerrouColumn = columnDefs.find(col => col.field === 'codeVerrou');

    expect(codeVerrouColumn).toBeDefined();
    expect(codeVerrouColumn.headerName).toBe('Verrou');
    expect(codeVerrouColumn.sortable).toBe(true);
    expect(codeVerrouColumn.filter).toBe('agSetColumnFilter');
    expect(codeVerrouColumn.floatingFilter).toBe(true);
    expect(codeVerrouColumn.cellRenderer).toBe(SelectEditorComponent);
    expect(codeVerrouColumn.cellRendererParams.formKey).toBe('codeVerrou');
    expect(codeVerrouColumn.cellRendererParams.hasBlankOption).toBe(true);
    expect(codeVerrouColumn.cellRendererParams.values).toEqual([]);
  });

  it('should configure codeVerrou column as non-editable when user has no permission', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm !== AUTH.ADMINISTRATION.FABRICATION.GAMMES.code_verrou;
    });

    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const codeVerrouColumn = columnDefs.find(col => col.field === 'codeVerrou');

    expect(codeVerrouColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should configure codeVerrou column as editable when user has permission', () => {
    mockPermissionService.hasPermission.and.returnValue(true);

    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const codeVerrouColumn = columnDefs.find(col => col.field === 'codeVerrou');

    expect(codeVerrouColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should configure floating filters correctly for all columns', () => {
    const columnDefs = service.getColumnDefs(false) as ColDef[];
    const dataColumns = columnDefs.filter(col => ['code', 'libelle', 'codeVerrou'].includes(col.field));

    dataColumns.forEach(column => {
      expect(column.floatingFilter).toBe(true);
    });

    const codeColumn = dataColumns.find(col => col.field === 'code');
    const libelleColumn = dataColumns.find(col => col.field === 'libelle');
    const codeVerrouColumn = dataColumns.find(col => col.field === 'codeVerrou');

    expect(codeColumn.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(libelleColumn.floatingFilterComponent).toBe('inputFilter');
    expect(codeVerrouColumn.floatingFilterComponent).toBe('multiSelectFloatingFilter');
  });

  it('should return all columns in correct order', () => {
    const columnDefs = service.getColumnDefs(false);
    const fieldNames = columnDefs.map(col => (col as ColDef).field).filter(field => field);

    expect(fieldNames).toContain('actions');
    expect(fieldNames).toContain('code');
    expect(fieldNames).toContain('libelle');
    expect(fieldNames).toContain('codeVerrou');
  });
});
