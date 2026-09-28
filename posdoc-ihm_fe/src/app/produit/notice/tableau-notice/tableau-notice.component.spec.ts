import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableauNoticeService } from '../service/tableau-notice.service';
import { TableauNoticeComponent } from './tableau-notice.component';

describe('TableauNoticeComponent', () => {
  let component: TableauNoticeComponent;
  let fixture: ComponentFixture<TableauNoticeComponent>;
  let mockApiNoticeService: jasmine.SpyObj<ApiNoticesService>;
  let mockTableauNoticeService: jasmine.SpyObj<TableauNoticeService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockActNotResponse = {
    data: {
      allActiveNotices: [
        {
          codnot: 'NOT1',
          libnot: 'Nouvelle notice',
          fornot: 'A4',
          poinot: 15,
          pornot: 'L',
          notir: '2025-02-05',
          perime: 0,
          codsit: 'DEV',
        },
      ],
      allSitesCNP: [
        {
          code: 'cirtil',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockExpNotResponse = {
    data: {
      allExpiredNotices: [
        {
          codnot: 'NOT1',
          libnot: 'Nouvelle notice',
          fornot: 'A4',
          poinot: 15,
          pornot: 'L',
          notir: '2025-02-05',
          perime: 1,
          codsit: 'DEV',
          isNotAuthorisedToBeDeleted: false,
          pdfFilePath: '',
        },
      ],
      allSitesCNP: [
        {
          code: 'cirtil',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockDelNotResponse = {
    data: {
      deleteNotice: [
        {
          codnot: 'NOT1',
          libnot: 'Nouvelle notice',
          fornot: 'A4',
          poinot: 15,
          pornot: 'L',
          notir: '2025-02-05',
          perime: 0,
          codsit: 'DEV',
          isNotAuthorisedToBeDeleted: false,
          pdfFilePath: '',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiNoticeService = jasmine.createSpyObj('ApiNoticesService', [
      'getActiveNotices',
      'getExpiredNotices',
      'deleteNotice',
      'createNotice',
      'updateNotice',
    ]);
    mockTableauNoticeService = jasmine.createSpyObj('TableauNoticeService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
      'getNoticesUpdatedListener',
    ]);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockGridApi = jasmine.createSpyObj('GridApi', [
      'setGridOption',
      'forEachNode',
      'getColumnDefs',
      'forEachNodeAfterFilterAndSort',
      'applyTransaction',
      'redrawRows',
    ]);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    TestBed.configureTestingModule({
      declarations: [TableauNoticeComponent],
      providers: [
        {
          provide: ApiNoticesService,
          useValue: mockApiNoticeService,
        },
        {
          provide: TableauNoticeService,
          useValue: mockTableauNoticeService,
        },
        {
          provide: TableauConfigurationBuilderService,
          useValue: mockTableauConfigurationBuilderService,
        },
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockTableauNoticeService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockTableauNoticeService.getNoticesUpdatedListener.and.returnValue(of([{ codnot: 'codnot' }]));
    mockTableauNoticeService.getColumnDefs.and.returnValue([{ field: 'codsit', cellRendererParams: { selectData: null } }]);
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});

    fixture = TestBed.createComponent(TableauNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit and onGridReady validity', () => {
    component.isNoticesActives = false;
    mockApiNoticeService.getExpiredNotices.and.returnValue(of(mockExpNotResponse));
    component.ngOnInit();
    expect(component.addType).toBe(0);
    expect(component.columnDefs).toEqual([{ field: 'codsit', cellRendererParams: { selectData: component.siteData$ } }]);
    expect(component.overlayNoRowsTemplate).toBe('nodata');

    const mockGridReadyEvent = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;
    component.onGridReady(mockGridReadyEvent);
    expect(component.gridApi).toEqual(mockGridApi);
  });

  it('should populate active notices on successful API call', () => {
    mockApiNoticeService.getActiveNotices.and.returnValue(of(mockActNotResponse));
    component.isNoticesActives = true;
    component.ngOnInit();
    component.searchNotices();
    expect(mockApiNoticeService.getActiveNotices).toHaveBeenCalled();
    expect(component.noticesData.length).toBeGreaterThan(0);
    expect(component.totalNotices).toBe(component.noticesData.length);
  });

  it('should populate expired notices on successful API call', () => {
    mockApiNoticeService.getExpiredNotices.and.returnValue(of(mockExpNotResponse));
    component.isNoticesActives = false;
    component.searchNotices();
    expect(mockApiNoticeService.getExpiredNotices).toHaveBeenCalled();
    expect(component.noticesData.length).toBeGreaterThan(0);
    expect(component.totalNotices).toBe(component.noticesData.length);
  });

  it('onDeleteRow validity', () => {
    const mockDeletedRow = [{ codnot: 'aa' }];
    mockApiNoticeService.deleteNotice.and.returnValue(of(mockDelNotResponse));
    component.gridApi = mockGridApi;
    spyOn(SharedUtil, 'getNumberTotalRows');
    // delete successfully
    component.onDeleteRow(mockDeletedRow);
    expect(mockNotesService.show).toHaveBeenCalled();
    expect(SharedUtil.getNumberTotalRows).toHaveBeenCalledWith(component.gridApi);
    // delete with error
    spyOn(SharedUtil, 'setError');
    mockApiNoticeService.deleteNotice.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    component.onDeleteRow(mockDeletedRow);
    expect(SharedUtil.setError).toHaveBeenCalled();
  });

  it('onSaveEdition validity', () => {
    const mockCreatedRow = new Map([
      [
        1,
        {
          codnot: 'code',
          libnot: 'Nouvelle notice',
          fornot: 'A4',
          poinot: 15,
          pornot: 'L',
          notir: '2025-02-05',
          perime: 0,
          codsit: 'DEV',
          newRow: true,
        },
      ],
    ]);
    const mockResponse = {
      data: {
        createNotice: {
          codnot: 'NOT1',
          libnot: 'Nouvelle notice',
          fornot: 'A4',
          poinot: 15,
          pornot: 'L',
          notir: '2025-02-05',
          perime: 0,
          codsit: 'DEV',
          isNotAuthorisedToBeDeleted: false,
          pdfFilePath: '',
        },
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiNoticeService.createNotice.and.returnValue(of(mockResponse));
    component.gridApi = mockGridApi;
    spyOn(SharedUtil, 'getNumberTotalRows');
    // create successfully
    component.onSaveEdition(mockCreatedRow);
    expect(mockApiNoticeService.createNotice).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalled();
    expect(SharedUtil.getNumberTotalRows).toHaveBeenCalledWith(component.gridApi);
    // create with error
    spyOn(SharedUtil, 'setError');
    mockApiNoticeService.createNotice.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    component.onSaveEdition(mockCreatedRow);
    expect(mockApiNoticeService.createNotice).toHaveBeenCalled();
    expect(SharedUtil.setError).toHaveBeenCalled();
    // update successfully
    mockApiNoticeService.updateNotice.and.returnValue(of(mockResponse));
    const mockEditedRow = new Map([
      [1, { codnot: 'code', libnot: 'Nouvelle notice', fornot: 'A4', poinot: 15, pornot: 'L', notir: '2025-02-05', perime: 0, codsit: 'DEV' }],
    ]);
    spyOn(component, 'searchNotices');
    component.onSaveEdition(mockEditedRow);
    expect(mockApiNoticeService.updateNotice).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalled();
    expect(component.searchNotices).toHaveBeenCalled();
    // update with error
    mockApiNoticeService.updateNotice.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    component.onSaveEdition(mockEditedRow);
    expect(mockApiNoticeService.updateNotice).toHaveBeenCalled();
    expect(SharedUtil.setError).toHaveBeenCalled();
  });
});
