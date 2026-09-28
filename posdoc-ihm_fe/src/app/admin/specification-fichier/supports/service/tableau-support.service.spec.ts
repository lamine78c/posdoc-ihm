import { TestBed } from '@angular/core/testing';
import { TableauSupportService } from './tableau-support.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';

describe('TableauSupportService', () => {
  let service: TableauSupportService;
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
        TableauSupportService,
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    });

    service = TestBed.inject(TableauSupportService);
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
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['type'],
            messages: jasmine.arrayContaining([
              "Suppression d'un support",
              'Vous êtes sur le point de supprimer le support',
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
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS,
      { isColSelectAll: false },
      jasmine.any(Object)
    );
  });

  it('should configure Type column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    expect(typeCol).toBeDefined();
    expect(typeCol.headerName).toBe('Support');
    expect(typeCol.field).toBe('type');
    expect(typeCol.sort).toBe('asc');
    expect(typeCol.sortable).toBe(true);
    expect(typeCol.filter).toBe('agTextColumnFilter');
    expect(typeCol.floatingFilter).toBe(true);
    expect(typeCol.floatingFilterComponent).toBe('inputFilter');
    expect(typeCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Type column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    expect(typeCol.cellRendererParams).toBeDefined();
    expect(typeCol.cellRendererParams.formKey).toBe('type');
    expect(typeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(typeCol.cellRendererParams.inputInput).toBeDefined();
    expect(typeCol.cellRendererParams.validators).toBeDefined();
    expect(typeCol.cellRendererParams.validators.length).toBe(2);
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
    expect(libelleCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', '.']);
  });

  it('should configure Poids column with numeric properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const poidsCol = columnDefs.find(col => col.field === 'poids');

    expect(poidsCol).toBeDefined();
    expect(poidsCol.headerName).toBe('Poids');
    expect(poidsCol.field).toBe('poids');
    expect(poidsCol.cellRenderer).toBe(InputEditorComponent);
    expect(poidsCol.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(poidsCol.comparator).toBeDefined();
    expect(poidsCol.valueGetter).toBeDefined();
  });

  it('should configure Poids column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const poidsCol = columnDefs.find(col => col.field === 'poids');

    expect(poidsCol.cellRendererParams).toBeDefined();
    expect(poidsCol.cellRendererParams.formKey).toBe('poids');
    expect(poidsCol.cellRendererParams.validators).toBeDefined();
    expect(poidsCol.cellRendererParams.validators.length).toBe(3);
  });

  it('should have numeric comparator for Poids that converts strings to numbers', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const poidsCol = columnDefs.find(col => col.field === 'poids');

    const comparator = poidsCol.comparator as (valueA: any, valueB: any) => number;
    expect(comparator('100', '20')).toBe(80);
    expect(comparator('50', '100')).toBe(-50);
    expect(comparator('50', '50')).toBe(0);
  });

  it('should set canEditOnlyOnNewRow based on permission for Libelle column', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS.libelle
    );
    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should allow editing Libelle when user has permission', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should set canEditOnlyOnNewRow based on permission for Poids column', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const poidsCol = columnDefs.find(col => col.field === 'poids');

    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS.poids
    );
    expect(poidsCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should have correct delete messages configuration', () => {
    service.getColumnDefs(true);

    const deleteParams = mockTableauUtilService.getColsDefAction.calls.mostRecent().args[2] as any;
    expect(deleteParams.delete.cellRendererParams.messages).toEqual([
      "Suppression d'un support",
      'Vous êtes sur le point de supprimer le support',
      'Vous êtes sur le point de supprimer les supports',
      'Suppression des supports',
      'Les supports suivants ne peuvent pas être supprimés',
      'Le support suivant ne peut pas être supprimé',
    ]);
  });

  it('should concatenate action columns and data columns in correct order', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];

    expect(columnDefs[0].field).toBe('select');
    expect(columnDefs[1].field).toBe('actions');

    const dataColumns = columnDefs.slice(2);
    expect(dataColumns.find(col => col.field === 'type')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'libelle')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'poids')).toBeDefined();
  });
});

