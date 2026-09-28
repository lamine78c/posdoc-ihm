import { TestBed } from '@angular/core/testing';

import { TableauAdresseRetourService } from './tableau-adresse-retour.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef } from 'ag-grid-community';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { MultiSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component';

describe('TableauAdresseRetourService', () => {
  let service: TableauAdresseRetourService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockFormattersService: jasmine.SpyObj<FormattersService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockFormattersService = jasmine.createSpyObj('FormattersService', ['toUpperCase']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);

    TestBed.configureTestingModule({
      providers: [
        TableauAdresseRetourService,
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: FormattersService, useValue: mockFormattersService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
      ],
    }).compileComponents();

    service = TestBed.inject(TableauAdresseRetourService);
    mockTableauUtilService.getColsDefAction.and.returnValue([{ headerName: 'Actions', field: 'actions' }]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return main columns with action', () => {
    const result = service.getColumnDefs(true);
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.ADRESSES_RETOUR,
      jasmine.objectContaining({ isColCollapse: true, isColSelectAll: true }),
      jasmine.objectContaining({
        delete: {
          cellRendererParams: {
            idsLabel: ['code', 'codeOrganisme'],
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
    mockPermissionService.hasPermission.and.returnValue(true);
    spyOn(CustomValidators, 'required');
    spyOn(CustomValidators, 'lenghtValidation');
    const columnDefs = service.getColumnDefs(false);

    const code = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const codreg = columnDefs.find((col: ColDef) => col.field === 'codeRegion') as ColDef;
    const codorg = columnDefs.find((col: ColDef) => col.field === 'codeOrganisme') as ColDef;
    const adres1 = columnDefs.find((col: ColDef) => col.field === 'adresse1') as ColDef;
    const adres2 = columnDefs.find((col: ColDef) => col.field === 'adresse2') as ColDef;
    const adres3 = columnDefs.find((col: ColDef) => col.field === 'adresse3') as ColDef;
    const adres4 = columnDefs.find((col: ColDef) => col.field === 'adresse4') as ColDef;

    expect(code.headerName).toBe('Code Adresse');
    expect(code.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(code.cellRenderer).toEqual(InputEditorComponent);
    expect(code.cellRendererParams).toEqual({
      formKey: 'code',
      canEditOnlyOnNewRow: true,
      inputInput: mockFormattersService.toUpperCase,
      validators: [CustomValidators.required(), CustomValidators.lenghtValidation(1, 8)],
      allowedCharacters: ['_'],
    });
    expect(codreg.headerName).toBe('Région');
    expect(codreg.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codorg.headerName).toBe('Organisme');
    expect(codorg.floatingFilterComponent).toBe('multiSelectHierarchiseeFloatingFilter');
    expect(codorg.floatingFilterComponentParams.possibleValues).toEqual([]);
    expect(codorg.cellRenderer).toEqual(MultiSelectEditorComponent);
    expect(codorg.cellRendererParams).toEqual({
      formKey: 'codeOrganisme',
      values: [],
      canEditOnlyOnNewRow: true,
      validators: [CustomValidators.required()],
    });
    expect(adres1.headerName).toBe('Adresse 1');
    expect(adres1.floatingFilterComponent).toBe('inputFilter');
    expect(adres1.cellRenderer).toEqual(InputEditorComponent);
    expect(adres1.cellRendererParams).toEqual({
      formKey: 'adresse1',
      inputInput: mockFormattersService.toUpperCase,
      canEditOnlyOnNewRow: false,
      validators: [CustomValidators.lenghtValidation(0, 38)],
      allowedCharacters: ['-', ' '],
    });

    expect(adres2.headerName).toBe('Adresse 2');
    expect(adres2.floatingFilterComponent).toBe('inputFilter');
    expect(adres2.cellRenderer).toEqual(InputEditorComponent);
    expect(adres2.cellRendererParams).toEqual({
      formKey: 'adresse2',
      inputInput: mockFormattersService.toUpperCase,
      canEditOnlyOnNewRow: false,
      validators: [CustomValidators.lenghtValidation(0, 38)],
      allowedCharacters: ['-', ' '],
    });

    expect(adres3.headerName).toBe('Adresse 3');
    expect(adres3.floatingFilterComponent).toBe('inputFilter');
    expect(adres3.cellRenderer).toEqual(InputEditorComponent);
    expect(adres3.cellRendererParams).toEqual({
      formKey: 'adresse3',
      inputInput: mockFormattersService.toUpperCase,
      canEditOnlyOnNewRow: false,
      validators: [CustomValidators.lenghtValidation(0, 38)],
      allowedCharacters: ['-', ' '],
    });

    expect(adres4.headerName).toBe('Adresse 4');
    expect(adres4.floatingFilterComponent).toBe('inputFilter');
    expect(adres4.cellRenderer).toEqual(InputEditorComponent);
    expect(adres4.cellRendererParams).toEqual({
      formKey: 'adresse4',
      inputInput: mockFormattersService.toUpperCase,
      canEditOnlyOnNewRow: false,
      validators: [CustomValidators.lenghtValidation(0, 38)],
      allowedCharacters: ['-', ' '],
    });
  });

  it('should return detail columns', () => {
    const result = service.getDetailColumnDefs(true);
    expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
      AUTH.FICHIER_EDITION.ADRESSES_RETOUR,
      jasmine.objectContaining({ isColSelectAll: true, isNoColEdit: true }),
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
});
