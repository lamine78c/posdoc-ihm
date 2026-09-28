import { TestBed } from '@angular/core/testing';

import { TableauParametreDistributionService } from './tableau-parametre-distribution.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';

describe('TableauParametreDistributionService', () => {
  let service: TableauParametreDistributionService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;

  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const formattersServiceSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    const tableauConfigBuilderSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['build']);

    TestBed.configureTestingModule({
      providers: [
        TableauParametreDistributionService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigBuilderSpy }
      ]
    });

    service = TestBed.inject(TableauParametreDistributionService);
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockFormattersService = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return correct no rows template', () => {
      const result = service.getOverlayNoRowsTemplate();
      expect(result).toBe('<span class="no-rows">Aucun résultat</span>');
    });

    it('should return HTML string with correct CSS class', () => {
      const result = service.getOverlayNoRowsTemplate();
      expect(result).toContain('class="no-rows"');
      expect(result).toContain('<span');
      expect(result).toContain('</span>');
    });
  });

  describe('getColumnDefs', () => {
    beforeEach(() => {
      mockTableauUtilService.getColsDefAction.and.returnValue([
        { headerName: 'Actions', field: 'actions' }
      ]);
    });

    it('should return column definitions with action columns when isColSelectAll is true', () => {
      const result = service.getColumnDefs(true);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS,
        jasmine.objectContaining({ isColCollapse: true, isColSelectAll: true }),
        jasmine.any(Object)
      );
      expect(result.length).toBeGreaterThan(3);
    });

    it('should return column definitions with action columns when isColSelectAll is false', () => {
      const result = service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS,
        jasmine.objectContaining({ isColCollapse: true, isColSelectAll: false }),
        jasmine.any(Object)
      );
      expect(result.length).toBeGreaterThan(3);
    });

    it('should include reference column with correct configuration', () => {
      const result = service.getColumnDefs(true);
      const referenceColumn = result.find(col => (col as ColDef).field === 'reference') as ColDef;

      expect(referenceColumn).toBeTruthy();
      expect(referenceColumn.headerName).toBe('Référence');
      expect(referenceColumn.sortable).toBe(true);
      expect(referenceColumn.sort).toBe('asc');
      expect(referenceColumn.filter).toBe('agTextColumnFilter');
    });

    it('should include libelle column with correct configuration', () => {
      const result = service.getColumnDefs(true);
      const libelleColumn = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect(libelleColumn).toBeTruthy();
      expect(libelleColumn.headerName).toBe('Libellé');
      expect(libelleColumn.sortable).toBe(true);
      expect(libelleColumn.filter).toBe('agTextColumnFilter');
    });

    it('should include logicielDistribution column with correct configuration', () => {
      const result = service.getColumnDefs(true);
      const logicielColumn = result.find(col => (col as ColDef).field === 'logicielDistribution') as ColDef;

      expect(logicielColumn).toBeTruthy();
      expect(logicielColumn.headerName).toBe('Logiciel Distribution');
      expect(logicielColumn.sortable).toBe(true);
      expect(logicielColumn.filter).toBe('agSetColumnFilter');
    });
  });

  describe('column permissions', () => {
    beforeEach(() => {
      mockTableauUtilService.getColsDefAction.and.returnValue([
        { headerName: 'Actions', field: 'actions' }
      ]);
    });

    it('should configure libelle column as non-editable when user has no permission', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(true);
      const libelleColumn = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect((libelleColumn as any).cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    });

    it('should configure libelle column as editable when user has permission', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const result = service.getColumnDefs(true);
      const libelleColumn = result.find(col => (col as ColDef).field === 'libelle') as ColDef;

      expect((libelleColumn as any).cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    });

    it('should configure logicielDistribution column based on permissions', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(true);
      const logicielColumn = result.find(col => (col as ColDef).field === 'logicielDistribution') as ColDef;

      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS.logiciel_distribution
      );
      expect((logicielColumn as any).cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    });
  });

  describe('action column configuration', () => {
    beforeEach(() => {
      mockTableauUtilService.getColsDefAction.and.returnValue([
        { headerName: 'Actions', field: 'actions' }
      ]);
    });

    it('should pass correct delete configuration parameters', () => {
      service.getColumnDefs(true);

      const expectedParams = jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['reference'],
            messages: jasmine.arrayContaining([
              "Suppression d'une distribution",
              'Vous êtes sur le point de supprimer le paramètre de distribution'
            ])
          })
        })
      });

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS,
        jasmine.any(Object),
        expectedParams
      );
    });
  });
});
