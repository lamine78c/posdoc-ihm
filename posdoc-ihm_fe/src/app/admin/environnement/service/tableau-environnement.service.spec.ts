import { TestBed } from '@angular/core/testing';
import { ColDef, ColGroupDef } from 'ag-grid-community';

import { TableauEnvironnementService } from './tableau-environnement.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';

describe('TableauEnvironnementService', () => {
  let service: TableauEnvironnementService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;

  const mockActionColumns = [
    { field: 'select', headerName: 'Select' },
    { field: 'actions', headerName: 'Actions' }
  ];

  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    const formattersServiceSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauEnvironnementService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
        { provide: FormattersService, useValue: formattersServiceSpy }
      ]
    });

    service = TestBed.inject(TableauEnvironnementService);
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockFormattersService = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;

    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockFormattersService.toUpperCase.and.returnValue(jasmine.createSpy('toUpperCaseFormatter'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const template = service.getOverlayNoRowsTemplate();

    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions with select all column when isColSelectAll is true', () => {
    mockPermissionService.hasPermission.and.returnValue(true);

    const columns = service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.ENVIRONNEMENTS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['code']
          })
        })
      })
    );
    expect(columns.length).toBeGreaterThanOrEqual(4);
  });

  it('should return column definitions without select all column when isColSelectAll is false', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    const columns = service.getColumnDefs(false);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.ENVIRONNEMENTS,
      { isColSelectAll: false },
      jasmine.any(Object)
    );
    expect(columns.length).toBeGreaterThanOrEqual(4);
  });

  it('should configure code column correctly', () => {
    const columns = service.getColumnDefs(true);
    const codeColumn = columns.find(col => (col as ColDef).field === 'code') as ColDef;

    expect(codeColumn).toBeTruthy();
    expect(codeColumn.headerName).toBe(' Environnement');
    expect(codeColumn.field).toBe('code');
    expect(codeColumn.sort).toBe('asc');
    expect(codeColumn.sortable).toBe(true);
    expect(codeColumn.filter).toBe('agTextColumnFilter');
    expect(codeColumn.floatingFilter).toBe(true);
    expect(codeColumn.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure libelle column correctly', () => {
    const columns = service.getColumnDefs(true);
    const libelleColumn = columns.find(col => (col as ColDef).field === 'libelle') as ColDef;

    expect(libelleColumn).toBeTruthy();
    expect(libelleColumn.headerName).toBe('Libellé');
    expect(libelleColumn.field).toBe('libelle');
    expect(libelleColumn.sortable).toBe(true);
    expect(libelleColumn.filter).toBe('agTextColumnFilter');
    expect(libelleColumn.floatingFilter).toBe(true);
    expect(libelleColumn.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure code column renderer parameters correctly', () => {
    const columns = service.getColumnDefs(true);
    const codeColumn = columns.find(col => (col as ColDef).field === 'code') as ColDef;
    const rendererParams = codeColumn.cellRendererParams;

    expect(rendererParams.formKey).toBe('code');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(rendererParams.inputInput).toBeDefined();
    expect(rendererParams.validators).toBeDefined();
    expect(rendererParams.validators.length).toBe(2);
  });

  it('should configure libelle column renderer parameters with permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(true);

    const columns = service.getColumnDefs(true);
    const libelleColumn = columns.find(col => (col as ColDef).field === 'libelle') as ColDef;
    const rendererParams = libelleColumn.cellRendererParams;

    expect(rendererParams.formKey).toBe('libelle');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(rendererParams.validators).toBeDefined();
    expect(rendererParams.allowedCharacters).toEqual(['-', '_', ' ']);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.libelle);
  });

  it('should configure libelle column renderer parameters without permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    const columns = service.getColumnDefs(true);
    const libelleColumn = columns.find(col => (col as ColDef).field === 'libelle') as ColDef;
    const rendererParams = libelleColumn.cellRendererParams;

    expect(rendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.libelle);
  });

  it('should configure delete action parameters correctly', () => {
    service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.ENVIRONNEMENTS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['code'],
            messages: jasmine.arrayContaining([
              "Suppression d'un environnement",
              "Vous êtes sur le point de supprimer l'environnement",
              'Vous êtes sur le point de supprimer les environnements',
              'Suppression des environnements',
              'Les environnements suivants ne peuvent pas être supprimés',
              "L'environnement suivant ne peut pas être supprimé"
            ])
          })
        })
      })
    );
  });
});
