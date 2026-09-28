import { TestBed } from '@angular/core/testing';
import { TableauParamsAdelaideService } from './tableau-params-adelaide.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef, ColGroupDef } from 'ag-grid-community';

describe('TableauParamsAdelaideService', () => {
  let service: TableauParamsAdelaideService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;

  beforeEach(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockFormattersService = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauParamsAdelaideService,
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: FormattersService, useValue: mockFormattersService }
      ]
    });
    service = TestBed.inject(TableauParamsAdelaideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCode', () => {
    it('should return column definition for code with correct properties', () => {
      const colDef = service.getCode() as ColDef;

      expect(colDef.headerName).toBe('Code');
      expect(colDef.field).toBe('code');
      expect(colDef.flex).toBe(1);
      expect(colDef.sort).toBe('asc');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agTextColumnFilter');
      expect(colDef.floatingFilter).toBe(true);
    });

    it('should configure code column with InputEditorComponent and validators', () => {
      const colDef = service.getCode() as ColDef;

      expect(colDef.cellRendererParams).toBeDefined();
      expect(colDef.cellRendererParams.formKey).toBe('code');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(colDef.cellRendererParams.validators).toBeDefined();
      expect(colDef.cellRendererParams.validators.length).toBe(2);
    });
  });

  describe('getValeur', () => {
    it('should return column definition for valeur when user has permission', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getValeur() as ColDef;

      expect(colDef.headerName).toBe('Valeur');
      expect(colDef.field).toBe('value');
      expect(colDef.flex).toBe(1);
      expect(colDef.sortable).toBe(true);
      expect(colDef.cellRendererParams.formKey).toBe('value');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.valeur);
    });

    it('should return column definition for valeur when user does not have permission', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getValeur() as ColDef;

      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.valeur);
    });

    it('should configure valeur column with validators and allowed characters', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getValeur() as ColDef;

      expect(colDef.cellRendererParams.validators).toBeDefined();
      expect(colDef.cellRendererParams.validators.length).toBe(2);
      expect(colDef.cellRendererParams.allowedCharacters).toEqual(['.', '-', '_', '$', '{', '}', ' ', '/', '*', ':']);
    });
  });

  describe('getLibelle', () => {
    it('should return column definition for libelle when user has permission', () => {
      mockPermissionService.hasPermission.and.returnValue(true);

      const colDef = service.getLibelle() as ColDef;

      expect(colDef.headerName).toBe('Libellé');
      expect(colDef.field).toBe('libelle');
      expect(colDef.flex).toBe(1);
      expect(colDef.sortable).toBe(true);
      expect(colDef.cellRendererParams.formKey).toBe('libelle');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.libelle);
    });

    it('should return column definition for libelle when user does not have permission', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getLibelle() as ColDef;

      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.libelle);
    });

    it('should configure libelle column with toUpperCase formatter and allowed characters', () => {
      mockPermissionService.hasPermission.and.returnValue(false);

      const colDef = service.getLibelle() as ColDef;

      expect(colDef.cellRendererParams.inputInput).toBe(mockFormattersService.toUpperCase);
      expect(colDef.cellRendererParams.validators).toBeDefined();
      expect(colDef.cellRendererParams.allowedCharacters).toEqual(['-', '(', ')', ' ']);
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
        AUTH.ADMINISTRATION.MOTEUR_ADELAIDE,
        { isColSelectAll: true },
        jasmine.objectContaining({
          delete: jasmine.objectContaining({
            cellRendererParams: jasmine.objectContaining({
              idsLabel: ['code']
            })
          })
        })
      );
      expect(result.length).toBe(4);
    });

    it('should return all column definitions with action columns when isColSelectAll is false', () => {
      const mockActionCols: (ColDef | ColGroupDef)[] = [{ field: 'action' } as ColDef];
      mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);
      mockPermissionService.hasPermission.and.returnValue(false);

      const result = service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.MOTEUR_ADELAIDE,
        { isColSelectAll: false },
        jasmine.any(Object)
      );
      expect(result.length).toBe(4);
    });

    it('should configure delete action with correct messages', () => {
      const mockActionCols: (ColDef | ColGroupDef)[] = [];
      mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);
      mockPermissionService.hasPermission.and.returnValue(false);

      service.getColumnDefs(true);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.MOTEUR_ADELAIDE,
        jasmine.any(Object),
        jasmine.objectContaining({
          delete: {
            cellRendererParams: {
              idsLabel: ['code'],
              messages: [
                "Suppression d'un paramètre Adelaïde",
                'Vous êtes sur le point de supprimer le paramètre Adelaïde',
                'Vous êtes sur le point de supprimer les paramètres Adelaïde',
                'Suppression des paramètres Adelaïde',
                'Les paramètres Adelaïde suivants ne peuvent pas être supprimés',
                'Le paramètre Adelaïde suivant ne peut pas être supprimé',
              ],
            },
          },
        })
      );
    });
  });
});
