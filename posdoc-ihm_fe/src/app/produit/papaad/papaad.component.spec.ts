import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApolloQueryResult } from '@apollo/client/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { ApiAdelaidePapaadService } from '@app/services/api-adelaide-papaad.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { PapaadComponent } from './papaad.component';
import { TableauPapaadService } from './service/tableau-papaad.service';

describe('TableauComponent', () => {
  let component: PapaadComponent;
  let fixture: ComponentFixture<PapaadComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauPapaadService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaidePapaadService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockData: ApolloQueryResult<any> = {
    data: {
      allPapaads: [
        {
          codeCommande: 'PI06',
          codeFichier: 'PI06M',
          codeNotif: '*',
          libelle: 'EMBAUCHE DU 1ER AU 50EME SALARIE EN ZRR CTP 513',
          periode: false,
          codeRND: '2.1.4.5.1',
          appPro: 'ADELAIDE',
          typeHas: 'SHA-1',
          format: 'fmt/354',
          isUrib: null,
          nsTruc: false,
          imprime: false,
          huissier: false,
          numNot: false,
          strRaf: false,
          contrat: false,
          medele: false,
          idtbcc: false,
        },
        {
          codeCommande: 'RP37',
          codeFichier: 'QP37G',
          codeNotif: '*',
          libelle: 'NOTIFICATION DE REMBOURSEMENT (ANOMALIES REGULS CREDITRICES)',
          periode: false,
          codeRND: '2.2.3.2.2',
          appPro: 'ADELAIDE',
          typeHas: 'SHA-1',
          format: 'fmt/354',
          isUrib: null,
          nsTruc: false,
          imprime: false,
          huissier: false,
          numNot: false,
          strRaf: false,
          contrat: false,
          medele: false,
          idtbcc: false,
        },
      ],
      getAllDistinctCodComCodFicCodPrd: [
        {
          codeCom: 'RP37',
          codeFic: 'QP37G',
          codePrd: 'ABC',
        },
        {
          codeCom: 'PI06',
          codeFic: 'PI06M',
          codePrd: '',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show', 'removeAllStatic']);
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const apiAdelaideSpy = jasmine.createSpyObj('ApiAdelaidePapaadService', ['getAllPapaad', 'createPapaad', 'updatePapaad', 'deletePapaads']);
    const generateFileSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const tableauGammeSpy = jasmine.createSpyObj('TableauPapaadService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    const gridApiSpy = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'applyTransaction',
      'redrawRows',
      'forEachNode',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort',
    ]);

    TestBed.configureTestingModule({
      declarations: [PapaadComponent],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: ApiAdelaidePapaadService, useValue: apiAdelaideSpy },
        { provide: GenerateFileService, useValue: generateFileSpy },
        { provide: TableauPapaadService, useValue: tableauGammeSpy },
        { provide: PermissionService, useValue: permissionSpy },
      ],
    }).compileComponents();

    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaidePapaadService) as jasmine.SpyObj<ApiAdelaidePapaadService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockTableauService = TestBed.inject(TableauPapaadService) as jasmine.SpyObj<TableauPapaadService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockGridApi = gridApiSpy;
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue([]);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideService.getAllPapaad.and.returnValue(of(mockData));
    fixture = TestBed.createComponent(PapaadComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize grid options and column definitions on ngOnInit', () => {
    fixture.detectChanges();
    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('nodata');
  });

  it('should set correct permission properties', () => {
    fixture.detectChanges();
    expect(component.canAddPermPosition).toBe(AUTH.FICHIER_EDITION.PAPAAD[KEY_AJOUTER_AUTH]);
    expect(component.canRemovePermPosition).toBe(AUTH.FICHIER_EDITION.PAPAAD[KEY_SUPPRIMER_AUTH]);
    expect(component.addType).toBe(AddType.INLINE_ROW);
  });

  it('should load data on grid ready', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent;

    component.onGridReady(mockParams);
    fixture.detectChanges();

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiAdelaideService.getAllPapaad).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.nombrePapaadTotal).toBe(2);
    expect(component.rowData.length).toBe(2);
  });

  it('should create new row successfully', () => {
    const createRow = {
      codeCommande: 'PI06',
      codeFichier: 'PI06M',
      codeNotif: '*',
      libelle: 'EMBAUCHE DU 1ER AU 50EME SALARIE EN ZRR CTP 513',
      periode: false,
      codeRND: '2.1.4.5.1',
      appPro: 'ADELAIDE',
      typeHas: 'SHA-1',
      format: 'fmt/354',
      isUrib: null,
      nsTruc: false,
      imprime: false,
      huissier: false,
      numNot: false,
      strRaf: false,
      contrat: false,
      medele: false,
      idtbcc: false,
      newRow: true,
    };
    const editedRowMap = new Map([[1, createRow]]);
    const createResponse: ApolloQueryResult<any> = {
      data: { createPapaad: createRow },
      loading: false,
      networkStatus: 7,
    };

    mockApiAdelaideService.createPapaad.and.returnValue(of(createResponse));
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(mockApiAdelaideService.createPapaad).toHaveBeenCalledWith(createRow);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le papaad "PI06 PI06M" a été créé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle create error', () => {
    const createRow = {
      codeCommande: 'PI06',
      codeFichier: 'PI06M',
      codeNotif: '*',
      libelle: 'EMBAUCHE DU 1ER AU 50EME SALARIE EN ZRR CTP 513',
      periode: false,
      codeRND: '2.1.4.5.1',
      appPro: 'ADELAIDE',
      typeHas: 'SHA-1',
      format: 'fmt/354',
      isUrib: null,
      nsTruc: false,
      imprime: false,
      huissier: false,
      numNot: false,
      strRaf: false,
      contrat: false,
      medele: false,
      idtbcc: false,
      newRow: true,
    };
    const editedRowMap = new Map([[1, createRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de création' }] };
    mockApiAdelaideService.createPapaad.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(createRow.newRow).toBe(true);
    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should update existing row successfully', () => {
    const updateRow = {
      codeCommande: 'PI06',
      codeFichier: 'PI06M',
      codeNotif: '*',
      libelle: 'EMBAUCHE DU 1ER AU 50EME SALARIE EN ZRR CTP 513',
      periode: false,
      codeRND: '2.1.4.5.1',
      appPro: 'ADELAIDE',
      typeHas: 'SHA-1',
      format: 'fmt/354',
      isUrib: null,
      nsTruc: false,
      imprime: false,
      huissier: false,
      numNot: false,
      strRaf: false,
      contrat: false,
      medele: false,
      idtbcc: false,
      newRow: false,
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const updateResponse: ApolloQueryResult<any> = {
      data: { updatePapaad: updateRow },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.updatePapaad.and.returnValue(of(updateResponse));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(mockApiAdelaideService.updatePapaad).toHaveBeenCalledWith(updateRow);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le papaad "PI06 PI06M" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle update error', () => {
    const updateRow = {
      codeCommande: 'PI06',
      codeFichier: 'PI06M',
      codeNotif: '*',
      libelle: 'EMBAUCHE DU 1ER AU 50EME SALARIE EN ZRR CTP 513',
      periode: false,
      codeRND: '2.1.4.5.1',
      appPro: 'ADELAIDE',
      typeHas: 'SHA-1',
      format: 'fmt/354',
      isUrib: null,
      nsTruc: false,
      imprime: false,
      huissier: false,
      numNot: false,
      strRaf: false,
      contrat: false,
      medele: false,
      idtbcc: false,
      newRow: false,
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de la modification' }] };
    mockApiAdelaideService.updatePapaad.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(updateRow.newRow).toBe(false);
    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should delete single row successfully', () => {
    const singleDeleteDTO = [
      {
        codeCommande: 'PI06',
        codeFichier: 'PI06M',
        codeNotif: '*',
      },
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deletePapaads: true },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deletePapaads.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(singleDeleteDTO);
    fixture.detectChanges();

    expect(mockApiAdelaideService.deletePapaads).toHaveBeenCalledWith(singleDeleteDTO);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: singleDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le papaad a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should delete multi row successfully', () => {
    const multiDeleteDTO = [
      {
        codeCommande: 'PI06',
        codeFichier: 'PI06M',
        codeNotif: '*',
      },
      {
        codeCommande: 'PI07',
        codeFichier: 'PI07M',
        codeNotif: '*',
      },
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deletePapaads: true },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deletePapaads.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(multiDeleteDTO);
    fixture.detectChanges();

    expect(mockApiAdelaideService.deletePapaads).toHaveBeenCalledWith(multiDeleteDTO);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: multiDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les papaads ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle delete error', () => {
    const singleDeleteDTO = [
      {
        codeCommande: 'PI06',
        codeFichier: 'PI06M',
        codeNotif: '*',
      },
    ];
    const error = { graphQLErrors: [{ message: 'Erreur de la suppression' }] };
    mockApiAdelaideService.deletePapaads.and.returnValue(throwError(error));

    component.onDeleteRow(singleDeleteDTO);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    const mockColumnDefs = [
      { headerName: 'Commande', field: 'codeCommande' },
      { headerName: 'Fichier', field: 'codeFichier' },
    ];
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { codeCommande: 'PI06', codeFichier: '' } } as RowNode;
      callback(mockNode, 0);
    });
    component.gridApi = mockGridApi;

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith([['PI06', null]], ['Commande', 'Fichier'], 'Liste des Papaads', {
      columnDefs: mockColumnDefs,
      pageOrientation: 'landscape',
    });
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    const mockColumnDefs = [
      { headerName: 'Commande', field: 'codeCommande' },
      { headerName: 'Fichier', field: 'codeFichier' },
    ];
    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { codeCommande: 'PI06', codeFichier: 'PI06M' } } as RowNode;
      callback(mockNode, 0);
    });
    component.gridApi = mockGridApi;

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
  });

  it('should properly set errors in asynchronousErrors$', () => {
    const errors = new Map();
    const error = { isError: true, message: 'Test error', id: null };

    component.setError(1, error, errors);

    expect(errors.get(1)).toEqual([error]);

    // Test adding another error to same key
    const error2 = { isError: true, message: 'Test error 2', id: null };
    component.setError(1, error2, errors);

    expect(errors.get(1)).toEqual([error, error2]);
  });
});
