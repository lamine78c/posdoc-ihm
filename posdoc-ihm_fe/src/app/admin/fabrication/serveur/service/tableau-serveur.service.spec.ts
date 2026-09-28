import { TestBed } from '@angular/core/testing';
import { TableauServeurService } from './tableau-serveur.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { ColDef } from 'ag-grid-community';

describe('TableauServeurService', () => {
  let service: TableauServeurService;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let tableauUtilServiceSpy: jasmine.SpyObj<TableauUtilService>;
  let formattersServiceSpy: jasmine.SpyObj<FormattersService>;

  beforeEach(() => {
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const tableauUtilSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    const formattersSpy = jasmine.createSpyObj('FormattersService', ['extractValues', 'toUpperCase']);

    TestBed.configureTestingModule({
      providers: [
        TableauServeurService,
        { provide: PermissionService, useValue: permissionSpy },
        { provide: TableauUtilService, useValue: tableauUtilSpy },
        { provide: FormattersService, useValue: formattersSpy },
      ],
    });

    service = TestBed.inject(TableauServeurService);
    permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    tableauUtilServiceSpy = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    formattersServiceSpy = TestBed.inject(FormattersService) as jasmine.SpyObj<FormattersService>;

    tableauUtilServiceSpy.getColsDefAction.and.returnValue([{ headerName: 'Actions', field: 'actions' }]);
    formattersServiceSpy.extractValues.and.returnValue(['Value1', 'Value2']);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct etatMapping', () => {
    expect(service.etatMapping).toEqual({ false: 'Inactif', true: 'Actif' });
  });

  it('should have correct testeMapping', () => {
    expect(service.testeMapping).toEqual({ false: '-', true: 'Testé' });
  });

  it('should return correct no rows template', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return column definitions with action columns', () => {
    const mockActionCols = [{ headerName: 'Action1', field: 'action1' }];
    tableauUtilServiceSpy.getColsDefAction.and.returnValue(mockActionCols);

    const columnDefs = service.getColumnDefs(true);

    expect(tableauUtilServiceSpy.getColsDefAction).toHaveBeenCalledWith(
      AUTH.ADMINISTRATION.FABRICATION.SERVEURS,
      { isColSelectAll: true },
      jasmine.objectContaining({
        delete: jasmine.objectContaining({
          cellRendererParams: jasmine.objectContaining({
            idsLabel: ['code'],
            messages: jasmine.any(Array),
          }),
        }),
      })
    );
    expect(columnDefs[0]).toEqual(mockActionCols[0]);
  });

  it('should configure all 6 main columns correctly', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Value1', 'Value2']);
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const serveurCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;
    const systemeCol = columnDefs.find((col: ColDef) => col.field === 'systeme') as ColDef;
    const adresseIpCol = columnDefs.find((col: ColDef) => col.field === 'adresseIp') as ColDef;
    const testCol = columnDefs.find((col: ColDef) => col.field === 'teste') as ColDef;
    const etatCol = columnDefs.find((col: ColDef) => col.field === 'actif') as ColDef;

    expect(serveurCol.headerName).toBe('Serveur');
    expect(serveurCol.cellRenderer).toBe(InputEditorComponent);
    expect(libelleCol.headerName).toBe('Libellé');
    expect(systemeCol.headerName).toBe('Système');
    expect(systemeCol.cellRenderer).toBe(SelectEditorComponent);
    expect(adresseIpCol.headerName).toBe('Adresse IP');
    expect(testCol.headerName).toBe('Test');
    expect(etatCol.headerName).toBe('Etat');
  });

  it('should configure validators and allowed characters correctly', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Value1', 'Value2']);
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;
    const systemeCol = columnDefs.find((col: ColDef) => col.field === 'systeme') as ColDef;
    const adresseIpCol = columnDefs.find((col: ColDef) => col.field === 'adresseIp') as ColDef;

    expect(libelleCol.cellRendererParams.allowedCharacters).toEqual(['-', '_', ' ']);
    expect(libelleCol.cellRendererParams.validators).toBeDefined();
    expect(systemeCol.cellRendererParams.values).toEqual(['LINUX', 'WINDOWS', 'AIX']);
    expect(adresseIpCol.cellRendererParams.allowedCharacters).toEqual(['.', '-']);
  });

  it('should allow editing when permission is granted', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Value1', 'Value2']);
    permissionServiceSpy.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;

    expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.libelle);
    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(false);
  });

  it('should restrict editing when permission is denied', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Value1', 'Value2']);
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const libelleCol = columnDefs.find((col: ColDef) => col.field === 'libelle') as ColDef;

    expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.libelle);
    expect(libelleCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should always restrict Serveur column to new rows only', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Value1', 'Value2']);
    permissionServiceSpy.hasPermission.and.returnValue(true);
    const columnDefs = service.getColumnDefs(false);

    const serveurCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;

    expect(serveurCol.cellRendererParams.canEditOnlyOnNewRow).toBe(true);
  });

  it('should apply green styling for Actif value in Etat column', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Inactif', 'Actif']);
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const etatCol = columnDefs.find((col: ColDef) => col.field === 'actif') as ColDef;
    const cellStyleFunction = etatCol.cellStyle as (params: any) => any;
    const style = cellStyleFunction({ value: 'Actif' });

    expect(style).toEqual({ color: '#004B00', 'background-color': '#CCFFCC' });
  });

  it('should apply red styling for Inactif value in Etat column', () => {
    formattersServiceSpy.extractValues.and.returnValue(['Inactif', 'Actif']);
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const etatCol = columnDefs.find((col: ColDef) => col.field === 'actif') as ColDef;
    const cellStyleFunction = etatCol.cellStyle as (params: any) => any;
    const style = cellStyleFunction({ value: 'Inactif' });

    expect(style).toEqual({ color: '#4B0000', 'background-color': '#FF9999' });
  });

  it('should configure floating filters correctly', () => {
    formattersServiceSpy.extractValues.and.callFake((mapping: any) => {
      if (mapping === service.etatMapping) return ['Inactif', 'Actif'];
      if (mapping === service.testeMapping) return ['-', 'Testé'];
      return [];
    });
    permissionServiceSpy.hasPermission.and.returnValue(false);
    const columnDefs = service.getColumnDefs(false);

    const serveurCol = columnDefs.find((col: ColDef) => col.field === 'code') as ColDef;
    const systemeCol = columnDefs.find((col: ColDef) => col.field === 'systeme') as ColDef;
    const testCol = columnDefs.find((col: ColDef) => col.field === 'teste') as ColDef;

    expect(serveurCol.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(systemeCol.floatingFilterComponent).toBe('listFloatingFilter');
    expect(systemeCol.floatingFilterComponentParams.possibleValues).toEqual(['LINUX', 'WINDOWS', 'AIX']);
    expect(testCol.floatingFilterComponentParams.possibleValues).toEqual(['-', 'Testé']);
  });
});
