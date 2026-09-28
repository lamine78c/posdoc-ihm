import { TestBed } from '@angular/core/testing';
import { TableauEchantillonService } from './tableau-echantillon.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { PARECH_TYPECH, PARECH_TYPECH_LOT, PARECH_TYPECH_PAGE } from '@app/shared/utils/Constants';

describe('TableauEchantillonService', () => {
  let service: TableauEchantillonService;
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
        TableauEchantillonService,
        { provide: FormattersService, useValue: formattersServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauUtilService, useValue: tableauUtilServiceSpy },
      ],
    });

    service = TestBed.inject(TableauEchantillonService);
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

  it('should call getColsDefAction with correct parameters', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    service.getColumnDefs(true);

    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['reference'],
            messages: jasmine.arrayContaining([
              "Suppression d'un echantillon",
              "Vous êtes sur le point de supprimer l'echantillon",
            ]),
          }),
        }),
      })
    );
  });

  it('should configure Reference column with correct properties', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const referenceCol = columnDefs.find(col => col.field === 'reference');

    expect(referenceCol).toBeDefined();
    expect(referenceCol.headerName).toBe('Reference');
    expect(referenceCol.field).toBe('reference');
    expect(referenceCol.sort).toBe('asc');
    expect(referenceCol.sortable).toBe(true);
    expect(referenceCol.filter).toBe('agTextColumnFilter');
    expect(referenceCol.floatingFilter).toBe(true);
    expect(referenceCol.cellRenderer).toBe(InputEditorComponent);
  });

  it('should configure Reference column with correct cellRendererParams', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const referenceCol = columnDefs.find(col => col.field === 'reference');

    expect(referenceCol.cellRendererParams).toBeDefined();
    expect(referenceCol.cellRendererParams.formKey).toBe('reference');
    expect(referenceCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
    expect(referenceCol.cellRendererParams.inputInput).toBeDefined();
    expect(referenceCol.cellRendererParams.validators).toBeDefined();
    expect(referenceCol.cellRendererParams.allowedCharacters).toEqual(['-']);
  });

  it('should configure Type column with SelectEditorComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    expect(typeCol).toBeDefined();
    expect(typeCol.headerName).toBe('Type');
    expect(typeCol.cellRenderer).toBe(SelectEditorComponent);
    expect(typeCol.cellRendererParams.formKey).toBe('type');
    expect(typeCol.cellRendererParams.values).toBe(PARECH_TYPECH);
    expect(typeCol.valueGetter).toBeDefined();
    expect(typeCol.onCellValueChanged).toBeDefined();
  });

  it('should configure Type column valueGetter to set canEdit property', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const typeCol = columnDefs.find(col => col.field === 'type');

    const mockParams: any = {
      data: { type: PARECH_TYPECH_LOT },
    };

    const result = (typeCol.valueGetter as any)(mockParams);

    expect(result).toBe(PARECH_TYPECH_LOT);
    expect((mockParams.data as any).canEdit).toEqual([
      { colId: 'nombreLots', value: true },
      { colId: 'nombrePages', value: true },
      { colId: 'formule', value: false },
    ]);
  });

  it('should configure NombreLots column with conditional valueGetter', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const nombreLotsCol = columnDefs.find(col => col.field === 'nombreLots');

    expect(nombreLotsCol).toBeDefined();
    expect(nombreLotsCol.headerName).toBe('Nombre de lots');
    expect(nombreLotsCol.cellRenderer).toBe(InputEditorComponent);

    // Test valueGetter for LOT type
    const lotParams = { data: { type: PARECH_TYPECH_LOT, nombreLots: 10 } };
    expect((nombreLotsCol.valueGetter as any)(lotParams)).toBe(10);

    // Test valueGetter for PAGE type
    const pageParams = { data: { type: PARECH_TYPECH_PAGE, nombreLots: 10 } };
    expect((nombreLotsCol.valueGetter as any)(pageParams)).toBeNull();
  });

  it('should configure NombrePages column with conditional valueGetter', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const nombrePagesCol = columnDefs.find(col => col.field === 'nombrePages');

    expect(nombrePagesCol).toBeDefined();
    expect(nombrePagesCol.headerName).toBe('Nombre de pages');
    expect(nombrePagesCol.cellRenderer).toBe(InputEditorComponent);

    // Test valueGetter for LOT type
    const lotParams = { data: { type: PARECH_TYPECH_LOT, nombrePages: 5 } };
    expect((nombrePagesCol.valueGetter as any)(lotParams)).toBe(5);

    // Test valueGetter for PAGE type
    const pageParams = { data: { type: PARECH_TYPECH_PAGE, nombrePages: 5 } };
    expect((nombrePagesCol.valueGetter as any)(pageParams)).toBeNull();
  });

  it('should configure Random column with InterrupteurRadioComponent', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const randomCol = columnDefs.find(col => col.field === 'random');

    expect(randomCol).toBeDefined();
    expect(randomCol.headerName).toBe('Aléatoire');
    expect(randomCol.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(randomCol.cellRendererParams.formKey).toBe('random');
    expect(randomCol.floatingFilterComponentParams).toBeDefined();
    expect(randomCol.floatingFilterComponentParams.possibleLabelWithValues).toEqual([
      { label: 'Vrai', value: true },
      { label: 'Faux', value: false },
    ]);
  });

  it('should configure Formule column with conditional valueGetter', () => {
    mockPermissionService.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(true) as ColDef[];
    const formuleCol = columnDefs.find(col => col.field === 'formule');

    expect(formuleCol).toBeDefined();
    expect(formuleCol.headerName).toBe('Formule');
    expect(formuleCol.cellRenderer).toBe(InputEditorComponent);

    // Test valueGetter for PAGE type
    const pageParams = { data: { type: PARECH_TYPECH_PAGE, formule: 'P1,P5' } };
    expect((formuleCol.valueGetter as any)(pageParams)).toBe('P1,P5');

    // Test valueGetter for LOT type
    const lotParams = { data: { type: PARECH_TYPECH_LOT, formule: 'P1,P5' } };
    expect((formuleCol.valueGetter as any)(lotParams)).toBeNull();
  });

  it('should set canEditOnlyOnNewRow based on permissions', () => {
    // Test with no permissions
    mockPermissionService.hasPermission.and.returnValue(false);
    let columnDefs = service.getColumnDefs(true) as ColDef[];
    let typeCol = columnDefs.find(col => col.field === 'type');
    expect(typeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);

    // Test with permissions
    mockPermissionService.hasPermission.and.returnValue(true);
    columnDefs = service.getColumnDefs(true) as ColDef[];
    typeCol = columnDefs.find(col => col.field === 'type');
    expect(typeCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should have correct delete messages configuration', () => {
    service.getColumnDefs(true);

    const deleteParams = mockTableauUtilService.getColsDefAction.calls.mostRecent().args[2] as any;
    expect(deleteParams.delete.cellRendererParams.messages).toEqual([
      "Suppression d'un echantillon",
      "Vous êtes sur le point de supprimer l'echantillon",
      'Vous êtes sur le point de supprimer les echantillons',
      'Suppression des echantillons',
      'Les echantillons suivants ne peuvent pas être supprimés',
      "L'echantillon suivant ne peut pas être supprimé",
    ]);
  });
});
