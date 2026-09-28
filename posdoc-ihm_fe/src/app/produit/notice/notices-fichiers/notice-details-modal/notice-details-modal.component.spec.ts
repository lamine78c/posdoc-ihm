import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { GridReadyEvent } from 'ag-grid-community';

import { NoticeDetailsModalComponent } from './notice-details-modal.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { TableauNoticeDetailsService } from '../../service/tableau-notice-details.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { NoticeDetail } from '../model/notice-detail';

describe('NoticeDetailsModalComponent', () => {
  let component: NoticeDetailsModalComponent;
  let fixture: ComponentFixture<NoticeDetailsModalComponent>;
  let tableauConfigurationBuilderServiceMock: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let apiNoticesServiceMock: jasmine.SpyObj<ApiNoticesService>;
  let tableauNoticeDetailsServiceMock: jasmine.SpyObj<TableauNoticeDetailsService>;
  let notesServiceMock: jasmine.SpyObj<NotesService>;
  let activeModalMock: jasmine.SpyObj<NgbActiveModal>;
  const gridApiMock = jasmine.createSpyObj('GridApi', ['setGridOption']);

  beforeEach(async () => {
    tableauConfigurationBuilderServiceMock = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    apiNoticesServiceMock = jasmine.createSpyObj('ApiNoticesService', ['findNoticeDetailsByFichier']);
    tableauNoticeDetailsServiceMock = jasmine.createSpyObj('TableauNoticeDetailsService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    notesServiceMock = jasmine.createSpyObj('NotesService', ['show']);
    activeModalMock = jasmine.createSpyObj('NgbActiveModal', ['close']);

    tableauConfigurationBuilderServiceMock.createGridConfiguration.and.returnValue({});
    tableauNoticeDetailsServiceMock.getColumnDefs.and.returnValue([]);
    tableauNoticeDetailsServiceMock.getOverlayNoRowsTemplate.and.returnValue('<span class="no-rows">Test</span>');

    await TestBed.configureTestingModule({
      declarations: [NoticeDetailsModalComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceMock },
        { provide: ApiNoticesService, useValue: apiNoticesServiceMock },
        { provide: TableauNoticeDetailsService, useValue: tableauNoticeDetailsServiceMock },
        { provide: NotesService, useValue: notesServiceMock },
        { provide: NgbActiveModal, useValue: activeModalMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeDetailsModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should initialize grid configuration and load notice details', () => {
    const mockNoticeDetails: NoticeDetail[] = [
      {
        codeNotice: 'NOT1',
        format: 'A4',
        poids: 50,
        portee: 'Nationale',
        dateDebut: '2025-01-01',
        dateFin: '2025-12-31',
      },
      {
        codeNotice: 'NOT2',
        format: 'A5',
        poids: 30,
        portee: 'Locale',
        dateDebut: '2025-02-01',
        dateFin: '2025-11-30',
      },
    ];

    apiNoticesServiceMock.findNoticeDetailsByFichier.and.returnValue(
      of({
        data: {
          findNoticeDetailsByFichier: mockNoticeDetails,
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    component.codenv = 'DEV';
    component.codorg = 'ORG1';
    component.codapp = 'APP1';
    component.codcom = 'CMD1';
    component.codfic = 'FIC1';

    component.ngOnInit();

    expect(tableauConfigurationBuilderServiceMock.createGridConfiguration).toHaveBeenCalledWith(false);
    expect(component.gridOptions).toBeDefined();
    expect(tableauNoticeDetailsServiceMock.getColumnDefs).toHaveBeenCalled();
    expect(component.columnDefs).toBeDefined();
    expect(tableauNoticeDetailsServiceMock.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.overlayNoRowsTemplate).toBe('<span class="no-rows">Test</span>');
  });

  it('loadNoticeDetails should populate noticeDetails with data', (done) => {
    const mockNoticeDetails: NoticeDetail[] = [
      {
        codeNotice: 'NOT1',
        format: 'A4',
        poids: 50,
        portee: 'Nationale',
        dateDebut: '2025-01-01',
        dateFin: '2025-12-31',
      },
    ];

    apiNoticesServiceMock.findNoticeDetailsByFichier.and.returnValue(
      of({
        data: {
          findNoticeDetailsByFichier: mockNoticeDetails,
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    component.codenv = 'DEV';
    component.codorg = 'ORG1';
    component.codapp = 'APP1';
    component.codcom = 'CMD1';
    component.codfic = 'FIC1';
    component.gridApi = gridApiMock;

    component.loadNoticeDetails();

    setTimeout(() => {
      expect(apiNoticesServiceMock.findNoticeDetailsByFichier).toHaveBeenCalledWith({
        codenv: 'DEV',
        codorg: 'ORG1',
        codapp: 'APP1',
        codcom: 'CMD1',
        codfic: 'FIC1',
      });
      expect(component.noticeDetails).toEqual(mockNoticeDetails);
      expect(component.totalNotices).toBe(1);
      expect(component.isLoading).toBe(false);
      expect(gridApiMock.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    });
  });

  it('loadNoticeDetails should handle empty data', (done) => {
    apiNoticesServiceMock.findNoticeDetailsByFichier.and.returnValue(
      of({
        data: {
          findNoticeDetailsByFichier: [],
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    component.codenv = 'DEV';
    component.codorg = 'ORG1';
    component.codapp = 'APP1';
    component.codcom = 'CMD1';
    component.codfic = 'FIC1';

    component.loadNoticeDetails();

    setTimeout(() => {
      expect(component.noticeDetails).toEqual([]);
      expect(component.totalNotices).toBe(0);
      expect(component.isLoading).toBe(false);
      done();
    });
  });

  it('loadNoticeDetails should handle error and close modal', (done) => {
    const error = { message: 'Erreur de chargement' };

    apiNoticesServiceMock.findNoticeDetailsByFichier.and.returnValue(throwError(() => error));

    component.codenv = 'DEV';
    component.codorg = 'ORG1';
    component.codapp = 'APP1';
    component.codcom = 'CMD1';
    component.codfic = 'FIC1';
    component.gridApi = gridApiMock;

    spyOn(console, 'error');

    component.loadNoticeDetails();

    setTimeout(() => {
      expect(console.error).toHaveBeenCalledWith('Erreur lors de la récupération des détails des notices', error);
      expect(component.isLoading).toBe(false);
      expect(gridApiMock.setGridOption).toHaveBeenCalledWith('loading', false);
      expect(activeModalMock.close).toHaveBeenCalled();
      expect(notesServiceMock.show).toHaveBeenCalledWith({
        title: 'Erreur de chargement',
        classname: 'note-erreur',
        category: ToastCategoryEnum.ERROR,
      });
      done();
    });
  });

  it('onGridReady should set grid api and column api', () => {
    const mockGridReadyEvent = {
      api: gridApiMock,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.isLoading = true;
    component.onGridReady(mockGridReadyEvent);

    expect(component.gridApi).toEqual(gridApiMock);
    expect(component.gridColumnApi).toEqual(gridApiMock);
    expect(gridApiMock.setGridOption).toHaveBeenCalledWith('loading', true);
  });

  it('onGridReady should set loading to false when not loading', () => {
    const mockGridReadyEvent = {
      api: gridApiMock,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.isLoading = false;
    component.onGridReady(mockGridReadyEvent);

    expect(gridApiMock.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('close should call activeModal close', () => {
    component.close();
    expect(activeModalMock.close).toHaveBeenCalled();
  });
});
