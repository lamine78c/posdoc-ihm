import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormatsComponent } from './formats.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauFormatService } from './service/tableau-format.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideFormatService } from '@app/services/api-adelaide-format.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';

describe('FormatsComponent', () => {
  let component: FormatsComponent;
  let fixture: ComponentFixture<FormatsComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauFormatService: jasmine.SpyObj<TableauFormatService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideFormatService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockFormatsData = {
    data: {
      allFormats: [
        { code: 'A4', libelle: 'Format A4' },
        { code: 'A5', libelle: 'Format A5' },
        { code: 'LETTER', libelle: 'Format Letter' },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauFormatService = jasmine.createSpyObj('TableauFormatService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideFormatService', [
      'getFormats',
      'createFormat',
      'updateFormat',
      'deleteFormats',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({} as GridOptions);
    mockTableauFormatService.getColumnDefs.and.returnValue([]);
    mockTableauFormatService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getFormats.and.returnValue(of(mockFormatsData) as any);
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [FormatsComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauFormatService, useValue: mockTableauFormatService },
        { provide: ApiAdelaideFormatService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    if (mockNotesService?.show) {
      mockNotesService.show.calls.reset();
    }
    if (mockApiAdelaideService?.getFormats) {
      mockApiAdelaideService.getFormats.calls.reset();
    }
    if (mockApiAdelaideService?.createFormat) {
      mockApiAdelaideService.createFormat.calls.reset();
    }
    if (mockApiAdelaideService?.updateFormat) {
      mockApiAdelaideService.updateFormat.calls.reset();
    }
    if (mockApiAdelaideService?.deleteFormats) {
      mockApiAdelaideService.deleteFormats.calls.reset();
    }

    fixture = TestBed.createComponent(FormatsComponent);
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
    expect(mockTableauFormatService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauFormatService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should load formats data on grid ready', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    expect(mockApiAdelaideService.getFormats).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
  });

  it('should set rowData and nombreTotal after loading formats', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(component.rowData).toEqual(mockFormatsData.data.allFormats);
      expect(component.nombreTotal).toBe(3);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    }, 100);
  });

  it('should create new format successfully on save edition', (done) => {
    const newFormat = { code: 'A3', libelle: 'Format A3', newRow: true };
    const editedRow = new Map([[0, newFormat]]);
    const mockResponse = { data: { createFormat: { code: 'A3' } } };

    mockApiAdelaideService.createFormat.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.callFake((callback) => {
      // Simulate no nodes with newRow property
    });

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createFormat).toHaveBeenCalledWith(
        jasmine.objectContaining({ code: 'A3', libelle: 'Format A3' })
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le format "A3" a été créé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when creating format fails', (done) => {
    const newFormat = { code: 'ERR', libelle: 'Error format', newRow: true };
    const editedRow = new Map([[0, newFormat]]);
    const mockError = { graphQLErrors: [{ message: 'Error creating format' }] };

    mockApiAdelaideService.createFormat.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createFormat).toHaveBeenCalled();
      expect(mockNotesService.show).not.toHaveBeenCalled();
      expect(newFormat.newRow).toBe(true);
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error creating format');
        }
      });
      done();
    }, 100);
  });

  it('should update existing format successfully on save edition', (done) => {
    const existingFormat = { code: 'A4', libelle: 'Updated A4' };
    const editedRow = new Map([[0, existingFormat]]);
    const mockResponse = { data: { updateFormat: { code: 'A4' } } };

    mockApiAdelaideService.updateFormat.and.returnValue(of(mockResponse));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateFormat).toHaveBeenCalledWith(
        jasmine.objectContaining(existingFormat)
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le format "A4" a été mis à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when updating format fails', (done) => {
    const existingFormat = { code: 'A4', libelle: 'Updated A4' };
    const editedRow = new Map([[0, existingFormat]]);
    const mockError = { graphQLErrors: [{ message: 'Error updating format' }] };

    mockApiAdelaideService.updateFormat.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateFormat).toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error updating format');
        }
      });
      done();
    }, 100);
  });

  it('should delete single format successfully', (done) => {
    const formatsToDelete = [{ code: 'A4', libelle: 'Format A4' }];
    const mockResponse = { data: { deleteFormats: true } };

    mockApiAdelaideService.deleteFormats.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((callback) => {
      callback({ data: { code: 'A5' } });
      callback({ data: { code: 'LETTER' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(formatsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteFormats).toHaveBeenCalledWith(['A4']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: formatsToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le format a été supprimé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete multiple formats successfully', (done) => {
    const formatsToDelete = [
      { code: 'A4', libelle: 'Format A4' },
      { code: 'A5', libelle: 'Format A5' },
    ];
    const mockResponse = { data: { deleteFormats: true } };

    mockApiAdelaideService.deleteFormats.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((callback) => {
      callback({ data: { code: 'LETTER' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(formatsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteFormats).toHaveBeenCalledWith(['A4', 'A5']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les formats ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when deleting format fails', (done) => {
    const formatsToDelete = [{ code: 'A4', libelle: 'Format A4' }];
    const mockError = { graphQLErrors: [{ message: 'Error deleting format' }] };

    mockApiAdelaideService.deleteFormats.and.returnValue(throwError(mockError));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    component.gridApi = mockGridApi;

    component.onDeleteRow(formatsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteFormats).toHaveBeenCalled();
      expect(mockGridApi.applyTransaction).not.toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
        }
      });
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
      { field: 'code', headerName: 'Format' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { code: 'A4', libelle: 'Format A4' },
      { code: 'A5', libelle: 'Format A5' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['A4', 'Format A4'], ['A5', 'Format A5']],
      ['Format', 'Libellé'],
      'Liste des formats'
    );
  });

  it('should export data as Excel', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'code', headerName: 'Format' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { code: 'A4', libelle: 'Format A4' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsExcel' });

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['A4', 'Format A4']],
      ['Format', 'Libellé'],
      'Liste des formats'
    );
  });

  it('should have correct permission properties', () => {
    expect(component.canAddPermPosition).toBeDefined();
    expect(component.canRemovePermPosition).toBeDefined();
  });
});

