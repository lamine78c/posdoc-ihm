import { TestBed } from '@angular/core/testing';

import { TableauUtilService } from '@app/services/tableau-util.service';
import { TableauPapaadService } from './tableau-papaad.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { ColDef } from 'ag-grid-community';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { AUTH } from '@app/services/permission/PermissionsFile';

describe('TableauPapaadService', () => {
  let service: TableauPapaadService;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockActionColumns = [
    { field: 'select', headerName: 'Select' },
    { field: 'actions', headerName: 'Actions' },
  ];

  const floatingFilterComponentParamsPeriode = {
    possibleLabelWithValues: [
      { label: 'Vrai', value: true },
      { label: 'Faux', value: false },
    ],
    suppressFilterButton: true,
  };

  const auth = AUTH.FICHIER_EDITION.PAPAAD;
  beforeEach(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [
        TableauPapaadService,
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    }).compileComponents();
    service = TestBed.inject(TableauPapaadService);

    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockPermissionService.hasPermission.and.returnValue(true);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions with select all column when isColSelectAll is true', () => {
    const columns = service.getColumnDefs(true);
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      auth,
      { isColSelectAll: true },
      jasmine.objectContaining({
        clearFilter: {
          pinned: 'left',
        },
        selectAll: {
          pinned: 'left',
        },
        edit: {
          pinned: 'left',
        },
        delete: jasmine.objectContaining({
          pinned: 'left',
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['codeCommande', 'codeFichier', 'codeNotif'],
            idsLabelSeparator: ' | ',
          }),
        }),
      })
    );
    expect(columns.length).toBeGreaterThan(2);
  });

  it('should return column definitions without select all column when isColSelectAll is false', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columns = service.getColumnDefs(false);
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(auth, { isColSelectAll: false }, jasmine.any(Object));
    expect(columns.length).toBeGreaterThan(2);
  });

  it('Commande validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'codeCommande');
    expect(col).toBeDefined();
    expect(col.pinned).toBe('left');
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('codeCommande');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
  });

  it('Produit validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'codeFichier');
    expect(col).toBeDefined();
    expect(col.pinned).toBe('left');
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('codeFichier');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
  });

  it('Libelle validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'libelle');
    expect(col).toBeDefined();
    expect(col.pinned).toBe('left');
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('libelle');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
    expect(col.cellRendererParams.allowedCharacters).toBeDefined();
  });

  it('Notif validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'codeNotif');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('codeNotif');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
    expect(col.cellRendererParams.allowedCharacters).toBeDefined();
  });

  it('Periode validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'periode');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('periode');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('CodeRND validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'codeRND');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('codeRND');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.cellRendererParams.validators).toBeDefined();
    expect(col.cellRendererParams.allowedCharacters).toBeDefined();
  });

  it('AppPro validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'appPro');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('appPro');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
  });

  it('TypeHas validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'typeHas');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('typeHas');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
    expect(col.cellRendererParams.allowedCharacters).toBeDefined();
    expect(col.valueGetter).toBeDefined();
  });

  it('Format validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'format');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('format');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.cellRendererParams.inputInput).toBeDefined();
    expect(col.cellRendererParams.validators).toBeDefined();
    expect(col.cellRendererParams.allowedCharacters).toBeDefined();
    expect(col.valueGetter).toBeDefined();
  });

  it('IsUrib validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'isUrib');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InputEditorComponent);
    expect(col.cellRendererParams.formKey).toBe('isUrib');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.cellRendererParams.validators).toBeDefined();
  });

  it('NsTruc validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'nsTruc');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('nsTruc');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('Imprime validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'imprime');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('imprime');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('Huissier validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'huissier');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('huissier');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('StrRaf validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'strRaf');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('strRaf');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('Contrat validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'contrat');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('contrat');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('Medele validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'medele');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('medele');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });

  it('IdNRAF validity', () => {
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const col = columnDefs.find(col => col.field === 'idtbcc');
    expect(col).toBeDefined();
    expect(col.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(col.cellRendererParams.formKey).toBe('idtbcc');
    expect(col.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(col.floatingFilterComponent).toBe('listFloatingFilter');
    expect(col.floatingFilterComponentParams).toEqual(floatingFilterComponentParamsPeriode);
  });
});
