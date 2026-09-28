import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServeurComponent } from './serveur.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauServeurService } from './service/tableau-serveur.service';
import { ApiAdelaideServeurService } from '../../../services/api-adelaide-serveur.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { of, throwError } from 'rxjs';
import { GridApi, GridReadyEvent, GridOptions, ColDef } from 'ag-grid-community';
import { BehaviorSubject } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';

describe('ServeurComponent', () => {
  let component: ServeurComponent;
  let fixture: ComponentFixture<ServeurComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauServeurService: jasmine.SpyObj<TableauServeurService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideServeurService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockFormatterService: jasmine.SpyObj<FormattersService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockGridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
  };

  const mockColumnDefs: ColDef[] = [
    { headerName: 'Serveur', field: 'code' },
    { headerName: 'Libellé', field: 'libelle' },
    { headerName: 'Système', field: 'systeme' },
  ];

  const mockServerData = {
    data: {
      allServers: [
        {
          code: 'SRV001',
          libelle: 'Serveur Test 1',
          systeme: 'LINUX',
          adresseIp: '192.168.1.1',
          teste: true,
          actif: true,
        },
        {
          code: 'SRV002',
          libelle: 'Serveur Test 2',
          systeme: 'WINDOWS',
          adresseIp: '192.168.1.2',
          teste: false,
          actif: false,
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(() => {
    // Create mock services
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'createGridConfiguration',
    ]);
    mockTableauServeurService = jasmine.createSpyObj('TableauServeurService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideServeurService', [
      'getAllServers',
      'createServer',
      'updateServer',
      'deleteServers',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockFormatterService = jasmine.createSpyObj('FormattersService', ['lookupValue']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse', 'hasPermission']);

    // Create mock GridApi
    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'applyTransaction',
      'redrawRows',
      'forEachNode',
      'forEachNodeAfterFilterAndSort',
      'getColumnDefs',
    ]);

    // Setup default return values
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions);
    mockTableauServeurService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauServeurService.getOverlayNoRowsTemplate.and.returnValue('<span class="no-rows">Aucun résultat</span>');
    mockTableauServeurService.testeMapping = { false: '-', true: 'Testé' };
    mockTableauServeurService.etatMapping = { false: 'Inactif', true: 'Actif' };
    mockFormatterService.lookupValue.and.callFake((mapping, value) => mapping[value]);
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [ServeurComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauServeurService, useValue: mockTableauServeurService },
        { provide: ApiAdelaideServeurService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: NotesService, useValue: mockNoteService },
        { provide: FormattersService, useValue: mockFormatterService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    });

    fixture = TestBed.createComponent(ServeurComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize grid options and column definitions', () => {
      component.ngOnInit();

      expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
      expect(mockTableauServeurService.getColumnDefs).toHaveBeenCalledWith(true);
      expect(mockTableauServeurService.getOverlayNoRowsTemplate).toHaveBeenCalled();
      expect(component.gridOptions).toEqual(mockGridOptions);
      expect(component.columnDefs).toEqual(mockColumnDefs);
      expect(component.overlayNoRowsTemplate).toBe('<span class="no-rows">Aucun résultat</span>');
    });
  });

  describe('onGridReady', () => {
    it('should load servers and populate the grid', () => {
      mockApiAdelaideService.getAllServers.and.returnValue(of(mockServerData as any));
      const params = { api: mockGridApi } as any;

      component.onGridReady(params);

      expect(component.gridApi).toBe(mockGridApi);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
      expect(mockApiAdelaideService.getAllServers).toHaveBeenCalled();
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      expect(component.nombreServeurTotal).toBe(2);
      expect(component.rowData.length).toBe(2);
      expect(component.rowData[0].code).toBe('SRV001');
      expect(component.rowData[0].teste).toBe('Testé');
      expect(component.rowData[0].actif).toBe('Actif');
      expect(component.rowData[1].teste).toBe('-');
      expect(component.rowData[1].actif).toBe('Inactif');
    });
  });

  describe('onSaveEdition - Create new server', () => {
    it('should successfully create a new server', () => {
      const newServer = {
        code: 'SRV003',
        libelle: 'Nouveau Serveur',
        systeme: 'LINUX',
        adresseIp: '192.168.1.3',
        teste: 'Testé',
        actif: 'Actif',
        newRow: true,
      };
      const editedRow = new Map<number, any>([[1, newServer]]);
      const createResponse = { data: { createServer: { code: 'SRV003' } } };

      mockApiAdelaideService.createServer.and.returnValue(of(createResponse));
      component.gridApi = mockGridApi;

      let forEachNodeCallback: (node: any) => void;
      mockGridApi.forEachNode.and.callFake((callback: any) => {
        forEachNodeCallback = callback;
        callback({ data: { newRow: true, code: 'SRV003' } });
      });

      component.onSaveEdition(editedRow);

      expect(mockApiAdelaideService.createServer).toHaveBeenCalledWith(
        jasmine.objectContaining({
          code: 'SRV003',
          libelle: 'Nouveau Serveur',
          systeme: 'LINUX',
          adresseIp: '192.168.1.3',
          teste: true,
          actif: true,
        })
      );
      expect(mockNoteService.show).toHaveBeenCalledWith({
        title: 'Le serveur "SRV003" a été créé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      expect(component.asynchronousErrors$.value).toEqual(new Map());
    });

    it('should handle error when creating a new server', () => {
      const newServer = {
        code: 'SRV003',
        libelle: 'Nouveau Serveur',
        systeme: 'LINUX',
        adresseIp: '192.168.1.3',
        teste: 'Testé',
        actif: 'Actif',
        newRow: true,
      };
      const editedRow = new Map<number, any>([[1, newServer]]);
      const errorResponse = {
        graphQLErrors: [{ message: 'Le code serveur existe déjà' }],
      };

      mockApiAdelaideService.createServer.and.returnValue(throwError(errorResponse));
      component.gridApi = mockGridApi;

      component.onSaveEdition(editedRow);

      expect(mockApiAdelaideService.createServer).toHaveBeenCalled();
      expect(mockNoteService.show).not.toHaveBeenCalled();
      expect(newServer.newRow).toBe(true);

      const errors = component.asynchronousErrors$.value;
      expect(errors.has(1)).toBe(true);
      expect(errors.get(1)[0].isError).toBe(true);
      expect(errors.get(1)[0].message).toBe('Le code serveur existe déjà');
    });
  });

  describe('onSaveEdition - Update existing server', () => {
    it('should successfully update an existing server', () => {
      const existingServer = {
        code: 'SRV001',
        libelle: 'Serveur Modifié',
        systeme: 'WINDOWS',
        adresseIp: '192.168.1.1',
        teste: 'Testé',
        actif: 'Actif',
      };
      const editedRow = new Map<number, any>([[1, existingServer]]);
      const updateResponse = { data: { updateServer: { code: 'SRV001' } } };

      mockApiAdelaideService.updateServer.and.returnValue(of(updateResponse));

      component.onSaveEdition(editedRow);

      expect(mockApiAdelaideService.updateServer).toHaveBeenCalledWith(
        jasmine.objectContaining({
          code: 'SRV001',
          libelle: 'Serveur Modifié',
          systeme: 'WINDOWS',
          adresseIp: '192.168.1.1',
          teste: true,
          actif: true,
        })
      );
      expect(mockNoteService.show).toHaveBeenCalledWith({
        title: 'Le serveur "SRV001" a été mis à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      expect(component.asynchronousErrors$.value).toEqual(new Map());
    });

    it('should handle error when updating an existing server', () => {
      const existingServer = {
        code: 'SRV001',
        libelle: 'Serveur Modifié',
        systeme: 'WINDOWS',
        adresseIp: '192.168.1.1',
        teste: 'Testé',
        actif: 'Actif',
      };
      const editedRow = new Map<number, any>([[1, existingServer]]);
      const errorResponse = {
        graphQLErrors: [{ message: 'Erreur lors de la mise à jour' }],
      };

      mockApiAdelaideService.updateServer.and.returnValue(throwError(errorResponse));

      component.onSaveEdition(editedRow);

      expect(mockApiAdelaideService.updateServer).toHaveBeenCalled();
      expect(mockNoteService.show).not.toHaveBeenCalled();

      const errors = component.asynchronousErrors$.value;
      expect(errors.has(1)).toBe(true);
      expect(errors.get(1)[0].isError).toBe(true);
      expect(errors.get(1)[0].message).toBe('Erreur lors de la mise à jour');
    });
  });

  describe('onDeleteRow', () => {
    it('should successfully delete a single server', () => {
      const serverToDelete = [{ code: 'SRV001', libelle: 'Serveur Test 1' }];
      const deleteResponse = { data: { deleteServers: ['SRV001'] } };

      mockApiAdelaideService.deleteServers.and.returnValue(of(deleteResponse));
      component.gridApi = mockGridApi;

      component.onDeleteRow(serverToDelete);

      expect(mockApiAdelaideService.deleteServers).toHaveBeenCalledWith(['SRV001']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: serverToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNoteService.show).toHaveBeenCalledWith({
        title: 'Le serveur a été supprimé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
    });

    it('should successfully delete multiple servers', () => {
      const serversToDelete = [
        { code: 'SRV001', libelle: 'Serveur Test 1' },
        { code: 'SRV002', libelle: 'Serveur Test 2' },
      ];
      const deleteResponse = { data: { deleteServers: ['SRV001', 'SRV002'] } };

      mockApiAdelaideService.deleteServers.and.returnValue(of(deleteResponse));
      component.gridApi = mockGridApi;

      component.onDeleteRow(serversToDelete);

      expect(mockApiAdelaideService.deleteServers).toHaveBeenCalledWith(['SRV001', 'SRV002']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: serversToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNoteService.show).toHaveBeenCalledWith({
        title: 'Les serveurs ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
    });

    it('should handle error when deleting servers', () => {
      const serverToDelete = [{ code: 'SRV001', libelle: 'Serveur Test 1' }];
      const errorResponse = {
        graphQLErrors: [{ message: 'Impossible de supprimer le serveur' }],
      };

      mockApiAdelaideService.deleteServers.and.returnValue(throwError(errorResponse));
      component.gridApi = mockGridApi;

      component.onDeleteRow(serverToDelete);

      expect(mockApiAdelaideService.deleteServers).toHaveBeenCalledWith(['SRV001']);
      expect(mockGridApi.applyTransaction).not.toHaveBeenCalled();
      expect(mockNoteService.show).not.toHaveBeenCalled();
    });
  });

  describe('setError', () => {
    it('should add error to a new key in the errors map', () => {
      const errors = new Map<number, TableAsynchronousError[]>();
      const error: TableAsynchronousError = {
        isError: true,
        message: 'Test error message',
        id: null,
      };

      component.setError(1, error, errors);

      expect(errors.has(1)).toBe(true);
      expect(errors.get(1).length).toBe(1);
      expect(errors.get(1)[0]).toEqual(error);
    });

    it('should append error to an existing key in the errors map', () => {
      const errors = new Map<number, TableAsynchronousError[]>();
      const error1: TableAsynchronousError = {
        isError: true,
        message: 'First error',
        id: null,
      };
      const error2: TableAsynchronousError = {
        isError: true,
        message: 'Second error',
        id: null,
      };

      component.setError(1, error1, errors);
      component.setError(1, error2, errors);

      expect(errors.get(1).length).toBe(2);
      expect(errors.get(1)[0].message).toBe('First error');
      expect(errors.get(1)[1].message).toBe('Second error');
    });
  });

  describe('export', () => {
    beforeEach(() => {
      component.gridApi = mockGridApi;

      const mockColumnDefs: ColDef[] = [
        { field: 'code', headerName: 'Serveur' },
        { field: 'libelle', headerName: 'Libellé' },
        { field: 'systeme', headerName: 'Système' },
        { field: 'adresseIp', headerName: 'Adresse IP' },
        { field: 'teste', headerName: 'Test' },
        { field: 'actif', headerName: 'Etat' },
      ];

      mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);

      const mockNodes = [
        {
          data: {
            code: 'SRV001',
            libelle: 'Serveur Test 1',
            systeme: 'LINUX',
            adresseIp: '192.168.1.1',
            teste: 'Testé',
            actif: 'Actif',
          },
        },
        {
          data: {
            code: 'SRV002',
            libelle: 'Serveur Test 2',
            systeme: 'WINDOWS',
            adresseIp: '192.168.1.2',
            teste: '-',
            actif: 'Inactif',
          },
        },
      ];

      mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback: any) => {
        mockNodes.forEach(node => callback(node));
      });
    });

    it('should export data as PDF', () => {
      const exportEvent = { type: 'exportAsPDF' };

      component.export(exportEvent);

      expect(mockGridApi.getColumnDefs).toHaveBeenCalled();
      expect(mockGridApi.forEachNodeAfterFilterAndSort).toHaveBeenCalled();
      expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
        jasmine.any(Array),
        ['Serveur', 'Libellé', 'Système', 'Adresse IP', 'Test', 'Etat'],
        'Liste des serveurs',
        {
          action: 'fgColor',
          column: [
            { index: 6, texte: 'Inactif', color: 'FF9999' },
            { index: 6, texte: 'Actif', color: 'FF99FF99' },
          ],
        }
      );
    });

    it('should export data as Excel', () => {
      const exportEvent = { type: 'exportAsExcel' };

      component.export(exportEvent);

      expect(mockGridApi.getColumnDefs).toHaveBeenCalled();
      expect(mockGridApi.forEachNodeAfterFilterAndSort).toHaveBeenCalled();
      expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
        jasmine.any(Array),
        ['Serveur', 'Libellé', 'Système', 'Adresse IP', 'Test', 'Etat'],
        'Liste des serveurs',
        {
          action: 'fgColor',
          column: [
            { index: 6, texte: 'Inactif', color: 'FF9999' },
            { index: 6, texte: 'Actif', color: 'FF99FF99' },
          ],
        }
      );
    });

    it('should correctly format data for export', () => {
      const exportEvent = { type: 'exportAsPDF' };

      component.export(exportEvent);

      const callArgs = mockGenerateFileService.generatePDFFile.calls.mostRecent().args;
      const exportedData = callArgs[0];

      expect(exportedData.length).toBe(2);
      expect(exportedData[0]).toEqual(['SRV001', 'Serveur Test 1', 'LINUX', '192.168.1.1', 'Testé', 'Actif']);
      expect(exportedData[1]).toEqual(['SRV002', 'Serveur Test 2', 'WINDOWS', '192.168.1.2', '-', 'Inactif']);
    });
  });

  describe('Component properties', () => {
    it('should have correct initial addType', () => {
      expect(component.addType).toBe(AddType.INLINE_ROW);
    });

    it('should initialize asynchronousErrors$ as BehaviorSubject', () => {
      expect(component.asynchronousErrors$).toBeInstanceOf(BehaviorSubject);
      expect(component.asynchronousErrors$.value).toBeNull();
    });
  });
});
