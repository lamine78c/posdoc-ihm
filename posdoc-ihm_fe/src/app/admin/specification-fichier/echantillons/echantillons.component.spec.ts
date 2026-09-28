import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EchantillonsComponent } from './echantillons.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauEchantillonService } from './service/tableau-echantillon.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideEchantillonService } from '@app/services/api-adelaide-echantillon.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';
import { PARECH_TYPECH_LOT, PARECH_TYPECH_PAGE } from '@app/shared/utils/Constants';

describe('EchantillonsComponent', () => {
  let component: EchantillonsComponent;
  let fixture: ComponentFixture<EchantillonsComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauEchantillonService: jasmine.SpyObj<TableauEchantillonService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideEchantillonService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockEchantillonsData = {
    data: {
      allParametresEchantillon: [
        { reference: 'ECH001', type: 'LOT', nombreLots: 10, nombrePages: 5, random: true, formule: '' },
        { reference: 'ECH002', type: 'PAGE', nombreLots: null, nombrePages: null, random: false, formule: 'P1,P5' },
        { reference: 'ECH003', type: 'LOT', nombreLots: 20, nombrePages: 10, random: false, formule: '' },
      ],
    },
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauEchantillonService = jasmine.createSpyObj('TableauEchantillonService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideEchantillonService', [
      'getAllEchantillons',
      'createParametreEchantillon',
      'updateParametreEchantillon',
      'deleteEchantillons',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({} as GridOptions);
    mockTableauEchantillonService.getColumnDefs.and.returnValue([]);
    mockTableauEchantillonService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getAllEchantillons.and.returnValue(of(mockEchantillonsData) as any);
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [EchantillonsComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauEchantillonService, useValue: mockTableauEchantillonService },
        { provide: ApiAdelaideEchantillonService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    if (mockNotesService?.show) {
      mockNotesService.show.calls.reset();
    }
    if (mockApiAdelaideService?.getAllEchantillons) {
      mockApiAdelaideService.getAllEchantillons.calls.reset();
    }
    if (mockApiAdelaideService?.createParametreEchantillon) {
      mockApiAdelaideService.createParametreEchantillon.calls.reset();
    }
    if (mockApiAdelaideService?.updateParametreEchantillon) {
      mockApiAdelaideService.updateParametreEchantillon.calls.reset();
    }
    if (mockApiAdelaideService?.deleteEchantillons) {
      mockApiAdelaideService.deleteEchantillons.calls.reset();
    }

    fixture = TestBed.createComponent(EchantillonsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component with correct properties', () => {
    expect(component.rowData).toEqual([]);
    expect(component.addType).toBe(AddType.INLINE_ROW);
    expect(component.asynchronousErrors$).toBeDefined();
  });

  it('should initialize gridOptions and columnDefs on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalled();
    expect(mockTableauEchantillonService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauEchantillonService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should load echantillons data on grid ready', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    expect(mockApiAdelaideService.getAllEchantillons).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
  });

  it('should set rowData and nombreEchantillonTotal after loading echantillons', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(component.rowData).toEqual(mockEchantillonsData.data.allParametresEchantillon);
      expect(component.nombreEchantillonTotal).toBe(3);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    }, 100);
  });

  it('should transform LOT type echantillon correctly with setEchantillonInterface', () => {
    const lotData = {
      reference: 'ECH001',
      type: PARECH_TYPECH_LOT,
      nombreLots: 10,
      nombrePages: 5,
      random: true,
      formule: 'ignored',
    };

    const result = component.setEchantillonInterface(lotData);

    expect(result).toEqual({
      reference: 'ECH001',
      type: PARECH_TYPECH_LOT,
      nombreLots: 10,
      nombrePages: 5,
      random: true,
      formule: '',
    });
  });

  it('should transform PAGE type echantillon correctly with setEchantillonInterface', () => {
    const pageData = {
      reference: 'ECH002',
      type: PARECH_TYPECH_PAGE,
      nombreLots: 5,
      nombrePages: 10,
      random: false,
      formule: 'P1,P5',
    };

    const result = component.setEchantillonInterface(pageData);

    expect(result).toEqual({
      reference: 'ECH002',
      type: PARECH_TYPECH_PAGE,
      nombreLots: null,
      nombrePages: null,
      random: false,
      formule: 'P1,P5',
    });
  });

  it('should return null for invalid echantillon data', () => {
    const invalidData = {
      reference: 'ECH003',
      type: PARECH_TYPECH_LOT,
      nombreLots: null,
      nombrePages: null,
      random: true,
    };

    const result = component.setEchantillonInterface(invalidData);

    expect(result).toBeNull();
  });

  it('should create new echantillon successfully on save edition', (done) => {
    const newEchantillon = {
      reference: 'ECH004',
      type: PARECH_TYPECH_LOT,
      nombreLots: 15,
      nombrePages: 8,
      random: true,
      newRow: true,
    };
    const editedRow = new Map([[0, newEchantillon]]);
    const mockResponse = { data: { createParametreEchantillon: { reference: 'ECH004' } } };

    mockApiAdelaideService.createParametreEchantillon.and.returnValue(of(mockResponse) as any);

    const mockGridApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.callFake((callback) => {
      // Simulate no nodes with newRow property
    });

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createParametreEchantillon).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reference: 'ECH004',
          type: PARECH_TYPECH_LOT,
          nombreLots: 15,
          nombrePages: 8,
        })
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'L\'échantillon "ECH004" a été créé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when creating echantillon fails', (done) => {
    const newEchantillon = {
      reference: 'ECH005',
      type: PARECH_TYPECH_LOT,
      nombreLots: 10,
      nombrePages: 5,
      random: true,
      newRow: true,
    };
    const editedRow = new Map([[0, newEchantillon]]);
    const mockError = { graphQLErrors: [{ message: 'Error creating echantillon' }] };

    mockApiAdelaideService.createParametreEchantillon.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createParametreEchantillon).toHaveBeenCalled();
      expect(mockNotesService.show).not.toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error creating echantillon');
        }
      });
      done();
    }, 100);
  });

  it('should update existing echantillon successfully on save edition', (done) => {
    const existingEchantillon = {
      reference: 'ECH001',
      type: PARECH_TYPECH_LOT,
      nombreLots: 20,
      nombrePages: 10,
      random: false,
    };
    const editedRow = new Map([[0, existingEchantillon]]);
    const mockResponse = { data: { updateParametreEchantillon: { reference: 'ECH001' } } };

    mockApiAdelaideService.updateParametreEchantillon.and.returnValue(of(mockResponse) as any);

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateParametreEchantillon).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reference: 'ECH001',
          type: PARECH_TYPECH_LOT,
          nombreLots: 20,
          nombrePages: 10,
        })
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'L\'échantillon "ECH001" a été mis à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete single echantillon successfully', (done) => {
    const echantillonsToDelete = [{ reference: 'ECH001', type: 'LOT' }];
    const mockResponse = { data: { deleteEchantillons: true } };

    mockApiAdelaideService.deleteEchantillons.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((callback) => {
      callback({ data: { reference: 'ECH002' } });
      callback({ data: { reference: 'ECH003' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(echantillonsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteEchantillons).toHaveBeenCalledWith(['ECH001']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: echantillonsToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: "L'échantillon a été supprimé avec succès",
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete multiple echantillons successfully', (done) => {
    const echantillonsToDelete = [
      { reference: 'ECH001', type: 'LOT' },
      { reference: 'ECH002', type: 'PAGE' },
    ];
    const mockResponse = { data: { deleteEchantillons: true } };

    mockApiAdelaideService.deleteEchantillons.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((callback) => {
      callback({ data: { reference: 'ECH003' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(echantillonsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteEchantillons).toHaveBeenCalledWith(['ECH001', 'ECH002']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les échantillons ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should export data as PDF', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'reference', headerName: 'Référence' },
      { field: 'type', headerName: 'Type' },
    ];
    const mockData = [
      { reference: 'ECH001', type: 'LOT' },
      { reference: 'ECH002', type: 'PAGE' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['ECH001', 'LOT'], ['ECH002', 'PAGE']],
      ['Référence', 'Type'],
      'Liste des échantillons',
      { columnDefs: mockColumnDefs }
    );
  });

  it('should set error correctly in errors map', () => {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const error1: TableAsynchronousError = { isError: true, message: 'Error 1', id: null };
    const error2: TableAsynchronousError = { isError: true, message: 'Error 2', id: null };

    component.setError(1, error1, errors);
    expect(errors.get(1).length).toBe(1);
    expect(errors.get(1)[0].message).toBe('Error 1');

    component.setError(1, error2, errors);
    expect(errors.get(1).length).toBe(2);
    expect(errors.get(1)[1].message).toBe('Error 2');
  });
});
