// filepath: c:\Dev\posdoc\posdoc-ihm-fe-19\src\app\admin\tarif\service\tableau-tarif.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TableauTarifService } from './tableau-tarif.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { DateEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/date-editor/date-editor.component';

describe('TableauTarifService', () => {
  let service: TableauTarifService;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockActionColumns = [
    { field: 'select', headerName: 'Select' },
    { field: 'actions', headerName: 'Actions' },
  ];

  beforeEach(() => {
    const formattersServiceSpy = jasmine.createSpyObj('FormattersService', ['toUpperCase']);
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [
        TableauTarifService,
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    });

    service = TestBed.inject(TableauTarifService);
    mockFormattersService = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;

    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockFormattersService.toUpperCase.and.returnValue((value: string) => value?.toUpperCase());
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions including action columns', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true);

    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBeGreaterThan(2);
    expect(columnDefs[0]).toEqual(mockActionColumns[0]);
    expect(columnDefs[1]).toEqual(mockActionColumns[1]);
  });

  it('should call getColsDefAction with correct parameters for main columns', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.TARPOS,
      { isColCollapse: true, isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['type'],
            messages: jasmine.arrayContaining(["Suppression d'un tarif", 'Vous êtes sur le point de supprimer le tarif']),
          }),
        }),
      })
    );
  });

  it('should configure Type column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    expect(typeCol).toBeDefined();
    expect(typeCol.headerName).toBe('Type');
    expect(typeCol.field).toBe('type');
    expect(typeCol.sort).toBe('asc');
    expect(typeCol.sortable).toBe(true);
    expect(typeCol.filter).toBe('agTextColumnFilter');
    expect(typeCol.floatingFilter).toBe(true);
    expect(typeCol.floatingFilterComponent).toBe('inputFilter');
    expect(typeCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Type column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    expect(typeCol.cellRendererParams).toBeDefined();
    expect(typeCol.cellRendererParams.formKey).toBe('type');
    expect(typeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(typeCol.cellRendererParams.inputInput).toBeDefined();
    expect(typeCol.cellRendererParams.validators).toBeDefined();
    expect(typeCol.cellRendererParams.validators.length).toBe(2);
  });

  it('should configure Ordre column with permission-based editability', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const ordreCol = columnDefs.find(col => col.field === 'ordre');

    expect(ordreCol).toBeDefined();
    expect(ordreCol.headerName).toBe('Ordre');
    expect(ordreCol.field).toBe('ordre');
    expect(ordreCol.sortable).toBe(true);
    expect(ordreCol.cellRenderer).toBe(InputEditorComponent);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.TARPOS.Ordre);
    expect(ordreCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should configure Designation column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const designationCol = columnDefs.find(col => col.field === 'libelle');

    expect(designationCol).toBeDefined();
    expect(designationCol.headerName).toBe('Désignation');
    expect(designationCol.field).toBe('libelle');
    expect(designationCol.sortable).toBe(true);
    expect(designationCol.filter).toBe('agTextColumnFilter');
    expect(designationCol.floatingFilter).toBe(true);
    expect(designationCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Designation column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const designationCol = columnDefs.find(col => col.field === 'libelle');

    expect(designationCol.cellRendererParams).toBeDefined();
    expect(designationCol.cellRendererParams.formKey).toBe('libelle');
    expect(designationCol.cellRendererParams.inputInput).toBeDefined();
    expect(designationCol.cellRendererParams.validators).toBeDefined();
    expect(designationCol.cellRendererParams.validators.length).toBe(2);
    expect(designationCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ', '.', '(', ')', '€', '+']);
  });

  it('should configure Libre column with InterrupteurRadioComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const libreCol = columnDefs.find(col => col.field === 'tlibre');

    expect(libreCol).toBeDefined();
    expect(libreCol.headerName).toBe('Libre');
    expect(libreCol.field).toBe('tlibre');
    expect(libreCol.sortable).toBe(true);
    expect(libreCol.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(libreCol.cellRendererParams.formKey).toBe('tlibre');
    expect(libreCol.floatingFilterComponent).toBe('listFloatingFilter');
  });

  it('should configure Compta column with boolean filter options', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const comptaCol = columnDefs.find(col => col.field === 'compta');

    expect(comptaCol).toBeDefined();
    expect(comptaCol.headerName).toBe('Non Comptabilisé');
    expect(comptaCol.field).toBe('compta');
    expect(comptaCol.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(comptaCol.floatingFilterComponent).toBe('listFloatingFilter');
    expect(comptaCol.floatingFilterComponentParams.possibleLabelWithValues).toEqual([
      { label: 'Vrai', value: true },
      { label: 'Faux', value: false },
    ]);
  });

  it('should configure Perime column with permission-based editability', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const perimeCol = columnDefs.find(col => col.field === 'perime');

    expect(perimeCol).toBeDefined();
    expect(perimeCol.headerName).toBe('Périmé');
    expect(perimeCol.field).toBe('perime');
    expect(perimeCol.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.TARPOS.Perime);
    expect(perimeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should return detail column definitions including action columns', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const detailColumnDefs = service.getDetailColumnDefs(true);

    expect(detailColumnDefs).toBeDefined();
    expect(detailColumnDefs.length).toBeGreaterThan(2);
    expect(detailColumnDefs[0]).toEqual(mockActionColumns[0]);
    expect(detailColumnDefs[1]).toEqual(mockActionColumns[1]);
  });

  it('should call getColsDefAction with correct parameters for detail columns', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    service.getDetailColumnDefs(false);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.TARPOS,
      { isColSelectAll: false },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['type', 'numero'],
            idsLabelSeparator: '-',
            messages: jasmine.arrayContaining(["Suppression d'un tarif", 'Vous êtes sur le point de supprimer le tarif']),
          }),
        }),
      })
    );
  });

  it('should configure DateDebut column with DateEditorComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const detailColumnDefs = service.getDetailColumnDefs(true) as ColDef[];
    const dateDebutCol = detailColumnDefs.find(col => col.field === 'dateDebut');

    expect(dateDebutCol).toBeDefined();
    expect(dateDebutCol.headerName).toBe('Date de début');
    expect(dateDebutCol.field).toBe('dateDebut');
    expect(dateDebutCol.sortable).toBe(true);
    expect(dateDebutCol.sort).toBe('asc');
    expect(dateDebutCol.cellRenderer).toBe(DateEditorComponent);
    expect(dateDebutCol.cellRendererParams.formKey).toBe('dateDebut');
    expect(dateDebutCol.cellRendererParams.validators).toBeDefined();
  });

  it('should configure DateFin column with DateEditorComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const detailColumnDefs = service.getDetailColumnDefs(true) as ColDef[];
    const dateFinCol = detailColumnDefs.find(col => col.field === 'dateFin');

    expect(dateFinCol).toBeDefined();
    expect(dateFinCol.headerName).toBe('Date de fin');
    expect(dateFinCol.field).toBe('dateFin');
    expect(dateFinCol.sortable).toBe(true);
    expect(dateFinCol.cellRenderer).toBe(DateEditorComponent);
    expect(dateFinCol.cellRendererParams.formKey).toBe('dateFin');
  });

  it('should configure Cout column with numeric validation and formatting', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const detailColumnDefs = service.getDetailColumnDefs(true) as ColDef[];
    const coutCol = detailColumnDefs.find(col => col.field === 'coutPli');

    expect(coutCol).toBeDefined();
    expect(coutCol.headerName).toBe('Coût');
    expect(coutCol.field).toBe('coutPli');
    expect(coutCol.sortable).toBe(true);
    expect(coutCol.cellRenderer).toBe(InputEditorComponent);
    expect(coutCol.cellRendererParams.formKey).toBe('coutPli');
    expect(coutCol.cellRendererParams.validators.length).toBe(2);
    expect(coutCol.cellRendererParams.allowedCharacters).toEqual(['.']);
    expect(coutCol.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(coutCol.valueFormatter).toBeDefined();
  });

  it('should configure Urgent column with InterrupteurRadioComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const detailColumnDefs = service.getDetailColumnDefs(true) as ColDef[];
    const urgentCol = detailColumnDefs.find(col => col.field === 'urgent');

    expect(urgentCol).toBeDefined();
    expect(urgentCol.headerName).toBe('Urgent');
    expect(urgentCol.field).toBe('urgent');
    expect(urgentCol.sortable).toBe(true);
    expect(urgentCol.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(urgentCol.cellRendererParams.formKey).toBe('urgent');
  });

  it('should set canEditOnlyOnNewRow based on permission for detail columns', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    const detailColumnDefs = service.getDetailColumnDefs(true) as ColDef[];
    const coutCol = detailColumnDefs.find(col => col.field === 'coutPli');

    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.TARPOS.detail);
    expect(coutCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should allow editing detail columns when user has permission', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const detailColumnDefs = service.getDetailColumnDefs(true) as ColDef[];
    const dateDebutCol = detailColumnDefs.find(col => col.field === 'dateDebut');
    const urgentCol = detailColumnDefs.find(col => col.field === 'urgent');

    expect(dateDebutCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
    expect(urgentCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });
});
