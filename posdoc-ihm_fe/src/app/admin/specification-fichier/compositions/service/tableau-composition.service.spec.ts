import { TestBed } from '@angular/core/testing';
import { TableauCompositionService } from './tableau-composition.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';

describe('TableauCompositionService', () => {
  let service: TableauCompositionService;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockActionColumns = [
    { field: 'select', headerName: 'Select' },
    { field: 'actions', headerName: 'Actions' },
  ];

  beforeEach(() => {
    const formattersServiceSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [
        TableauCompositionService,
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    });

    service = TestBed.inject(TableauCompositionService);
    mockFormattersService = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;

    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockFormattersService.toUpperCase.and.returnValue((value: string) => value?.toUpperCase());
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions including action columns', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true);

    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBeGreaterThan(2);
    expect(columnDefs[0]).toEqual(mockActionColumns[0]);
    expect(columnDefs[1]).toEqual(mockActionColumns[1]);
  });

  it('should call getColsDefAction with correct parameters when isColSelectAll is true', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['code'],
            messages: jasmine.arrayContaining([
              "Suppression d'une composition",
              'Vous êtes sur le point de supprimer la composition',
            ]),
          }),
        }),
      })
    );
  });

  it('should call getColsDefAction with correct parameters when isColSelectAll is false', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    service.getColumnDefs(false);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS,
      { isColSelectAll: false },
      jasmine.any(Object)
    );
  });

  it('should configure Code column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const codeCol = columnDefs.find(col => col.field === 'code');

    expect(codeCol).toBeDefined();
    expect(codeCol.headerName).toBe('Composition');
    expect(codeCol.field).toBe('code');
    expect(codeCol.sort).toBe('asc');
    expect(codeCol.sortable).toBe(true);
    expect(codeCol.filter).toBe('agTextColumnFilter');
    expect(codeCol.floatingFilter).toBe(true);
    expect(codeCol.floatingFilterComponent).toBe('inputFilter');
    expect(codeCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Code column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const codeCol = columnDefs.find(col => col.field === 'code');

    expect(codeCol.cellRendererParams).toBeDefined();
    expect(codeCol.cellRendererParams.formKey).toBe('code');
    expect(codeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(codeCol.cellRendererParams.inputInput).toBeDefined();
    expect(codeCol.cellRendererParams.validators).toBeDefined();
    expect(codeCol.cellRendererParams.validators.length).toBe(2);
  });

  it('should configure Libelle column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(libelleCol).toBeDefined();
    expect(libelleCol.headerName).toBe('Libellé');
    expect(libelleCol.field).toBe('libelle');
    expect(libelleCol.sortable).toBe(true);
    expect(libelleCol.filter).toBe('agTextColumnFilter');
    expect(libelleCol.floatingFilter).toBe(true);
    expect(libelleCol.floatingFilterComponent).toBe('inputFilter');
    expect(libelleCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Libelle column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(libelleCol.cellRendererParams).toBeDefined();
    expect(libelleCol.cellRendererParams.formKey).toBe('libelle');
    expect(libelleCol.cellRendererParams.inputInput).toBeDefined();
    expect(libelleCol.cellRendererParams.validators).toBeDefined();
    expect(libelleCol.cellRendererParams.validators.length).toBe(2);
    expect(libelleCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', ')', '(', '.']);
  });

  it('should set canEditOnlyOnNewRow based on permission for Libelle column', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS.libelle
    );
    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should allow editing Libelle when user has permission', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should have correct delete messages configuration', () => {
    service.getColumnDefs(true);

    const deleteParams = mockTableauUtilService.getColsDefAction.calls.mostRecent().args[2] as any;
    expect(deleteParams.delete.cellRendererParams.messages).toEqual([
      "Suppression d'une composition",
      'Vous êtes sur le point de supprimer la composition',
      'Vous êtes sur le point de supprimer les compositions',
      'Suppression des compositions',
      'Les compositions suivantes ne peuvent pas être supprimées',
      'La composition suivante ne peut pas être supprimée',
    ]);
  });

  it('should concatenate action columns and data columns in correct order', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];

    // First columns should be action columns
    expect(columnDefs[0].field).toBe('select');
    expect(columnDefs[1].field).toBe('actions');

    // Data columns should follow
    const dataColumns = columnDefs.slice(2);
    expect(dataColumns.find(col => col.field === 'code')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'libelle')).toBeDefined();
  });
});
