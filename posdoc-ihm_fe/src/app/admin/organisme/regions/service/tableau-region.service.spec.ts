import { TestBed } from '@angular/core/testing';
import { TableauRegionService } from './tableau-region.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef, ColGroupDef } from 'ag-grid-community';

describe('TableauRegionService', () => {
  let service: TableauRegionService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;

  beforeEach(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockFormattersService = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauRegionService,
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: FormattersService, useValue: mockFormattersService }
      ]
    });
    service = TestBed.inject(TableauRegionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getColumnDefs', () => {
    it('should return column definitions with code and libelle columns', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(false);

      const codeCol = result.find(col => (col as ColDef).field === 'code') as ColDef;
      const libelleCol = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect(codeCol).toBeDefined();
      expect(codeCol.headerName).toBe('Région');
      expect(codeCol.sort).toBe('asc');
      expect(codeCol.sortable).toBe(true);

      expect(libelleCol).toBeDefined();
      expect(libelleCol.headerName).toBe('Libellé');
      expect(libelleCol.sortable).toBe(true);
    });

    it('should configure code column as editable only on new rows', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(false);
      const codeCol = result.find(col => (col as ColDef).field === 'code') as ColDef;

      expect(codeCol.cellRendererParams.formKey).toBe('code');
      expect(codeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(codeCol.cellRendererParams.validators).toBeDefined();
      expect(codeCol.cellRendererParams.validators.length).toBe(2);
    });

    it('should configure libelle column based on user permissions - with permission', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(true);

      const result = service.getColumnDefs(false);
      const libelleCol = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect(libelleCol.cellRendererParams.formKey).toBe('libelle');
      expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
      expect(libelleCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ']);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.ORGANISMES.REGION.libelle);
    });

    it('should configure libelle column based on user permissions - without permission', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(false);
      const libelleCol = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    });

    it('should apply toUpperCase formatter to both columns', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(false);
      const codeCol = result.find(col => (col as ColDef).field === 'code') as ColDef;
      const libelleCol = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect(codeCol.cellRendererParams.inputInput).toBe(mockFormattersService.toUpperCase);
      expect(libelleCol.cellRendererParams.inputInput).toBe(mockFormattersService.toUpperCase);
    });
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return the correct no rows template', () => {
      const template = service.getOverlayNoRowsTemplate();
      expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
    });
  });

  describe('action columns', () => {
    it('should include action columns when isColSelectAll is true', () => {
      const mockActionCols: (ColDef | ColGroupDef)[] = [{ field: 'action' } as ColDef];
      mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(true);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.ORGANISMES.REGION,
        { isColSelectAll: true },
        jasmine.objectContaining({
          delete: jasmine.objectContaining({
            cellRendererParams: jasmine.objectContaining({
              idsLabel: ['code']
            })
          })
        })
      );
      expect(result.length).toBe(3);
    });

    it('should configure delete action with correct messages', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(false);

      service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.ORGANISMES.REGION,
        { isColSelectAll: false },
        jasmine.objectContaining({
          delete: {
            cellRendererParams: {
              idsLabel: ['code'],
              messages: [
                "Suppression d'une région",
                'Vous êtes sur le point de supprimer la région',
                'Vous êtes sur le point de supprimer les régions',
                'Suppression des régions',
                'Les régions suivantes ne peuvent pas être supprimées',
                'La région suivante ne peut pas être supprimée'
              ]
            }
          }
        })
      );
    });
  });

  describe('column filters', () => {
    it('should configure text filters with floating filters for all columns', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(false);
      const codeCol = result.find(col => (col as ColDef).field === 'code') as ColDef;
      const libelleCol = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect(codeCol.filter).toBe('agTextColumnFilter');
      expect(codeCol.floatingFilter).toBe(true);
      expect(codeCol.floatingFilterComponent).toBe('inputFilter');

      expect(libelleCol.filter).toBe('agTextColumnFilter');
      expect(libelleCol.floatingFilter).toBe(true);
      expect(libelleCol.floatingFilterComponent).toBe('inputFilter');
    });
  });
});
