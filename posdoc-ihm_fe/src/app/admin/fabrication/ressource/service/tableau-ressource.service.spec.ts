import { TestBed } from '@angular/core/testing';

import { TableauRessourceService } from './tableau-ressource.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';

describe('TableauRessourceService', () => {
  let service: TableauRessourceService;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;

  beforeEach(() => {
    const formattersServiceSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    const filterSharedDataServiceSpy = jasmine.createSpyObj('FilterSharedDataService', ['updateData']);

    TestBed.configureTestingModule({
      providers: [
        TableauRessourceService,
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
        { provide: FilterSharedDataService, useValue: filterSharedDataServiceSpy }
      ]
    });

    service = TestBed.inject(TableauRessourceService);
    mockFormattersService = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockFilterSharedDataService = TestBed.inject(FilterSharedDataService) as jasmine.SpyObj<FilterSharedDataService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct overlay template for no rows', () => {
    const overlayTemplate = service.getOverlayNoRowsTemplate();
    expect(overlayTemplate).toEqual('<span class="no-rows">Aucun résultat</span>');
  });

  it('should call getColsDefAction with correct parameters when getting column definitions with select all enabled', () => {
    const mockActionCols = [{ field: 'actions' }];
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);

    const result = service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      jasmine.any(Object),
      { isColCollapse: true, isColSelectAll: true },
      jasmine.any(Object)
    );
    expect(result.length).toBeGreaterThan(1);
  });

  it('should call getColsDefAction with correct parameters when getting column definitions with select all disabled', () => {
    const mockActionCols = [{ field: 'actions' }];
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);

    const result = service.getColumnDefs(false);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      jasmine.any(Object),
      { isColCollapse: true, isColSelectAll: false },
      jasmine.any(Object)
    );
    expect(result.length).toBeGreaterThan(1);
  });

  it('should return column definitions with correct structure for environment column', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);

    const result = service.getColumnDefs(false);
    const envColumn = result.find((col: any) => col.field === 'codeEnvironnement') as any;

    expect(envColumn).toBeDefined();
    expect(envColumn.headerName).toBe('Environnement');
    expect(envColumn.sortable).toBe(true);
    expect(envColumn.sort).toBe('asc');
    expect(envColumn.filter).toBe('agSetColumnFilter');
    expect(envColumn.floatingFilter).toBe(true);
    expect(envColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(envColumn.cellRendererParams.formKey).toBe('codeEnvironnement');
  });

  it('should return column definitions with correct structure for application column', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);

    const result = service.getColumnDefs(false);
    const appColumn = result.find((col: any) => col.field === 'codeApplication') as any;

    expect(appColumn).toBeDefined();
    expect(appColumn.headerName).toBe('Application');
    expect(appColumn.cellRendererParams.formKey).toBe('codeApplication');
    expect(appColumn.cellRendererParams.hasBlankOption).toBe(true);
    expect(appColumn.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(appColumn.cellRendererParams.initWithNoData).toBe(true);
  });

  it('should return column definitions with correct structure for resource column', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);

    const result = service.getColumnDefs(false);
    const resourceColumn = result.find((col: any) => col.field === 'codeRessource') as any;

    expect(resourceColumn).toBeDefined();
    expect(resourceColumn.headerName).toBe('Ressource');
    expect(resourceColumn.cellRendererParams.formKey).toBe('ressource');
    expect(resourceColumn.cellRendererParams.allowedCharacters).toEqual(['-', '_', '#']);
    expect(resourceColumn.filter).toBe('agTextColumnFilter');
    expect(resourceColumn.cellRendererParams.inputInput).toBe(mockFormattersService.toUpperCase);
  });

  it('should handle environment column value change correctly', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const mockNode = { id: 'test-node' };
    const mockParams = { node: mockNode };

    const result = service.getColumnDefs(false);
    const envColumn = result.find((col: any) => col.field === 'codeEnvironnement') as any;

    envColumn.onCellValueChanged(mockParams);

    expect(mockFilterSharedDataService.updateData).toHaveBeenCalledWith({
      sujet: jasmine.any(String),
      node: mockNode
    });
  });

  it('should handle application column value change correctly', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const mockNode = { id: 'test-node' };
    const mockParams = { node: mockNode };

    const result = service.getColumnDefs(false);
    const appColumn = result.find((col: any) => col.field === 'codeApplication') as any;

    appColumn.onCellValueChanged(mockParams);

    expect(mockFilterSharedDataService.updateData).toHaveBeenCalledWith({
      sujet: jasmine.any(String),
      node: mockNode
    });
  });

  it('should configure delete action parameters correctly including all required fields and messages', () => {
    const mockActionCols = [{ field: 'actions' }];
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionCols);

    service.getColumnDefs(true);

    const deleteParamsCall = mockTableauUtilService.getColsDefAction.calls.mostRecent().args[2] as any;
    expect(deleteParamsCall.delete.cellRendererParams.idsLabel).toEqual([
      'codeEnvironnement', 'codeOrganisme', 'codeApplication',
      'codeGamme', 'codeSite', 'codeRessource'
    ]);
    expect(deleteParamsCall.delete.cellRendererParams.idsLabelSeparator).toBe('|');
    expect(deleteParamsCall.delete.cellRendererParams.messages).toHaveSize(6);
    expect(deleteParamsCall.delete.cellRendererParams.messages[0]).toBe('Suppression de ressources');
    expect(deleteParamsCall.delete.cellRendererParams.messages[1]).toBe('Vous êtes sur le point de supprimer la ressource');
  });
});
