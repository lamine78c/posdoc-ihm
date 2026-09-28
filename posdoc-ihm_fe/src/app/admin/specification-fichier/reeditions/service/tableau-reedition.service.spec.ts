import { TestBed } from '@angular/core/testing';
import { TableauReeditionService } from './tableau-reedition.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';

describe('TableauReeditionService', () => {
  let service: TableauReeditionService;
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
        TableauReeditionService,
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    });

    service = TestBed.inject(TableauReeditionService);
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

  it('should call getColsDefAction with correct parameters', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['reference'],
            messages: jasmine.arrayContaining([
              "Suppression d'une réédition",
              'Vous êtes sur le point de supprimer la réédition',
            ]),
          }),
        }),
      })
    );
  });

  it('should configure Reference column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const referenceCol = columnDefs.find(col => col.field === 'reference');

    expect(referenceCol).toBeDefined();
    expect(referenceCol.headerName).toBe('Référence clé');
    expect(referenceCol.field).toBe('reference');
    expect(referenceCol.sort).toBe('asc');
    expect(referenceCol.sortable).toBe(true);
    expect(referenceCol.filter).toBe('agTextColumnFilter');
    expect(referenceCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Type column with SelectEditorComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    expect(typeCol).toBeDefined();
    expect(typeCol.headerName).toBe('Type format');
    expect(typeCol.cellRenderer).toBe(SelectEditorComponent);
    expect(typeCol.cellRendererParams.formKey).toBe('type');
    expect(typeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(typeCol.filter).toBe('agSetColumnFilter');
  });

  it('should configure Libelle column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');

    expect(libelleCol).toBeDefined();
    expect(libelleCol.headerName).toBe('Libellé');
    expect(libelleCol.cellRenderer).toBe(InputEditorComponent);
    expect(libelleCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', '.']);
  });

  it('should configure LineNumber column with numeric properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const lineNumberCol = columnDefs.find(col => col.field === 'lineNumber');

    expect(lineNumberCol).toBeDefined();
    expect(lineNumberCol.headerName).toBe('Numéro de ligne');
    expect(lineNumberCol.cellRenderer).toBe(InputEditorComponent);
    expect(lineNumberCol.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(lineNumberCol.comparator).toBeDefined();
    expect(lineNumberCol.valueGetter).toBeDefined();
  });

  it('should configure ColumnNumber column with numeric properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const columnNumberCol = columnDefs.find(col => col.field === 'columnNumber');

    expect(columnNumberCol).toBeDefined();
    expect(columnNumberCol.headerName).toBe('Numéro de colonne');
    expect(columnNumberCol.cellRenderer).toBe(InputEditorComponent);
    expect(columnNumberCol.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(columnNumberCol.comparator).toBeDefined();
  });

  it('should configure Length column with numeric properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const lengthCol = columnDefs.find(col => col.field === 'length');

    expect(lengthCol).toBeDefined();
    expect(lengthCol.headerName).toBe('Longueur');
    expect(lengthCol.cellRenderer).toBe(InputEditorComponent);
    expect(lengthCol.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(lengthCol.comparator).toBeDefined();
  });

  it('should have numeric comparator that converts strings to numbers', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const lineNumberCol = columnDefs.find(col => col.field === 'lineNumber');

    const comparator = lineNumberCol.comparator as (valueA: any, valueB: any) => number;
    expect(comparator('10', '2')).toBe(8);
    expect(comparator('5', '10')).toBe(-5);
    expect(comparator('5', '5')).toBe(0);
  });

  it('should set canEditOnlyOnNewRow based on permissions for editable columns', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libelleCol = columnDefs.find(col => col.field === 'libelle');
    const lineNumberCol = columnDefs.find(col => col.field === 'lineNumber');

    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(lineNumberCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should have correct delete messages configuration', () => {
    service.getColumnDefs(true);

    const deleteParams = mockTableauUtilService.getColsDefAction.calls.mostRecent().args[2] as any;
    expect(deleteParams.delete.cellRendererParams.messages).toEqual([
      "Suppression d'une réédition",
      'Vous êtes sur le point de supprimer la réédition',
      'Vous êtes sur le point de supprimer les rééditions',
      'Suppression des rééditions',
      'Les rééditions suivantes ne peuvent pas être supprimées',
      'La réédition suivante ne peut pas être supprimée',
    ]);
  });

  it('should concatenate action columns and data columns in correct order', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];

    expect(columnDefs[0].field).toBe('select');
    expect(columnDefs[1].field).toBe('actions');

    const dataColumns = columnDefs.slice(2);
    expect(dataColumns.find(col => col.field === 'reference')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'type')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'libelle')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'lineNumber')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'columnNumber')).toBeDefined();
    expect(dataColumns.find(col => col.field === 'length')).toBeDefined();
  });
});

