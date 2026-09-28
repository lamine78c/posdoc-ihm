import { TestBed } from '@angular/core/testing';

import { TableauCommandeService } from './tableau-commande.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';

describe('TableauCommandeService', () => {
  let service: TableauCommandeService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [
        TableauCommandeService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    }).compileComponents();
    service = TestBed.inject(TableauCommandeService);

    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows"><b>Veuillez remplir le formulaire pour sélectionner les commandes à charger</b></span>');
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
      AUTH.FICHIER_EDITION.COMMANDES,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['codenv', 'codorg', 'codapp', 'code'],
            idsLabelSeparator: '-',
            messages: jasmine.any(Array),
          }),
        }),
      })
    );
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(8);
  });

  it('should return only main columns', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    const columnDefs = service.getColumnDefs(false);
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(6);
  });

  it('main columns with definition validity', () => {
    mockTableauUtilService.getColsDefAction.and.returnValue([]);
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const codenv = columnDefs.find((col: ColDef) => col.field === 'codenv') as ColDef;
    const codreg = columnDefs.find((col: ColDef) => col.field === 'codreg') as ColDef;
    const codorg = columnDefs.find((col: ColDef) => col.field === 'codorg') as ColDef;
    const codapp = columnDefs.find((col: ColDef) => col.field === 'codapp') as ColDef;
    const codcom = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const libcom = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;

    expect(codenv.headerName).toBe('Environnement');
    expect(codenv.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codreg.headerName).toBe('Région');
    expect(codreg.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codorg.headerName).toBe('Organisme');
    expect(codorg.floatingFilterComponent).toBe('multiSelectHierarchiseeFloatingFilter');
    expect(codapp.headerName).toBe('Application');
    expect(codapp.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codcom.headerName).toBe('Commande');
    expect(codcom.floatingFilterComponent).toBe('inputFilter');
    expect(libcom.headerName).toBe('Désignation');
    expect(libcom.floatingFilterComponent).toBe('inputFilter');
    expect(libcom.cellRenderer).toBe(InputEditorComponent);
    expect(libcom.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(libcom.cellRendererParams.inputInput).toBeDefined();
    expect(libcom.cellRendererParams.validators).toBeDefined();
    expect(libcom.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', '(', ')', '.', '<', '>', '=', ',', '?', '/', '$', '*', '\\', '+']);
  });
});
