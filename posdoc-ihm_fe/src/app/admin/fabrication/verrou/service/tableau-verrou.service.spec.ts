import { TestBed } from '@angular/core/testing';
import { TableauVerrouService } from './tableau-verrou.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { ColDef } from 'ag-grid-community';

describe('TableauVerrouService', () => {
  let service: TableauVerrouService;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let tableauUtilServiceSpy: jasmine.SpyObj<TableauUtilService>;
  let formattersServiceSpy: jasmine.SpyObj<FormattersService>;

  beforeEach(() => {
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    const formattersSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauVerrouService,
        { provide: PermissionService, useValue: permissionSpy },
        { provide: TableauUtilService, useValue: tableauUtilSpy },
        { provide: FormattersService, useValue: formattersSpy },
      ],
    });

    service = TestBed.inject(TableauVerrouService);
    permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    tableauUtilServiceSpy = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    formattersServiceSpy = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;

    tableauUtilServiceSpy.getColsDefAction.and.returnValue([{ headerName: 'Actions', field: 'actions' }]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions with action columns', () => {
    const mockActionCols = [{ headerName: 'Action1', field: 'action1' }];
    tableauUtilServiceSpy.getColsDefAction.and.returnValue(mockActionCols);

    const columnDefs = service.getColumnDefs(true);

    expect(tableauUtilServiceSpy.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.FABRICATION.VERROUS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['code'],
            messages: jasmine.any(Array),
          }),
        }),
      })
    );
    expect(columnDefs[0]).toEqual(mockActionCols[0]);
  });

  it('should configure all 3 main columns correctly', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const codeCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;
    const maxExecutionCol = columnDefs.find((col: ColDef) => col.field === 'maxExecution') as ColDef;

    expect(codeCol.headerName).toBe('Verrou');
    expect(codeCol.cellRenderer).toBe(InputEditorComponent);
    expect(codeCol.sort).toBe('asc');
    expect(libelleCol.headerName).toBe('Libellé');
    expect(libelleCol.cellRenderer).toBe(InputEditorComponent);
    expect(maxExecutionCol.headerName).toBe('Valeur Maxi');
    expect(maxExecutionCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure validators and allowed characters correctly', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const codeCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;
    const maxExecutionCol = columnDefs.find((col: ColDef) => col.field === 'maxExecution') as ColDef;

    expect(codeCol.cellRendererParams.validators).toBeDefined();
    expect(codeCol.cellRendererParams.validators.length).toBe(2);
    expect(libelleCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ']);
    expect(libelleCol.cellRendererParams.validators.length).toBe(2);
    expect(maxExecutionCol.cellRendererParams.validators).toBeDefined();
    expect(maxExecutionCol.cellRendererParams.validators.length).toBe(3);
  });

  it('should configure toUpperCase formatter for code and libelle', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const codeCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;

    expect(codeCol.cellRendererParams.inputInput).toBe(formattersServiceSpy.toUpperCase);
    expect(libelleCol.cellRendererParams.inputInput).toBe(formattersServiceSpy.toUpperCase);
  });

  it('should allow editing libelle when permission is granted', () => {
    permissionServiceSpy.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;

    expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.FABRICATION.VERROUS.libelle);
    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should restrict editing libelle when permission is denied', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;

    expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.FABRICATION.VERROUS.libelle);
    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should allow editing maxExecution when permission is granted', () => {
    permissionServiceSpy.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const maxExecutionCol = columnDefs.find((col: ColDef) => col.field === 'maxExecution') as ColDef;

    expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.FABRICATION.VERROUS.max_execution
    );
    expect(maxExecutionCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should restrict editing maxExecution when permission is denied', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const maxExecutionCol = columnDefs.find((col: ColDef) => col.field === 'maxExecution') as ColDef;

    expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.FABRICATION.VERROUS.max_execution
    );
    expect(maxExecutionCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should always restrict Verrou column to new rows only', () => {
    permissionServiceSpy.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const codeCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;

    expect(codeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should configure maxExecution with right-aligned cell style', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const maxExecutionCol = columnDefs.find((col: ColDef) => col.field === 'maxExecution') as ColDef;

    expect(maxExecutionCol.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(maxExecutionCol.valueGetter).toBeDefined();
  });

  it('should configure floating filters correctly', () => {
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const codeCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;
    const maxExecutionCol = columnDefs.find((col: ColDef) => col.field === 'maxExecution') as ColDef;

    expect(codeCol.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(libelleCol.floatingFilterComponent).toBe('inputFilter');
    expect(maxExecutionCol.floatingFilterComponent).toBe('inputFilter');
  });
});
