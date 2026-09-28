import { TestBed } from '@angular/core/testing';

import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { ExemplaireByResource } from '@app/models/exemplaire-by-resource';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { DEFAULT_SEPARATOR, UNDERSCORE } from '@app/shared/utils/Constants';
import { CellClickedEvent, ColDef, GridApi, IRowNode } from 'ag-grid-community';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { TableauParametreEditionColonneService } from './tableau-parametre-edition-colonne.service';

describe('TableauParametreEditionColonneService', () => {
  let service: TableauParametreEditionColonneService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const destinatairesData$ = new BehaviorSubject<[]>([]);
  const codgam = 'gam';
  const codsit = 'cirso';
  const codres = 'res';
  const codreg = '117';
  const codorg = '117';
  const codcom = 'com';
  const codfic = 'l0';
  const msg = 'message';
  const coddes = 'coddes';
  const genericOrg = '999';
  const ressource = [codgam + '/' + codsit + '/' + codres];
  const exemplaires: ExemplaireByResource[] = [
    {
      codreg: codreg,
      codorg: codorg,
      codcom: codcom,
      codfic: codfic,
      message: msg,
      ressources: [
        {
          exemplaireExists: true,
          codgam: codgam,
          codres: codres,
          codsit: codsit,
          codorg: codorg,
          etat: true,
          coddes: coddes,
          hasProfil: true,
        },
      ],
    },
  ];
  const params = {
    data: {
      codorg: codorg,
      ressources: exemplaires[0].ressources,
    },
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideDistributionService', ['updateExemplaire', 'navigateToFirstOnglet']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColClearFilter']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['refreshCells', 'redrawRows']);

    mockPermissionService.hasPermission.and.returnValue(true);
    const mockColClearFilter: ColDef = {
      headerName: 'Clear',
      field: 'clear',
      width: 50,
    };
    mockTableauUtilService.getColClearFilter.and.returnValue(mockColClearFilter);
    TestBed.configureTestingModule({
      providers: [
        TableauParametreEditionColonneService,
        { provide: ApiAdelaideDistributionService, useValue: mockApiService },
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NotesService, useValue: mockNoteService },
      ],
    }).compileComponents();

    service = TestBed.inject(TableauParametreEditionColonneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return column definition for parem edition list', () => {
    const columnDefs = service.getBaseColumns();
    expect(columnDefs.length).toBe(6);

    const message = columnDefs.find((col: ColDef) => col.field === 'message') as ColDef;
    const codreg = columnDefs.find((col: ColDef) => col.field === 'codreg') as ColDef;
    const codorg = columnDefs.find((col: ColDef) => col.field === 'codorg') as ColDef;
    const codcom = columnDefs.find((col: ColDef) => col.field === 'codcom') as ColDef;
    const codfic = columnDefs.find((col: ColDef) => col.field === 'codfic') as ColDef;

    expect(codreg.pinned).toBe('left');
    expect(codreg.suppressMovable).toBeTruthy();
    expect(codorg.pinned).toBe('left');
    expect(codorg.suppressMovable).toBeTruthy();
    expect(codcom.pinned).toBe('left');
    expect(codcom.suppressMovable).toBeTruthy();
    expect(codfic.pinned).toBe('left');
    expect(codfic.suppressMovable).toBeTruthy();
    expect(message.pinned).toBe('left');
    expect(message.editable).toBeTruthy();
    expect(message.suppressMovable).toBeTruthy();
  });

  it('should return template no rows', () => {
    const result = service.getOverlayNoRowsTemplate();
    const text = "<b>Veuillez remplir le formulaire pour sélectionner les paramètres d'editions à charger</b>";
    expect(result).toEqual('<span class="no-rows">' + text + '</span>');
  });

  it('test all columns', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    expect(columnDefs.length).toBe(10);
    expect(columnDefs[6].field).toEqual(codsit + DEFAULT_SEPARATOR + codres + DEFAULT_SEPARATOR + codgam);
    expect(columnDefs[7].field).toEqual('addExemplaire');
    expect(columnDefs[8].field).toEqual(codgam + UNDERSCORE + codres + UNDERSCORE + codsit + UNDERSCORE + 'state');
    expect(columnDefs[9].field).toEqual('destinataire' + UNDERSCORE + codgam + UNDERSCORE + codres + UNDERSCORE + codsit);
  });

  it('test column 6 cellRenderer function', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const cellRenderer = columnDefs[6].cellRendererParams;
    const result = cellRenderer(params);
    expect(result.exemplaires).toEqual(exemplaires);
    expect(result.genericOrg).toEqual(genericOrg);
    expect(result.resource).toEqual(exemplaires[0].ressources[0]);
  });

  it('test column 7 cellRenderer function', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const cellRenderer = columnDefs[7].cellRendererParams;
    const result = cellRenderer(params);
    expect(result.genericOrg).toEqual(genericOrg);
    expect(result.resource).toEqual(exemplaires[0].ressources[0]);
  });

  it('test column 8 cellRenderer function', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const cellRenderer = columnDefs[8].cellRendererParams;
    const result = cellRenderer(params);
    expect(result.formKey).toEqual('state');
    expect(result.isAllTimeClickable).toBeFalsy();
    expect(result.resource).toEqual(exemplaires[0].ressources[0]);
  });

  it('test column 8 valueGetter function', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const valueGetter = columnDefs[8].valueGetter as Function;
    const result = valueGetter(params);
    expect(result).toBeTruthy();
  });

  it('test column 8 onCellClicked function', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const node = {
      data: {
        exeact: null,
      },
    } as IRowNode;
    const params = {
      data: {
        ressources: exemplaires[0].ressources,
      },
      api: mockGridApi,
      node: node,
    } as unknown as CellClickedEvent;
    const input = document.createElement('input');
    // value to change
    input.checked = false;
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: input });
    params.event = event;
    const onCellClicked8 = columnDefs[8].onCellClicked;
    mockApiService.updateExemplaire.and.returnValue(of(null));
    onCellClicked8(params);
    expect(mockNoteService.show).toHaveBeenCalled();
    // value changed
    expect(params.node.data.exeact).toBeFalsy();

    // if error, do not change the value
    mockApiService.updateExemplaire.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    onCellClicked8(params);
    expect(params.node.data.exeact).toBeTruthy();
    expect(params.api.redrawRows).toHaveBeenCalled();
  });

  it('test column 9 cellClass', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const cellClass = columnDefs[9].cellClass as Function;
    const result = cellClass(params);
    expect(result).toEqual('row-consultation');
  });

  it('test column 9 cellRenderer', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const cellRenderer = columnDefs[9].cellRendererParams;
    const result = cellRenderer(params);
    expect(result.resource).toEqual(exemplaires[0].ressources[0]);
    expect(result.selectData).toEqual(destinatairesData$);
    expect(result.isAllTimeClickable).toBeTruthy();
    expect(result.filterByFields).toEqual(['codorg']);
    expect(result.formKey).toEqual('coddes');

    const updateValue9 = result.updateValue;
    const node9 = {
      data: {
        coddes: 'coddes2',
      },
    } as IRowNode;
    const params9 = {
      data: {
        ressources: exemplaires[0].ressources,
      },
      api: mockGridApi,
      node: node9,
    };
    mockApiService.updateExemplaire.and.returnValue(of(null));
    updateValue9('des2', params9);
    // value changed
    expect(mockNoteService.show).toHaveBeenCalled();
    expect(params9.api.refreshCells).toHaveBeenCalled();
    expect(exemplaires[0].ressources[0].coddes).toEqual('des2');

    // Reset to original value for next tests
    exemplaires[0].ressources[0].coddes = coddes;
  });

  it('test column 9 valueGetter', () => {
    const columnDefs = service.getAllColumns(ressource, exemplaires, destinatairesData$, genericOrg);
    const valueGetter = columnDefs[9].valueGetter as Function;
    const result = valueGetter(params);
    expect(result).toEqual('coddes');
  });
});
