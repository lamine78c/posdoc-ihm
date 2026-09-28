import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client/core';
import { ClientComponent } from './client.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauClientService } from './service/tableau-client.service';
import { ApiAdelaideClientService } from '@app/services/api-adelaide-client.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { AddType } from '@app/models/enums/add-type';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauClientService: jasmine.SpyObj<TableauClientService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideClientService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockClientData: ApolloQueryResult<any> = {
    data: {
      allClients: [
        { id: 1, code: 'CLIENT1', libelle: 'Client Test 1', codeAlliage: 'C1' },
        { id: 2, code: 'CLIENT2', libelle: 'Client Test 2', codeAlliage: 'C2' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  const mockColumnDefs = [
    { headerName: 'Code', field: 'code' },
    { headerName: 'Libellé', field: 'libelle' }
  ];

  beforeEach(waitForAsync(() => {
    mockTableauConfigService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauClientService = jasmine.createSpyObj('TableauClientService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideClientService', ['getAllClient', 'createClient', 'updateClient', 'deleteClients']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse', 'hasPermission']);
    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'forEachNode',
      'applyTransaction',
      'redrawRows',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort'
    ]);

    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauClientService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauClientService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getAllClient.and.returnValue(of(mockClientData));
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [ClientComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigService },
        { provide: TableauClientService, useValue: mockTableauClientService },
        { provide: ApiAdelaideClientService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientComponent);
    component = fixture.componentInstance;
  });

  describe('Initialisation du composant', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize grid options on ngOnInit', () => {
      component.ngOnInit();

      expect(mockTableauConfigService.createGridConfiguration).toHaveBeenCalledWith(true);
      expect(mockTableauClientService.getColumnDefs).toHaveBeenCalledWith(true);
      expect(mockTableauClientService.getOverlayNoRowsTemplate).toHaveBeenCalled();
      expect(component.gridOptions.suppressDragLeaveHidesColumns).toBe(true);
      expect(component.columnDefs).toEqual(mockColumnDefs);
    });

    it('should set addType to INLINE_ROW', () => {
      expect(component.addType).toBe(AddType.INLINE_ROW);
    });

    it('should initialize asynchronousErrors$ as BehaviorSubject', () => {
      expect(component.asynchronousErrors$).toBeInstanceOf(BehaviorSubject);
      expect(component.asynchronousErrors$.value).toBeNull();
    });
  });

  describe('onGridReady', () => {
    let gridReadyEvent: GridReadyEvent;

    beforeEach(() => {
      gridReadyEvent = {
        api: mockGridApi,
        context: null,
        type: 'gridReady'
      } as unknown as GridReadyEvent;
      component.ngOnInit();
    });

    it('should set grid APIs and load data successfully', () => {
      component.onGridReady(gridReadyEvent);

      expect(component.gridApi).toBe(mockGridApi);
      expect(component.gridColumnApi).toBe(mockGridApi);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
      expect(mockApiAdelaideService.getAllClient).toHaveBeenCalled();
    });

    it('should set rowData and nombreClientTotal when data is loaded', () => {
      component.onGridReady(gridReadyEvent);

      expect(component.rowData).toEqual(mockClientData.data.allClients);
      expect(component.nombreClientTotal).toBe(2);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
    });

    it('should not update nombreClientTotal if already set', () => {
      component.nombreClientTotal = 5;
      component.onGridReady(gridReadyEvent);

      expect(component.nombreClientTotal).toBe(5);
    });
  });

  describe('onSaveEdition - Création de client', () => {
    const newClient = {
      code: 'NEWCLIENT',
      libelle: 'Nouveau Client',
      codeAlliage: 'NC',
      newRow: true,
      nullField: null
    };

    beforeEach(() => {
      component.gridApi = mockGridApi;
      spyOn(component, 'setError');
    });

    it('should create new client successfully', () => {
      const editedRow = new Map([[1, { ...newClient }]]);
      const mockResponse: ApolloQueryResult<any> = {
        data: { createClient: { code: 'NEWCLIENT' } },
        loading: false,
        networkStatus: 7
      };
      mockApiAdelaideService.createClient.and.returnValue(of(mockResponse));

      component.onSaveEdition(editedRow);

      const expectedClient = {
        code: 'NEWCLIENT',
        libelle: 'Nouveau Client',
        codeAlliage: 'NC',
        newRow: null
      };

      expect(mockApiAdelaideService.createClient).toHaveBeenCalledWith(
        jasmine.objectContaining({
          code: 'NEWCLIENT',
          libelle: 'Nouveau Client',
          codeAlliage: 'NC'
        })
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le client "NEWCLIENT" a été créé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should handle creation error', () => {
      const editedRow = new Map([[1, { ...newClient }]]);
      const mockError = { graphQLErrors: [{ message: 'Code déjà existant' }] };
      mockApiAdelaideService.createClient.and.returnValue(throwError(mockError));

      component.onSaveEdition(editedRow);

      expect(component.setError).toHaveBeenCalledWith(
        1,
        { isError: true, message: 'Code déjà existant', id: null },
        jasmine.any(Map)
      );
      expect(editedRow.get(1).newRow).toBe(true);
    });
  });

  describe('onSaveEdition - Mise à jour de client', () => {
    const existingClient = {
      id: 1,
      code: 'CLIENT1',
      libelle: 'Client Modifié',
      codeAlliage: 'CM',
      nullField: null
    };

    beforeEach(() => {
      component.gridApi = mockGridApi;
      spyOn(component, 'setError');
    });

    it('should update existing client successfully', () => {
      const editedRow = new Map([[1, { ...existingClient }]]);
      const mockResponse: ApolloQueryResult<any> = {
        data: { updateClient: { code: 'CLIENT1' } },
        loading: false,
        networkStatus: 7
      };
      mockApiAdelaideService.updateClient.and.returnValue(of(mockResponse));

      component.onSaveEdition(editedRow);

      const expectedClient = {
        id: 1,
        code: 'CLIENT1',
        libelle: 'Client Modifié',
        codeAlliage: 'CM'
      };

      expect(mockApiAdelaideService.updateClient).toHaveBeenCalledWith(expectedClient);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le client "CLIENT1" a été mis à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
    });

    it('should handle update error', () => {
      const editedRow = new Map([[1, { ...existingClient }]]);
      const mockError = { graphQLErrors: [{ message: 'Erreur de mise à jour' }] };
      mockApiAdelaideService.updateClient.and.returnValue(throwError(mockError));

      component.onSaveEdition(editedRow);

      expect(component.setError).toHaveBeenCalledWith(
        1,
        { isError: true, message: 'Erreur de mise à jour', id: null },
        jasmine.any(Map)
      );
    });
  });

  describe('onDeleteRow', () => {
    const clientsToDelete = [
      { code: 'CLIENT1', libelle: 'Client 1' },
      { code: 'CLIENT2', libelle: 'Client 2' }
    ];

    beforeEach(() => {
      component.gridApi = mockGridApi;
      spyOn(SharedUtil, 'getNumberTotalRows').and.returnValue(5);
    });

    it('should delete single client successfully', () => {
      const singleClient = [clientsToDelete[0]];
      const mockResponse: ApolloQueryResult<any> = {
        data: {},
        loading: false,
        networkStatus: 7
      };
      mockApiAdelaideService.deleteClients.and.returnValue(of(mockResponse));

      component.onDeleteRow(singleClient);

      expect(mockApiAdelaideService.deleteClients).toHaveBeenCalledWith(['CLIENT1']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: singleClient });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le client a été supprimé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
    });

    it('should delete multiple clients successfully', () => {
      const mockResponse: ApolloQueryResult<any> = {
        data: {},
        loading: false,
        networkStatus: 7
      };
      mockApiAdelaideService.deleteClients.and.returnValue(of(mockResponse));

      component.onDeleteRow(clientsToDelete);

      expect(mockApiAdelaideService.deleteClients).toHaveBeenCalledWith(['CLIENT1', 'CLIENT2']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les clients ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
      expect(component.nombreClientTotal).toBe(5);
    });
  });

  describe('setError', () => {
    it('should add error to new key', () => {
      const errors = new Map();
      const error: TableAsynchronousError = { isError: true, message: 'Test error', id: null };

      component.setError(1, error, errors);

      expect(errors.has(1)).toBe(true);
      expect(errors.get(1)).toEqual([error]);
    });

    it('should add error to existing key', () => {
      const errors = new Map();
      const error1: TableAsynchronousError = { isError: true, message: 'Error 1', id: null };
      const error2: TableAsynchronousError = { isError: true, message: 'Error 2', id: null };

      errors.set(1, [error1]);
      component.setError(1, error2, errors);

      expect(errors.get(1)).toEqual([error1, error2]);
    });
  });

  describe('export', () => {
    beforeEach(() => {
      component.gridApi = mockGridApi;
      mockGridApi.getColumnDefs.and.returnValue([
        { field: 'code', headerName: 'Code' } as ColDef,
        { field: 'libelle', headerName: 'Libellé' } as ColDef,
        { field: null, headerName: null } as ColDef // Colonne à filtrer
      ]);
      mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
        const mockRowNode1 = {
          data: { code: 'CLIENT1', libelle: 'Test Client', other: 'ignored' }
        } as any;
        const mockRowNode2 = {
          data: { code: 'CLIENT2', libelle: '', other: 'ignored' }
        } as any;

        callback(mockRowNode1, 0);
        callback(mockRowNode2, 1);
      });
    });

    it('should export as PDF', () => {
      const exportEvent = { type: 'exportAsPDF' };

      component.export(exportEvent);

      expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
        [['CLIENT1', 'Test Client'], ['CLIENT2', null]],
        ['Code', 'Libellé'],
        'Liste des clients'
      );
    });

    it('should export as Excel', () => {
      const exportEvent = { type: 'exportAsExcel' };

      component.export(exportEvent);

      expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
        [['CLIENT1', 'Test Client'], ['CLIENT2', null]],
        ['Code', 'Libellé'],
        'Liste des clients'
      );
    });

    it('should filter columns without field or headerName', () => {
      const exportEvent = { type: 'exportAsPDF' };

      component.export(exportEvent);

      expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
        jasmine.any(Array),
        ['Code', 'Libellé'],
        'Liste des clients'
      );
    });
  });

  describe('Permissions', () => {
    it('should set correct permission properties', () => {
      expect(component.canAddPermPosition).toBeDefined();
      expect(component.canRemovePermPosition).toBeDefined();
    });
  });
});
