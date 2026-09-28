import { TestBed } from '@angular/core/testing';

import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef } from 'ag-grid-community';
import { TableauAffectationNoticeService } from './tableau-affectation-notice.service';

describe('TableauAffectationNoticeService', () => {
  let service: TableauAffectationNoticeService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockResponse = {
    node: { group: false },
    data: {
      codenv: 'P',
      codorg: '117',
      codapp: 'SNV2',
      codcom: 'AD04',
      codfic: 'L00',
      codeProd: 'QDI9A',
      refImprime: 'QDI9A11',
      dnotid: '2026-04-27',
      dnotit: '2026-04-28',
      maxnot: 0,
    },
  };

  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [
        TableauAffectationNoticeService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    }).compileComponents();
    service = TestBed.inject(TableauAffectationNoticeService);

    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows"><b>Veuillez remplir le formulaire pour sélectionner les notices à charger</b></span>');
  });

  it('should return all columns', () => {
    const mockActionColumns = [
      { field: 'select', headerName: 'Select' },
      { field: 'actions', headerName: 'Actions' },
    ];
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true);
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES,
      { isNoColEdit: true, isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['codenv_codorg_codapp', 'codcom_codfic'],
            idsLabelSeparator: '-',
            messages: jasmine.any(Array),
          }),
        }),
      })
    );
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(9);
  });

  it('should return columns for popup create', () => {
    const mockActionColumns = [
      { field: 'select', headerName: 'Select' },
      { field: 'actions', headerName: 'Actions' },
    ];
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefsPopupCreate();
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES,
      {
        isNoColEdit: true,
        isNoColDelete: true,
      },
      {}
    );
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(9);
  });

  it('should return only main columns', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs(false);
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(7);
  });

  it('main columns with definition validity', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const codenv_codorg_codapp = columnDefs.find((col: ColDef) => col.field === 'codenv_codorg_codapp') as ColDef;
    const codcom_codfic = columnDefs.find((col: ColDef) => col.field === 'codcom_codfic') as ColDef;
    const codeProd = columnDefs.find((col: ColDef) => col.field === 'codeProd') as ColDef;
    const refImprime = columnDefs.find((col: ColDef) => col.field === 'refImprime') as ColDef;
    const dnotid = columnDefs.find((col: ColDef) => col.field === 'dnotid') as ColDef;
    const dnotit = columnDefs.find((col: ColDef) => col.field === 'dnotit') as ColDef;
    const codnot = columnDefs.find((col: ColDef) => col.field === 'codnot') as ColDef;

    expect(codenv_codorg_codapp.headerName).toBe('Application');
    expect(codenv_codorg_codapp.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    const valueGetterApp = codenv_codorg_codapp.valueGetter as Function;
    expect(valueGetterApp(mockResponse)).toEqual('P-117-SNV2');

    expect(codcom_codfic.headerName).toBe('Fichier');
    expect(codcom_codfic.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codeProd.headerName).toBe('Code prd');
    expect(codeProd.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(refImprime.headerName).toBe('Imprimé');
    expect(refImprime.floatingFilterComponent).toBe('multiSelectFloatingFilter');

    expect(dnotid.headerName).toBe('Date début');
    expect(dnotid.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    const valueFormatterDnotid = dnotid.valueFormatter as Function;
    expect(valueFormatterDnotid(mockResponse)).toEqual('27/04/2026');

    expect(dnotit.headerName).toBe('Date fin');
    expect(dnotit.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    const valueFormatterDnotit = dnotit.valueFormatter as Function;
    expect(valueFormatterDnotit(mockResponse)).toEqual('28/04/2026');

    expect(codnot.headerName).toBe('Notice');
    expect(codnot.hide).toBeTruthy();
  });
});
