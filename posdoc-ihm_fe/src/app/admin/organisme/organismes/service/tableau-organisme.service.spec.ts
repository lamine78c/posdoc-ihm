import { TestBed } from '@angular/core/testing';
import { TableauOrganismeService } from './tableau-organisme.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef, ColGroupDef } from 'ag-grid-community';

describe('TableauOrganismeService', () => {
  let service: TableauOrganismeService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;

  beforeEach(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockFormattersService = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauOrganismeService,
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: FormattersService, useValue: mockFormattersService }
      ]
    });
    service = TestBed.inject(TableauOrganismeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrganisme', () => {
    it('should return column definition for organisme with correct properties', () => {
      const colDef = service.getOrganisme() as ColDef;

      expect(colDef.headerName).toBe('Organisme');
      expect(colDef.field).toBe('code');
      expect(colDef.sort).toBe('asc');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agTextColumnFilter');
      expect(colDef.floatingFilter).toBe(true);
      expect(colDef.cellRendererParams.formKey).toBe('code');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    });
  });

  describe('getLibelle', () => {
    it('should return column definition for libelle when user has permission', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getLibelle() as ColDef;

      expect(colDef.headerName).toBe('Libellé');
      expect(colDef.field).toBe('libelle');
      expect(colDef.cellRendererParams.formKey).toBe('libelle');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
      expect(colDef.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', '(', ')']);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.libelle);
    });

    it('should return column definition for libelle when user does not have permission', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getLibelle() as ColDef;

      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    });
  });

  describe('getAdresse fields', () => {
    it('should configure adresse1 column with correct validators and permissions', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getAdresse1() as ColDef;

      expect(colDef.headerName).toBe('Adresse 1');
      expect(colDef.field).toBe('adresse1');
      expect(colDef.cellRendererParams.formKey).toBe('adresse1');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(colDef.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ']);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.adresse1);
    });

    it('should configure adresse2 column with correct properties', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getAdresse2() as ColDef;

      expect(colDef.headerName).toBe('Adresse 2');
      expect(colDef.field).toBe('adresse2');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    });

    it('should configure adresse3 column with correct properties', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getAdresse3() as ColDef;

      expect(colDef.headerName).toBe('Adresse 3');
      expect(colDef.field).toBe('adresse3');
      expect(colDef.cellRendererParams.formKey).toBe('adresse3');
    });

    it('should configure adresse4 column with correct properties', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getAdresse4() as ColDef;

      expect(colDef.headerName).toBe('Adresse 4');
      expect(colDef.field).toBe('adresse4');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    });
  });

  describe('getType', () => {
    it('should configure type column with select editor and possible values', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getType() as ColDef;

      expect(colDef.headerName).toBe('Type Organisme');
      expect(colDef.field).toBe('type');
      expect(colDef.cellRendererParams.formKey).toBe('type');
      expect(colDef.cellRendererParams.values).toEqual(['R', 'F']);
      expect(colDef.cellRendererParams.hasBlankOption).toBe(true);
      expect(colDef.floatingFilterComponentParams.possibleValues).toEqual(['R', 'F']);
    });
  });

  describe('getCodeRegion', () => {
    it('should configure code region column with select editor', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getCodeRegion() as ColDef;

      expect(colDef.headerName).toBe('Code Région');
      expect(colDef.field).toBe('codeRegion');
      expect(colDef.cellRendererParams.formKey).toBe('codeRegion');
      expect(colDef.cellRendererParams.hasBlankOption).toBe(true);
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(colDef.filter).toBe('agSetColumnFilter');
    });
  });

  describe('getCodeSite', () => {
    it('should configure code site column with select editor', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getCodeSite() as ColDef;

      expect(colDef.headerName).toBe('Code Site');
      expect(colDef.field).toBe('codeSite');
      expect(colDef.cellRendererParams.formKey).toBe('codeSite');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
      expect(colDef.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    });
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return the correct no rows template', () => {
      const template = service.getOverlayNoRowsTemplate();

      expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
    });
  });

  describe('getColumnDefs', () => {
    it('should return all column definitions with action columns when isColSelectAll is true', () => {
      const mockActionCols: (ColDef | ColGroupDef)[] = [{ field: 'action' } as ColDef];
      mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(true);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.ORGANISMES.ORGANISME,
        { isColSelectAll: true },
        jasmine.objectContaining({
          delete: jasmine.objectContaining({
            cellRendererParams: jasmine.objectContaining({
              idsLabel: ['code']
            })
          })
        })
      );
      expect(result.length).toBe(10);
    });

    it('should configure delete action with correct messages', () => {
      const mockActionCols: (ColDef | ColGroupDef)[] = [];
      mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);
      mockPermissionService.hasPermission.and.returnValue(false);

      service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.ORGANISMES.ORGANISME,
        { isColSelectAll: false },
        jasmine.objectContaining({
          delete: {
            cellRendererParams: {
              idsLabel: ['code'],
              messages: [
                "Suppression d'un organisme",
                "Vous êtes sur le point de supprimer l'organisme",
                'Vous êtes sur le point de supprimer les organismes',
                'Suppression des organismes',
                'Les organismes suivants ne peuvent pas être supprimés',
                "L'organisme suivant ne peut pas être supprimé"
              ]
            }
          }
        })
      );
    });
  });
});
