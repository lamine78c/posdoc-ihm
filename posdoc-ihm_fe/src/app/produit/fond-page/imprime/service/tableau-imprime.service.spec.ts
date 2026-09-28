import { TestBed } from '@angular/core/testing';

import { TableauImprimeService } from './tableau-imprime.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef } from 'ag-grid-community';
import { AUTH } from '@app/services/permission/PermissionsFile';

describe('TableauImprimeService', () => {
  let service: TableauImprimeService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockActionColumns = [
    { field: 'select', headerName: 'Select' },
    { field: 'actions', headerName: 'Actions' },
  ];

  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [
        TableauImprimeService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    }).compileComponents();
    service = TestBed.inject(TableauImprimeService);

    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return all columns in correct order', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true);
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(8);
  });

  it('should configure reference column', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columns = service.getColumnDefs(true);
    const col = columns.find(col => (col as ColDef).field === 'reference') as ColDef;
    const rendererParams = col.cellRendererParams;

    expect(rendererParams.formKey).toBe('reference');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(rendererParams.validators).toBeDefined();
    expect(rendererParams.allowedCharacters).toEqual(['-', '_', ' ']);
  });

  it('should configure libelle column', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columns = service.getColumnDefs(true);
    const col = columns.find(col => (col as ColDef).field === 'libelle') as ColDef;
    const rendererParams = col.cellRendererParams;

    expect(rendererParams.formKey).toBe('libelle');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(!mockPermissionService.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.designation));
    expect(rendererParams.validators).toBeDefined();
    expect(rendererParams.allowedCharacters).toEqual(['-', '_', ' ', '.', ',', "'"]);
  });

  it('should configure codeRND column', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columns = service.getColumnDefs(true);
    const col = columns.find(col => (col as ColDef).field === 'codeRND') as ColDef;
    const rendererParams = col.cellRendererParams;

    expect(rendererParams.formKey).toBe('codeRND');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(!mockPermissionService.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.code_rnd));
    expect(rendererParams.validators).toBeDefined();
  });

  it('should configure typeComposition column', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columns = service.getColumnDefs(true);
    const col = columns.find(col => (col as ColDef).field === 'typeComposition') as ColDef;
    const rendererParams = col.cellRendererParams;

    expect(rendererParams.formKey).toBe('typeComposition');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(
      !mockPermissionService.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.type_composition)
    );
    expect(rendererParams.validators).toBeDefined();
  });

  it('should configure typeCouleur column', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columns = service.getColumnDefs(true);
    const col = columns.find(col => (col as ColDef).field === 'typeCouleur') as ColDef;
    const rendererParams = col.cellRendererParams;

    expect(rendererParams.formKey).toBe('typeCouleur');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(!mockPermissionService.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.couleur));
    expect(rendererParams.validators).toBeDefined();
  });

  it('should configure rectoVerso column', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columns = service.getColumnDefs(true);
    const col = columns.find(col => (col as ColDef).field === 'rectoVerso') as ColDef;
    const rendererParams = col.cellRendererParams;

    expect(rendererParams.formKey).toBe('rectoVerso');
    expect(rendererParams.canEditOnlyOnNewRow).toBe(!mockPermissionService.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.recto_verso));
  });
});
