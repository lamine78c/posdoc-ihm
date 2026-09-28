import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DistributionImprimeComponent } from './distribution-imprime.component';
import { TableauImprimeService } from '../service/tableau-imprime.service';
import { ApiAdelaideImprimeService } from '@app/services/api-adelaide-imprime.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { ApolloQueryResult } from '@apollo/client/core';
import { of, throwError } from 'rxjs';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';

describe('DistributionImprimeComponent', () => {
  let component: DistributionImprimeComponent;
  let fixture: ComponentFixture<DistributionImprimeComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauImprimeService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideImprimeService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockData: ApolloQueryResult<any> = {
    data: {
      allImprimes: [
        {
          reference: '-',
          libelle: '-',
          codeRND: 'd',
          typeComposition: '-',
          typeCouleur: '4',
          rectoVerso: false,
          isNotAuthorisedToBeDeleted: true,
        },
        {
          reference: '00000',
          libelle: 'DSDS',
          codeRND: null,
          typeComposition: 'E',
          typeCouleur: '1',
          rectoVerso: true,
          isNotAuthorisedToBeDeleted: false,
        },
      ],
      allComposs: [
        {
          typmef: 'E',
          libmef: 'Compo. externe (Doc1-V4.5)',
        },
        {
          typmef: 'F',
          libmef: 'Compo. externe (Doc1-V5.1)',
        },
      ],
      allColimps: [
        {
          typcol: '1',
          libcol: 'Bleu et vert',
        },
        {
          typcol: '2',
          libcol: 'grisé',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockColumnDefs = [
    { headerName: 'Type Composition', field: 'typeComposition', cellRendererParams: { selectData: null } },
    { headerName: 'Couleur', field: 'typeCouleur', cellRendererParams: { selectData: null } },
  ];

  beforeEach(waitForAsync(() => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const apiAdelaideSpy = jasmine.createSpyObj('ApiAdelaideImprimeService', ['getAllImprimes', 'deleteImprimes', 'createImprime', 'updateImprime']);
    const generateFileSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const tableauServiceSpy = jasmine.createSpyObj('TableauImprimeService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
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
      declarations: [DistributionImprimeComponent],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: ApiAdelaideImprimeService, useValue: apiAdelaideSpy },
        { provide: GenerateFileService, useValue: generateFileSpy },
        { provide: TableauImprimeService, useValue: tableauServiceSpy },
        { provide: PermissionService, useValue: permissionSpy },
      ],
    }).compileComponents();

    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaideImprimeService) as jasmine.SpyObj<ApiAdelaideImprimeService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockTableauService = TestBed.inject(TableauImprimeService) as jasmine.SpyObj<TableauImprimeService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockGridApi = gridApiSpy;
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideService.getAllImprimes.and.returnValue(of(mockData));
    fixture = TestBed.createComponent(DistributionImprimeComponent);
    component = fixture.componentInstance;
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
    expect(component.canAddPermPosition).toBe(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES[KEY_AJOUTER_AUTH]);
    expect(component.canRemovePermPosition).toBe(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES[KEY_SUPPRIMER_AUTH]);
    expect(component.addType).toBe(AddType.INLINE_ROW);
  });

  it('should load data on grid ready', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent;

    fixture.detectChanges();
    component.onGridReady(mockParams);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiAdelaideService.getAllImprimes).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.listeDesTypesComposition.length).toBe(2);
    expect(component.listeDesTypesCouleur.length).toBe(2);
    expect(component.nombreImprimesTotal).toBe(2);
  });

  it('should create new row successfully', () => {
    const createRowBefore = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      typeComposition: 'Compo. externe (Doc1-V4.5)',
      typeCouleur: 'grisé',
      rectoVerso: false,
      newRow: true,
    };
    const createRow = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      typeComposition: 'E',
      typeCouleur: '2',
      rectoVerso: false,
    };
    const editedRowMap = new Map([[1, createRowBefore]]);
    const createResponse: ApolloQueryResult<any> = {
      data: { createImprime: createRow },
      loading: false,
      networkStatus: 7,
    };

    mockApiAdelaideService.createImprime.and.returnValue(of(createResponse));
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });

    fixture.detectChanges();
    component.listeDesTypesComposition = mockData.data.allComposs;
    component.listeDesTypesCouleur = mockData.data.allColimps;
    component.gridApi = mockGridApi;
    component.onSaveEdition(editedRowMap);

    expect(component.listeDesTypesComposition.length).toBe(2);
    expect(component.listeDesTypesCouleur.length).toBe(2);
    expect(mockApiAdelaideService.createImprime).toHaveBeenCalledWith(createRow);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'L\'imprimé "test" a été créé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle create error', () => {
    const createRow = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      typeComposition: 'Compo. externe (Doc1-V4.5)',
      typeCouleur: 'grisé',
      rectoVerso: false,
      newRow: true,
    };
    const editedRowMap = new Map([[1, createRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de création' }] };
    mockApiAdelaideService.createImprime.and.returnValue(throwError(error));
    component.listeDesTypesComposition = mockData.data.allComposs;
    component.listeDesTypesCouleur = mockData.data.allColimps;

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should update existing row successfully', () => {
    const updateRowBefore = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      typeComposition: 'Compo. externe (Doc1-V4.5)',
      typeCouleur: 'grisé',
      rectoVerso: false,
    };
    const updateRow = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      typeComposition: 'E',
      typeCouleur: '2',
      rectoVerso: false,
    };
    const editedRowMap = new Map([[1, updateRowBefore]]);
    const updateResponse: ApolloQueryResult<any> = {
      data: { updateImprime: updateRow },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.updateImprime.and.returnValue(of(updateResponse));
    mockGridApi.forEachNode.and.callFake((callback: (node: RowNode, index: number) => void) => {
      const mockNode = { data: { newRow: true } } as RowNode;
      callback(mockNode, 0);
    });
    component.listeDesTypesComposition = mockData.data.allComposs;
    component.listeDesTypesCouleur = mockData.data.allColimps;
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.listeDesTypesComposition.length).toBe(2);
    expect(component.listeDesTypesCouleur.length).toBe(2);
    expect(mockApiAdelaideService.updateImprime).toHaveBeenCalledWith(updateRow);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'L\'imprimé "test" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle update error', () => {
    const updateRow = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      typeComposition: 'Compo. externe (Doc1-V4.5)',
      typeCouleur: 'grisé',
      rectoVerso: false,
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de la modification' }] };
    mockApiAdelaideService.updateImprime.and.returnValue(throwError(error));
    component.listeDesTypesComposition = mockData.data.allComposs;
    component.listeDesTypesCouleur = mockData.data.allColimps;

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should delete single row successfully', () => {
    const singleDeleteDTO = [
      {
        reference: 'test',
        libelle: 'test',
        codeRND: '',
        typeComposition: 'Compo. externe (Doc1-V4.5)',
        typeCouleur: 'grisé',
        rectoVerso: false,
      },
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deleteImprimes: true },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deleteImprimes.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(singleDeleteDTO);
    fixture.detectChanges();

    expect(mockApiAdelaideService.deleteImprimes).toHaveBeenCalledWith(singleDeleteDTO.map(e => e.reference));
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: singleDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: "L'imprimé a été supprimé avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should delete multi row successfully', () => {
    const multiDeleteDTO = [
      {
        reference: 'testA',
        libelle: 'test',
        codeRND: '',
        typeComposition: 'Compo. externe (Doc1-V4.5)',
        typeCouleur: 'grisé',
        rectoVerso: false,
      },
      {
        reference: 'testB',
        libelle: 'test',
        codeRND: '',
        typeComposition: 'Compo. externe (Doc1-V4.5)',
        typeCouleur: 'grisé',
        rectoVerso: false,
      },
    ];
    const deleteResponse: ApolloQueryResult<any> = {
      data: { deleteImprimes: true },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideService.deleteImprimes.and.returnValue(of(deleteResponse));
    component.gridApi = mockGridApi;

    component.onDeleteRow(multiDeleteDTO);
    fixture.detectChanges();

    expect(mockApiAdelaideService.deleteImprimes).toHaveBeenCalledWith(multiDeleteDTO.map(e => e.reference));
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: multiDeleteDTO });
    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les imprimés ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle delete error', () => {
    const singleDeleteDTO = [
      {
        reference: 'testA',
        libelle: 'test',
        codeRND: '',
        typeComposition: 'Compo. externe (Doc1-V4.5)',
        typeCouleur: 'grisé',
        rectoVerso: false,
      },
    ];
    const error = { graphQLErrors: [{ message: 'Erreur de la suppression' }] };
    mockApiAdelaideService.deleteImprimes.and.returnValue(throwError(error));

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

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalled();
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
