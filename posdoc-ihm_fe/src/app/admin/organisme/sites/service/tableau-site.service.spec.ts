import { TestBed } from '@angular/core/testing';
import { TableauSiteService } from './tableau-site.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef, ColGroupDef } from 'ag-grid-community';

describe('TableauSiteService', () => {
  let service: TableauSiteService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockFormattersService = jasmine.createSpyObj('FormattersService', ['toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauSiteService,
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: FormattersService, useValue: mockFormattersService }
      ]
    });
    service = TestBed.inject(TableauSiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCode', () => {
    it('should return column definition for code with correct properties', () => {
      const colDef = service.getCode() as ColDef;

      expect(colDef.headerName).toBe('Code');
      expect(colDef.field).toBe('code');
      expect(colDef.sort).toBe('asc');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agTextColumnFilter');
      expect(colDef.floatingFilter).toBe(true);
      expect(colDef.cellRendererParams.formKey).toBe('code');
      expect(colDef.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
      expect(colDef.cellRendererParams.inputInput).toBe(mockFormattersService.toUpperCase);
    });
  });

  describe('getHost', () => {
    it('should return column definition for host with correct properties', () => {
      const colDef = service.getHost() as ColDef;

      expect(colDef.headerName).toBe('Serveur');
      expect(colDef.field).toBe('host');
      expect(colDef.sortable).toBe(true);
      expect(colDef.cellRendererParams.formKey).toBe('libelle');
      expect(colDef.cellRendererParams.allowedCharacters).toEqual(['-', '_', '.']);
      expect(colDef.cellRendererParams.validators).toBeDefined();
    });
  });

  describe('getRessourceDelestage', () => {
    it('should configure ressource delestage column with select editor', () => {
      const colDef = service.getRessourceDelestage() as ColDef;

      expect(colDef.headerName).toBe('Ressource Délestage');
      expect(colDef.field).toBe('ressourceDelestage');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agSetColumnFilter');
      expect(colDef.floatingFilterComponent).toBe('multiSelectFloatingFilter');
      expect(colDef.cellRendererParams.formKey).toBe('ressourceDelestage');
      expect(colDef.cellRendererParams.hasBlankOption).toBe(true);
      expect(colDef.cellRendererParams.validators).toBeDefined();
    });
  });

  describe('getUsername', () => {
    it('should configure username column with correct properties', () => {
      const colDef = service.getUsername() as ColDef;

      expect(colDef.headerName).toBe('Utilisateur');
      expect(colDef.field).toBe('username');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agTextColumnFilter');
      expect(colDef.cellRendererParams.formKey).toBe('libelle');
      expect(colDef.cellRendererParams.validators).toBeDefined();
    });
  });

  describe('getPassword', () => {
    it('should configure password column with correct properties', () => {
      const colDef = service.getPassword() as ColDef;

      expect(colDef.headerName).toBe('Mot de passe');
      expect(colDef.field).toBe('password');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agTextColumnFilter');
      expect(colDef.cellRendererParams.formKey).toBe('libelle');
      expect(colDef.cellRendererParams.validators).toBeDefined();
    });
  });

  describe('getOrganismeMassification', () => {
    it('should configure organisme massification column with multi-select editor', () => {
      const colDef = service.getOrganismeMassification() as ColDef;

      expect(colDef.headerName).toBe('Organisme de massification');
      expect(colDef.field).toBe('organismeMassification');
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe('agSetColumnFilter');
      expect(colDef.floatingFilterComponent).toBe('multiSelectFloatingFilter');
      expect(colDef.cellRendererParams.formKey).toBe('organismeMassification');
      expect(colDef.cellRendererParams.values).toEqual([]);
      expect(colDef.cellRendererParams.validators).toBeDefined();
    });
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return the correct no rows template', () => {
      const template = service.getOverlayNoRowsTemplate();
      expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
    });
  });

  describe('getColumnDefs', () => {
    it('should return all column definitions with action columns', () => {
      const mockActionCols: (ColDef | ColGroupDef)[] = [{ field: 'action' } as ColDef];
      mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);

      const result = service.getColumnDefs(true);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.ORGANISMES.SITE,
        { isColSelectAll: true },
        jasmine.objectContaining({
          delete: jasmine.objectContaining({
            cellRendererParams: jasmine.objectContaining({
              idsLabel: ['code']
            })
          })
        })
      );
      expect(result.length).toBe(7);
    });

    it('should configure delete action with correct messages', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);

      service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.ORGANISMES.SITE,
        { isColSelectAll: false },
        jasmine.objectContaining({
          delete: {
            cellRendererParams: {
              idsLabel: ['code'],
              messages: [
                "Suppression d'une site",
                'Vous êtes sur le point de supprimer la site',
                'Vous êtes sur le point de supprimer les sites',
                'Suppression des sites',
                'Les sites suivants ne peuvent pas être supprimés',
                'Le site suivant ne peut pas être supprimé'
              ]
            }
          }
        })
      );
    });
  });

  describe('column filters', () => {
    it('should configure appropriate filters for all columns', () => {
      mockTableauUtilService.getColsDefAction.and.returnValue([]);

      const result = service.getColumnDefs(false);
      const codeCol = result.find(col => (col as ColDef).field === 'code') as ColDef;
      const ressourceCol = result.find(col => (col as ColDef).field === 'ressourceDelestage') as ColDef;

      expect(codeCol.filter).toBe('agTextColumnFilter');
      expect(codeCol.floatingFilter).toBe(true);
      expect(ressourceCol.filter).toBe('agSetColumnFilter');
      expect(ressourceCol.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    });
  });
});

