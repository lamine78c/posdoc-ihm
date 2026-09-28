import { TestBed } from '@angular/core/testing';

import { TableauUtilService } from '@app/services/tableau-util.service';
import { TableauFichierService } from './tableau-fichier.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { ColDef } from 'ag-grid-community';

describe('TableauFichierService', () => {
  let service: TableauFichierService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [TableauFichierService, { provide: TableauUtilService, useValue: mockTableauUtilService }],
    }).compileComponents();

    service = TestBed.inject(TableauFichierService);
    mockTableauUtilService.getColsDefAction.and.returnValue([{ headerName: 'Actions', field: 'actions' }]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return all columns', () => {
    const result = service.getColumnDefs(true);
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS,
      jasmine.objectContaining({ isColCollapse: true, isColSelectAll: true }),
      jasmine.objectContaining({
        delete: {
          cellRendererParams: {
            idsLabel: ['codeEnv', 'codeOrg', 'codeApp', 'codeCom', 'codeFich'],
            idsLabelSeparator: '-',
            messages: jasmine.any(Array),
          },
        },
      })
    );
    expect(result.length).toEqual(8);
  });

  it('main columns with definition validity', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs(false);

    const codenv = columnDefs.find((col: ColDef) => col.field === 'codeEnv') as ColDef;
    const codreg = columnDefs.find((col: ColDef) => col.field === 'codeRegion') as ColDef;
    const codorg = columnDefs.find((col: ColDef) => col.field === 'codeOrg') as ColDef;
    const codapp = columnDefs.find((col: ColDef) => col.field === 'codeApp') as ColDef;
    const codcom = columnDefs.find((col: ColDef) => col.field === 'codeCom') as ColDef;
    const codprd = columnDefs.find((col: ColDef) => col.field === 'codeProd') as ColDef;
    const codfic = columnDefs.find((col: ColDef) => col.field === 'codeFich') as ColDef;

    expect(codenv.headerName).toBe('Environnement');
    expect(codenv.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codenv.cellClass).toBe('overflow-visible');
    expect(codreg.headerName).toBe('Région');
    expect(codreg.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codorg.headerName).toBe('Organisme');
    expect(codorg.floatingFilterComponent).toBe('multiSelectHierarchiseeFloatingFilter');
    expect(codapp.headerName).toBe('Application');
    expect(codapp.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codcom.headerName).toBe('Commande');
    expect(codcom.floatingFilterComponent).toBe('inputFilter');
    expect(codprd.headerName).toBe('Produit');
    expect(codprd.floatingFilterComponent).toBe('inputFilter');
    expect(codfic.headerName).toBe('Fichier');
    expect(codfic.floatingFilterComponent).toBe('inputFilter');
  });
});
