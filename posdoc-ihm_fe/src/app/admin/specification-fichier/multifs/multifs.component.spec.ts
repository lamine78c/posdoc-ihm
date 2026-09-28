import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultifsComponent } from './multifs.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauMultifService } from './service/tableau-multif.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideMultifService } from '@app/services/api-adelaide-multif.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';

describe('MultifsComponent', () => {
  let component: MultifsComponent;
  let fixture: ComponentFixture<MultifsComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauMultifService: jasmine.SpyObj<TableauMultifService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideMultifService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockMultifsData = {
    data: {
      allMultifs: [
        { code: 'R', libelle: 'Recto' },
        { code: 'V', libelle: 'Verso' },
        { code: 'RV', libelle: 'Recto Verso' },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauMultifService = jasmine.createSpyObj('TableauMultifService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideMultifService', [
      'getAllMultifs',
      'createMultif',
      'updateMultif',
      'deleteMultifs',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({} as GridOptions);
    mockTableauMultifService.getColumnDefs.and.returnValue([]);
    mockTableauMultifService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getAllMultifs.and.returnValue(of(mockMultifsData) as any);
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [MultifsComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauMultifService, useValue: mockTableauMultifService },
        { provide: ApiAdelaideMultifService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    if (mockNotesService?.show) {
      mockNotesService.show.calls.reset();
    }
    if (mockApiAdelaideService?.getAllMultifs) {
      mockApiAdelaideService.getAllMultifs.calls.reset();
    }
    if (mockApiAdelaideService?.createMultif) {
      mockApiAdelaideService.createMultif.calls.reset();
    }
    if (mockApiAdelaideService?.updateMultif) {
      mockApiAdelaideService.updateMultif.calls.reset();
    }
    if (mockApiAdelaideService?.deleteMultifs) {
      mockApiAdelaideService.deleteMultifs.calls.reset();
    }

    fixture = TestBed.createComponent(MultifsComponent);
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
    expect(mockTableauMultifService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauMultifService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should load multifs data on grid ready', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    expect(mockApiAdelaideService.getAllMultifs).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
  });

  it('should set rowData and nombreTotal after loading multifs', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(component.rowData).toEqual(mockMultifsData.data.allMultifs);
      expect(component.nombreTotal).toBe(3);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    }, 100);
  });

  it('should create new multif successfully on save edition', (done) => {
    const newMultif = { code: 'DUP', libelle: 'Duplex', newRow: true };
    const editedRow = new Map([[0, newMultif]]);
    const mockResponse = { data: { createMultif: { code: 'DUP' } } };

    mockApiAdelaideService.createMultif.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.callFake((_callback) => {
      // Simulate no nodes with newRow property
    });

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createMultif).toHaveBeenCalledWith(
        jasmine.objectContaining({ code: 'DUP', libelle: 'Duplex' })
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le multif "DUP" a été créé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when creating multif fails', (done) => {
    const newMultif = { code: 'ERR', libelle: 'Error multif', newRow: true };
    const editedRow = new Map([[0, newMultif]]);
    const mockError = { graphQLErrors: [{ message: 'Error creating multif' }] };

    mockApiAdelaideService.createMultif.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createMultif).toHaveBeenCalled();
      expect(mockNotesService.show).not.toHaveBeenCalled();
      expect(newMultif.newRow).toBe(true);
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error creating multif');
        }
      });
      done();
    }, 100);
  });

  it('should update existing multif successfully on save edition', (done) => {
    const existingMultif = { code: 'R', libelle: 'Updated Recto' };
    const editedRow = new Map([[0, existingMultif]]);
    const mockResponse = { data: { updateMultif: { code: 'R' } } };

    mockApiAdelaideService.updateMultif.and.returnValue(of(mockResponse));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateMultif).toHaveBeenCalledWith(
        jasmine.objectContaining(existingMultif)
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le multif "R" a été mis à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when updating multif fails', (done) => {
    const existingMultif = { code: 'R', libelle: 'Updated Recto' };
    const editedRow = new Map([[0, existingMultif]]);
    const mockError = { graphQLErrors: [{ message: 'Error updating multif' }] };

    mockApiAdelaideService.updateMultif.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateMultif).toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error updating multif');
        }
      });
      done();
    }, 100);
  });

  it('should delete single multif successfully', (done) => {
    const multifsToDelete = [{ code: 'R', libelle: 'Recto' }];
    const mockResponse = { data: { deleteMultifs: true } };

    mockApiAdelaideService.deleteMultifs.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((_callback) => {
      _callback({ data: { code: 'V' } });
      _callback({ data: { code: 'RV' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(multifsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteMultifs).toHaveBeenCalledWith(['R']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: multifsToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le multi feuillet a été supprimé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete multiple multifs successfully', (done) => {
    const multifsToDelete = [
      { code: 'R', libelle: 'Recto' },
      { code: 'V', libelle: 'Verso' },
    ];
    const mockResponse = { data: { deleteMultifs: true } };

    mockApiAdelaideService.deleteMultifs.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((_callback) => {
      _callback({ data: { code: 'RV' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(multifsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteMultifs).toHaveBeenCalledWith(['R', 'V']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les multis feuillet ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when deleting multif fails', (done) => {
    const multifsToDelete = [{ code: 'R', libelle: 'Recto' }];
    const mockError = { graphQLErrors: [{ message: 'Error deleting multif' }] };

    mockApiAdelaideService.deleteMultifs.and.returnValue(throwError(mockError));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    component.gridApi = mockGridApi;

    component.onDeleteRow(multifsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteMultifs).toHaveBeenCalled();
      expect(mockGridApi.applyTransaction).not.toHaveBeenCalled();
      done();
    }, 100);
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

  it('should export data as PDF', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'code', headerName: 'Multi feuillet' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { code: 'R', libelle: 'Recto' },
      { code: 'V', libelle: 'Verso' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['R', 'Recto'], ['V', 'Verso']],
      ['Multi feuillet', 'Libellé'],
      'Liste des Multi feuillets'
    );
  });

  it('should export data as Excel', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'code', headerName: 'Multi feuillet' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { code: 'R', libelle: 'Recto' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsExcel' });

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['R', 'Recto']],
      ['Multi feuillet', 'Libellé'],
      'Liste des Multi feuillets'
    );
  });

  it('should have correct permission properties', () => {
    expect(component.canAddPermPosition).toBeDefined();
    expect(component.canRemovePermPosition).toBeDefined();
  });
});

