import { TestBed } from '@angular/core/testing';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { TableauNoticesFichiersService } from './tableau-notices-fichiers.service';

describe('TableauNoticesFichiersService', () => {
  let service: TableauNoticesFichiersService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [TableauNoticesFichiersService, { provide: TableauUtilService, useValue: mockTableauUtilService }],
    }).compileComponents();

    service = TestBed.inject(TableauNoticesFichiersService);
    mockTableauUtilService.getColsDefAction.and.returnValue([{ headerName: 'Actions', field: 'actions' }]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toBe('<span class="no-rows"><b>Veuillez remplir le formulaire pour rechercher les notices de fichiers</b></span>');
  });

  it('should return all columns with action columns', () => {
    const result = service.getColumnDefs();

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.NOTICES.NOTICES_FICHIERS,
      jasmine.objectContaining({
        isColCollapse: false,
        isNoColEdit: true,
        isNoColDelete: true,
        isColSelectAll: false,
      }),
      jasmine.any(Object)
    );

    // 1 action column + 5 data columns
    expect(result.length).toEqual(6);
  });

  it('main columns with definition validity', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();

    const colApp = columnDefs.find((col: any) => col.field === 'codenv_codorg_codapp') as ColDef;
    const colFic = columnDefs.find((col: any) => col.field === 'codcom_codfic') as ColDef;
    const colCodPrd = columnDefs.find((col: any) => col.field === 'codeProd') as ColDef;
    const colRefImp = columnDefs.find((col: any) => col.field === 'refImprime') as ColDef;
    const colNotices = columnDefs.find((col: any) => col.field === 'noticesString') as ColDef;

    expect(colApp).toBeDefined();
    expect(colFic).toBeDefined();
    expect(colCodPrd).toBeDefined();
    expect(colRefImp).toBeDefined();
    expect(colNotices).toBeDefined();

    expect(colApp.headerName).toBe('Application');
    expect(colFic.headerName).toBe('Fichier');
    expect(colCodPrd.headerName).toBe('Code prd');
    expect(colRefImp.headerName).toBe('Imprimé');
    expect(colNotices.headerName).toBe('Notices');

    expect(colApp.filter).toBe('agSetColumnFilter');
    expect(colApp.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colFic.filter).toBe('agSetColumnFilter');
    expect(colFic.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colCodPrd.filter).toBe('agSetColumnFilter');
    expect(colCodPrd.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colRefImp.filter).toBe('agSetColumnFilter');
    expect(colRefImp.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(colNotices.filter).toBe('agTextColumnFilter');

    expect(colApp.sortable).toBeTruthy();
    expect(colFic.sortable).toBeTruthy();
    expect(colCodPrd.sortable).toBeTruthy();
    expect(colRefImp.sortable).toBeTruthy();
    expect(colNotices.sortable).toBeTruthy();

    // Vérifier le floating filter
    expect(colApp.floatingFilter).toBeTruthy();
    expect(colFic.floatingFilter).toBeTruthy();
    expect(colCodPrd.floatingFilter).toBeTruthy();
    expect(colRefImp.floatingFilter).toBeTruthy();
    expect(colNotices.floatingFilter).toBeTruthy();
  });

  it('should have no valueFormatter for notices column', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();
    const colNotices = columnDefs.find((col: any) => col.field === 'noticesString') as ColDef;

    expect(colNotices.valueFormatter).toBeUndefined();
  });

  it('should have correct minWidth values', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();

    const colApp = columnDefs.find((col: any) => col.field === 'codenv_codorg_codapp') as ColDef;
    const colFic = columnDefs.find((col: any) => col.field === 'codcom_codfic') as ColDef;
    const colCodPrd = columnDefs.find((col: any) => col.field === 'codeProd') as ColDef;
    const colRefImp = columnDefs.find((col: any) => col.field === 'refImprime') as ColDef;
    const colNotices = columnDefs.find((col: any) => col.field === 'noticesString') as ColDef;

    expect(colApp).toBeDefined();
    expect(colFic).toBeDefined();
    expect(colCodPrd).toBeDefined();
    expect(colRefImp).toBeDefined();
    expect(colNotices).toBeDefined();

    expect(colApp!.minWidth).toBe(200);
    expect(colFic!.minWidth).toBe(150);
    expect(colCodPrd!.minWidth).toBe(120);
    expect(colRefImp!.minWidth).toBe(150);
    expect(colNotices!.minWidth).toBe(300);
  });

  it('should have correct flex values', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs();

    const colApp = columnDefs.find((col: any) => col.field === 'codenv_codorg_codapp') as ColDef;
    const colFic = columnDefs.find((col: any) => col.field === 'codcom_codfic') as ColDef;
    const colCodPrd = columnDefs.find((col: any) => col.field === 'codeProd') as ColDef;
    const colRefImp = columnDefs.find((col: any) => col.field === 'refImprime') as ColDef;
    const colNotices = columnDefs.find((col: any) => col.field === 'noticesString') as ColDef;

    expect(colApp).toBeDefined();
    expect(colFic).toBeDefined();
    expect(colCodPrd).toBeDefined();
    expect(colRefImp).toBeDefined();
    expect(colNotices).toBeDefined();

    expect(colApp!.flex).toBe(1);
    expect(colFic!.flex).toBe(1);
    expect(colCodPrd!.flex).toBe(1);
    expect(colRefImp!.flex).toBe(1);
    expect(colNotices!.flex).toBe(2);
  });
});
