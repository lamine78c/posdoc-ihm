import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FaqComponent } from './faq.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauFaqService } from './service/tableau-faq.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { StatusColumnHandlerService } from '@app/admin/contenu/services/status-column-handler.service';
import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of } from 'rxjs';
import { Apollo } from 'apollo-angular';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauFaqService: jasmine.SpyObj<TableauFaqService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockApiAdelaideContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;
  let mockStatusColumnHandler: jasmine.SpyObj<StatusColumnHandlerService>;

  beforeEach(async () => {
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauFaqService = jasmine.createSpyObj('TableauFaqService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockApiAdelaideContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', [
      'getAllPathComplet',
      'searchAllFaq',
      'createFaq',
      'updateFaq',
      'deleteFaq',
      'updateFaqStatus',
    ]);
    mockStatusColumnHandler = jasmine.createSpyObj('StatusColumnHandlerService', ['setupStatusColumnHandler', 'changeStatus']);
    const apolloMock = {
      watchQuery: jasmine.createSpy('watchQuery').and.returnValue({
        valueChanges: of({ data: {}, loading: false }),
      }),
      query: jasmine.createSpy('query').and.returnValue(of({ data: {} })),
      mutate: jasmine.createSpy('mutate').and.returnValue(of({ data: {} })),
    };

    const mockGridOptions: GridOptions = {
      suppressCellFocus: true,
      context: {},
      getRowId: params => params.data.id,
    };

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions);
    mockTableauFaqService.getColumnDefs.and.returnValue([]);
    mockTableauFaqService.getOverlayNoRowsTemplate.and.returnValue('<span class="no-rows">Aucun résultat</span>');
    mockApiAdelaideContenuService.getAllPathComplet.and.returnValue(of({ data: { getAllPathComplet: [] }, loading: false, networkStatus: 7 } as any));
    mockApiAdelaideContenuService.searchAllFaq.and.returnValue(of({ data: { searchAllFaq: [] }, loading: false, networkStatus: 7 } as any));

    await TestBed.configureTestingModule({
      declarations: [FaqComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauFaqService, useValue: mockTableauFaqService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: ApiAdelaideContenuService, useValue: mockApiAdelaideContenuService },
        { provide: StatusColumnHandlerService, useValue: mockStatusColumnHandler },
        { provide: Apollo, useValue: apolloMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(false);
    expect(component.gridOptions).toBeDefined();
    expect(component.gridOptions.suppressCellFocus).toBe(true);
  });

  it('should load path labels on ngOnInit', () => {
    component.ngOnInit();

    expect(mockApiAdelaideContenuService.getAllPathComplet).toHaveBeenCalled();
  });

  it('should load column definitions on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauFaqService.getColumnDefs).toHaveBeenCalledWith(false);
    expect(component.columnDefs).toBeDefined();
  });

  it('should set gridApi and load FAQ data on grid ready', () => {
    const mockGridApi: any = { name: 'mockGridApi' };
    const mockEvent: Partial<GridReadyEvent> = {
      api: mockGridApi,
    };

    component.onGridReady(mockEvent as GridReadyEvent);

    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
    expect(mockApiAdelaideContenuService.searchAllFaq).toHaveBeenCalled();
  });

  it('should open modal when addRow is called', () => {
    const mockModalRef = {
      componentInstance: {},
      result: Promise.reject(),
    };
    mockModalService.open.and.returnValue(mockModalRef as any);

    component.addRow();

    expect(mockModalService.open).toHaveBeenCalled();
  });

  it('should open modal when edit is called', () => {
    const mockModalRef = {
      componentInstance: {},
      result: Promise.reject(),
    };
    mockModalService.open.and.returnValue(mockModalRef as any);
    component.rowData = [
      {
        id: 1,
        path: '/test',
        pathLabel: 'Test Page',
        pathOrder: 0,
        question: 'Test question?',
        answer: 'Test answer',
        status: 'enabled',
        viewCount: 10,
        createdBy: 'creator',
        createdAt: '2024-01-01T00:00:00Z',
        updatedBy: 'Test User',
        updatedAt: '2024-01-01T00:00:00Z',
        exchanges: [],
      },
    ];

    const mockParams = { data: { id: 1 } };
    component.edit(mockParams);

    expect(mockModalService.open).toHaveBeenCalled();
  });

  it('should call deleteFaq when onDeleteRows is called', () => {
    const mockGridApi: any = {
      applyTransaction: jasmine.createSpy('applyTransaction'),
      redrawRows: jasmine.createSpy('redrawRows'),
    };
    component.gridApi = mockGridApi;

    const mockFaqData = [
      {
        id: 1,
        path: '/test',
        pathLabel: 'Test Page',
        pathOrder: 0,
        question: 'Test question?',
        answer: 'Test answer',
        status: 'enabled' as const,
        viewCount: 10,
        createdBy: 'creator',
        createdAt: '2024-01-01T00:00:00Z',
        updatedBy: 'Test User',
        updatedAt: '2024-01-01T00:00:00Z',
        exchanges: [],
      },
    ];

    mockApiAdelaideContenuService.deleteFaq.and.returnValue(of({ data: { deleteFaq: true }, loading: false } as any));

    component.onDeleteRows(mockFaqData);

    expect(mockApiAdelaideContenuService.deleteFaq).toHaveBeenCalledWith(1);
  });

  it('should map FAQ data correctly with pathLabel and pathOrder', () => {
    const mockFaqResponse = {
      data: {
        searchAllFaq: [
          {
            id: 1,
            path: '/test',
            question: 'Test question?',
            answer: 'Test answer',
            status: 'ENABLED',
            viewCount: 10,
            createdBy: 'creator',
            updatedBy: 'Test User',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };

    component.pathLabels.set('/test', 'Test Page');
    component.pathOrder.set('/test', 5);
    mockApiAdelaideContenuService.searchAllFaq.and.returnValue(of(mockFaqResponse as any));

    component.onGridReady({ api: {} as any } as GridReadyEvent);

    expect(component.rowData.length).toBe(1);
    expect(component.rowData[0].pathLabel).toBe('Test Page');
    expect(component.rowData[0].pathOrder).toBe(5);
    expect(component.rowData[0].status).toBe('enabled');
  });

  it('should handle FAQ with null answer', () => {
    const mockFaqResponse = {
      data: {
        searchAllFaq: [
          {
            id: 1,
            path: '/test',
            question: 'Test question?',
            answer: null,
            status: 'DRAFT',
            viewCount: 0,
            createdBy: 'creator',
            updatedBy: 'Test User',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };

    mockApiAdelaideContenuService.searchAllFaq.and.returnValue(of(mockFaqResponse as any));

    component.onGridReady({ api: {} as any } as GridReadyEvent);

    const faqWithNullAnswer = component.rowData.find(faq => faq.answer === null);
    expect(faqWithNullAnswer).toBeDefined();
    expect(faqWithNullAnswer?.status).toBe('draft');
  });

  it('should reload FAQ data after successful edit', async () => {
    const mockModalRef = {
      componentInstance: {},
      result: Promise.resolve({
        path: '/test',
        question: 'Updated question',
        answer: 'Updated answer',
      }),
    };
    mockModalService.open.and.returnValue(mockModalRef as any);
    mockApiAdelaideContenuService.updateFaq.and.returnValue(of({ data: { updateFaq: [] }, loading: false } as any));

    component.rowData = [
      {
        id: 1,
        path: '/test',
        pathLabel: 'Test Page',
        pathOrder: 0,
        question: 'Test question?',
        answer: 'Test answer',
        status: 'enabled',
        viewCount: 10,
        createdBy: 'creator',
        createdAt: '2024-01-01T00:00:00Z',
        updatedBy: 'Test User',
        updatedAt: '2024-01-01T00:00:00Z',
        exchanges: [],
      },
    ];

    const mockParams = { data: { id: 1 } };
    component.edit(mockParams);

    // Wait for promise to resolve
    await mockModalRef.result;

    // searchAllFaq should be called twice: once in edit (then), and it was called before
    expect(mockApiAdelaideContenuService.searchAllFaq).toHaveBeenCalled();
  });
});
