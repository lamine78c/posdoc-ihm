import { TestBed } from '@angular/core/testing';

import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { CellClickedEvent, CellValueChangedEvent, ColDef, GridApi, IRowNode } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableauParametreEditionService } from './tableau-parametre-edition.service';
import { Exemplaire } from '@app/models/exemplaire';

describe('TableauParametreEditionService', () => {
  let service: TableauParametreEditionService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockActionColumns = [{ headerName: 'Actions', field: 'actions', width: 100 }] as ColDef[];
  let data;
  let node;
  let exemplaire;

  beforeEach(() => {
    data = {
      codenv: 'p',
      codorg: '117',
      codapp: 'snv2',
      codcom: 'com',
      codfic: 'fic',
      codgam: 'gm',
      numexe: 1,
      codres: 'res',
      coddes: 'des',
      nbrexe: 10,
      codsit: 'codsit',
      exeact: false,
    };
    exemplaire = new Exemplaire(
      data.codenv,
      data.codorg,
      data.codapp,
      data.codcom,
      data.codfic,
      data.codgam,
      data.numexe,
      data.codsit,
      data.codres,
      data.coddes,
      data.nbrexe,
      data.exeact
    );
    node = {
      data: data,
    } as IRowNode;
    mockApiService = jasmine.createSpyObj('ApiAdelaideDistributionService', ['updateExemplaire']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['redrawRows']);

    mockPermissionService.hasPermission.and.returnValue(true);
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
    mockApiService.updateExemplaire.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        TableauParametreEditionService,
        { provide: ApiAdelaideDistributionService, useValue: mockApiService },
        { provide: TableauUtilService, useValue: mockTableauUtilService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NotesService, useValue: mockNoteService },
      ],
    }).compileComponents();

    service = TestBed.inject(TableauParametreEditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all columns', () => {
    const columnDefs = service.getColumnDefs(true);
    expect(columnDefs.length).toBe(17);
  });

  it('should return template no rows', () => {
    const result = service.getOverlayNoRowsTemplate();
    const text = "<b>Veuillez remplir le formulaire pour sélectionner les paramètres d'editions à charger</b>";
    expect(result).toEqual('<span class="no-rows">' + text + '</span>');
  });

  it('test column codsit', () => {
    spyOn(CustomValidators, 'required');
    const columnDefs = service.getColumnDefs(true);
    const column = columnDefs.find((col: ColDef) => col.field === 'codsit') as ColDef;
    expect(column.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(column.cellRendererParams).toEqual({
      isAllTimeClickable: true,
      canEditOnlyOnNewRow: true,
      formKey: 'codsit',
      values: [],
      validators: [CustomValidators.required()],
    });
    // onCellValueChanged function
    const params = {
      data: data,
      node: node,
      api: mockGridApi,
      oldValue: 'oldv',
    } as unknown as CellValueChangedEvent;
    const onCellValueChanged = column.onCellValueChanged;
    onCellValueChanged(params);
    expect(params.node.data.codsit).toEqual(params.data.codsit);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: "Le site de l'exemplaire [p-117-snv2-com-fic-gm-res] a été mis à jour avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    // if error, reset the value saved in key 'oldValue'
    mockApiService.updateExemplaire.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    onCellValueChanged(params);
    expect(params.node.data.codsit).toEqual(params.oldValue);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Erreur',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('test column codres', () => {
    spyOn(CustomValidators, 'required');
    const columnDefs = service.getColumnDefs(true);
    const column = columnDefs.find((col: ColDef) => col.field === 'codres') as ColDef;
    expect(column.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(column.cellRendererParams).toEqual({
      isAllTimeClickable: true,
      canEditOnlyOnNewRow: true,
      formKey: 'codres',
      filterByFields: ['codenv', 'codorg', 'codapp', 'codsit', 'codgam'],
      acceptGenericOrgs: { key: 'codorg', value: '999' },
      values: [],
      validators: [CustomValidators.required()],
    });
    // onCellValueChanged function
    const params = {
      data: data,
      node: node,
      api: mockGridApi,
      oldValue: 'oldv',
    } as unknown as CellValueChangedEvent;
    const onCellValueChanged = column.onCellValueChanged;
    onCellValueChanged(params);
    expect(params.node.data.codres).toEqual(params.data.codres);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: "La ressource de l'exemplaire [p-117-snv2-com-fic-gm-res] a été mis à jour avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    // if error, reset the value saved in key 'oldValue'
    mockApiService.updateExemplaire.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    onCellValueChanged(params);
    expect(params.node.data.codres).toEqual(params.oldValue);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Erreur',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('test column coddes', () => {
    const columnDefs = service.getColumnDefs(true);
    const column = columnDefs.find((col: ColDef) => col.field === 'coddes') as ColDef;
    expect(column.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(column.cellRendererParams).toEqual({
      isAllTimeClickable: true,
      canEditOnlyOnNewRow: true,
      filterByFields: ['codorg'],
      formKey: 'coddes',
      values: [],
      hasBlankOption: true,
    });
    // onCellValueChanged function
    const params = {
      data: data,
      node: node,
      api: mockGridApi,
      oldValue: 'oldv',
    } as unknown as CellValueChangedEvent;
    const onCellValueChanged = column.onCellValueChanged;
    onCellValueChanged(params);
    expect(params.node.data.coddes).toEqual(params.data.coddes);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: "Le destinataire de l'exemplaire [p-117-snv2-com-fic-gm-res] a été mis à jour avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    // if error, reset the value saved in key 'oldValue'
    mockApiService.updateExemplaire.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    onCellValueChanged(params);
    expect(params.node.data.coddes).toEqual(params.oldValue);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Erreur',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('test column exeact', () => {
    const columnDefs = service.getColumnDefs(true);
    const column = columnDefs.find((col: ColDef) => col.field === 'exeact') as ColDef;
    expect(column.floatingFilterComponent).toBe('listFloatingFilter');
    expect(column.cellRendererParams).toEqual({
      isAllTimeClickable: true,
      canEditOnlyOnNewRow: true,
      formKey: 'exeact',
    });
    expect(column.floatingFilterComponentParams).toEqual({
      possibleLabelWithValues: [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false },
      ],
      suppressFilterButton: true,
    });
    // onCellClicked function
    const params = {
      data: data,
      node: node,
      api: mockGridApi,
    } as unknown as CellClickedEvent;
    const input = document.createElement('input');
    input.checked = true;
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: input });
    params.event = event;
    const onCellClicked = column.onCellClicked;
    onCellClicked(params);
    const updateDTO = exemplaire;
    updateDTO.nbrexe = 1;
    updateDTO.exeact = true;
    expect(mockApiService.updateExemplaire).toHaveBeenCalledWith(updateDTO);
    expect(params.node.data.exeact).toEqual(updateDTO.exeact);
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: "L'état de l'exemplaire [p-117-snv2-com-fic-gm-res] a été mis à jour avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('test column exeact event click with error, do not change the value', () => {
    const columnDefs = service.getColumnDefs(true);
    const column = columnDefs.find((col: ColDef) => col.field === 'exeact') as ColDef;
    const params = {
      data: data,
      node: node,
      api: mockGridApi,
    } as unknown as CellClickedEvent;
    const input = document.createElement('input');
    input.checked = true;
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: input });
    params.event = event;
    const onCellClicked = column.onCellClicked;
    // if error, do not change the value
    mockApiService.updateExemplaire.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    onCellClicked(params);
    expect(params.node.data.exeact).toBeFalsy();
    expect(params.api.redrawRows).toHaveBeenCalledWith({ rowNodes: [params.node] });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Erreur',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('test event click|change inactif in mode edit for column exeact|coddes|codres|codsit', () => {
    const columnDefs = service.getColumnDefs(true);
    const colExe = columnDefs.find((col: ColDef) => col.field === 'exeact') as ColDef;
    const colDes = columnDefs.find((col: ColDef) => col.field === 'coddes') as ColDef;
    const colRes = columnDefs.find((col: ColDef) => col.field === 'codres') as ColDef;
    const colSit = columnDefs.find((col: ColDef) => col.field === 'codsit') as ColDef;
    const paramsEventClick = {
      data: data,
      node: node,
      api: mockGridApi,
      colDef: {
        cellRendererParams: { isEditing: true },
      },
    } as unknown as CellClickedEvent;
    const paramsEventChange = {
      data: data,
      node: node,
      api: mockGridApi,
      oldValue: 'oldv',
      colDef: {
        cellRendererParams: { isEditing: true },
      },
    } as unknown as CellValueChangedEvent;
    // test col exeact
    const onCellClicked = colExe.onCellClicked;
    onCellClicked(paramsEventClick);
    // event is not actif in mode edit
    expect(mockApiService.updateExemplaire).not.toHaveBeenCalled();
    expect(paramsEventClick.api.redrawRows).not.toHaveBeenCalled();

    // test col coddes
    const onCellDesValueChanged = colDes.onCellValueChanged;
    onCellDesValueChanged(paramsEventChange);
    // event is not actif in mode edit
    expect(mockApiService.updateExemplaire).not.toHaveBeenCalled();
    expect(paramsEventChange.api.redrawRows).not.toHaveBeenCalled();

    // test col codres
    const onCellResValueChanged = colRes.onCellValueChanged;
    onCellResValueChanged(paramsEventChange);
    // event is not actif in mode edit
    expect(mockApiService.updateExemplaire).not.toHaveBeenCalled();
    expect(paramsEventChange.api.redrawRows).not.toHaveBeenCalled();

    // test col codsit
    const onCellSitValueChanged = colSit.onCellValueChanged;
    onCellSitValueChanged(paramsEventChange);
    // event is not actif in mode edit
    expect(mockApiService.updateExemplaire).not.toHaveBeenCalled();
    expect(paramsEventChange.api.redrawRows).not.toHaveBeenCalled();
  });
});
