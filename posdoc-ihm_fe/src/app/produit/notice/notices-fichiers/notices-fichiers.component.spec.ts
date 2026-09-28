import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { TableauNoticesFichiersService } from '../service/tableau-notices-fichiers.service';
import { NoticesFichiersComponent } from './notices-fichiers.component';
import { NoticesFichiersInterface } from './model/notices-fichiers-interface';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

describe('NoticesFichiersComponent', () => {
  let component: NoticesFichiersComponent;
  let fixture: ComponentFixture<NoticesFichiersComponent>;
  let tableauConfigurationBuilderServiceMock: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauNoticesFichiersServiceMock: jasmine.SpyObj<TableauNoticesFichiersService>;
  let apiNoticesServiceMock: jasmine.SpyObj<ApiNoticesService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  const gridApiMock = jasmine.createSpyObj('GridApi', ['setGridOption', 'forEachNode']);

  beforeEach(async () => {
    tableauConfigurationBuilderServiceMock = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    tableauNoticesFichiersServiceMock = jasmine.createSpyObj('TableauNoticesFichiersService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    apiNoticesServiceMock = jasmine.createSpyObj('ApiNoticesService', ['findNoticesFichiers']);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);

    tableauConfigurationBuilderServiceMock.createGridConfiguration.and.returnValue({});
    tableauNoticesFichiersServiceMock.getColumnDefs.and.returnValue([]);
    tableauNoticesFichiersServiceMock.getOverlayNoRowsTemplate.and.returnValue('<span class="no-rows">Test</span>');
    apiNoticesServiceMock.findNoticesFichiers.and.returnValue(
      of({
        data: {
          findNoticesFichiers: [
            {
              codenv: 'DEV',
              codorg: 'ORG1',
              codapp: 'APP1',
              codcom: 'CMD1',
              codfic: 'FIC1',
              codeProd: 'PROD1',
              refImprime: 'REF1',
              notices: ['NOT1', 'NOT2'],
            },
          ],
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [NoticesFichiersComponent],
      providers: [
        FormBuilder,
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceMock },
        { provide: TableauNoticesFichiersService, useValue: tableauNoticesFichiersServiceMock },
        { provide: ApiNoticesService, useValue: apiNoticesServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticesFichiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.form).toBeDefined();
  });

  it('should initialize grid options with configuration builder service and onCellClicked handler', () => {
    expect(tableauConfigurationBuilderServiceMock.createGridConfiguration).toHaveBeenCalledWith(false);
    expect(component.gridOptions).toBeDefined();
    expect(component.gridOptions.onCellClicked).toBeDefined();
  });

  it('should initialize column definitions from service', () => {
    expect(tableauNoticesFichiersServiceMock.getColumnDefs).toHaveBeenCalled();
    expect(component.columnDefs).toBeDefined();
  });

  it('should initialize overlay template from service', () => {
    expect(tableauNoticesFichiersServiceMock.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.overlayNoRowsTemplate).toBe('<span class="no-rows">Test</span>');
  });

  it('onGridReady should set grid api and column api', () => {
    const mockGridReadyEvent = {
      api: gridApiMock,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.onGridReady(mockGridReadyEvent);

    expect(component.gridApi).toEqual(gridApiMock);
    expect(component.gridColumnApi).toEqual(gridApiMock);
    expect(gridApiMock.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('lister should populate rowData with mock data and transform notices', done => {
    const event = {
      environnement: 'DEV',
      organisme: { ORG1: true },
      application: 'APP1',
    };

    component.gridApi = gridApiMock;
    component.lister(event);

    setTimeout(() => {
      expect(component.rowData).toBeDefined();
      expect(component.rowData.length).toBeGreaterThan(0);
      expect(component.totalNotices).toBeGreaterThan(0);
      expect(component.rowData[0].codenv_codorg_codapp).toBe('DEV-ORG1-APP1');
      expect(component.rowData[0].codcom_codfic).toBe('CMD1-FIC1');
      expect(component.rowData[0].noticesString).toBe('NOT1, NOT2');
      expect(gridApiMock.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    });
  });

  it('lister should set correct total notices count', done => {
    const event = {
      [component.formName.ORGANISME]: {},
    };
    component.gridApi = gridApiMock;
    component.lister(event);

    setTimeout(() => {
      expect(component.totalNotices).toBe(component.rowData.length);
      done();
    });
  });

  it('getQuerySearchFromEvent should build search query correctly', () => {
    const event = {
      [component.formName.ENVIRONNEMENT]: 'PROD',
      [component.formName.ORGANISME]: { ORG1: { code: 'ORG1' } },
      [component.formName.APPLICATION]: 'APP2',
      [component.formName.COMMANDE]: '%CMD%',
      [component.formName.FICHIER]: 'FIC',
      [component.formName.REFIMPRIME]: '%IMP%',
    };

    const query = component.getQuerySearchFromEvent(event);

    expect(query.codenv).toBe('PROD');
    expect(query.codapp).toBe('APP2');
    expect(query.codcom).toBe('%CMD%');
    expect(query.codfic).toBe('FIC');
    expect(query.refimp).toBe('%IMP%');
  });

  it('onCellClicked should open modal when clicking on codcom_codfic column', () => {
    const mockRowData: NoticesFichiersInterface = {
      codenv: 'DEV',
      codorg: 'ORG1',
      codapp: 'APP1',
      codcom: 'CMD1',
      codfic: 'FIC1',
      codeProd: 'PROD1',
      refImprime: 'REF1',
      notices: ['NOT1', 'NOT2'],
      codenv_codorg_codapp: 'DEV-ORG1-APP1',
      codcom_codfic: 'CMD1-FIC1',
      noticesString: 'NOT1, NOT2',
    };

    const mockCellClickedEvent = {
      column: {
        getColId: () => 'codcom_codfic',
      },
      data: mockRowData,
    } as unknown as CellClickedEvent;

    const mockModalRef = {
      componentInstance: {},
    };
    modalServiceMock.open.and.returnValue(mockModalRef as any);

    component.onCellClicked(mockCellClickedEvent);

    expect(modalServiceMock.open).toHaveBeenCalled();
    expect(mockModalRef.componentInstance['modalRef']).toBe(mockModalRef);
    expect(mockModalRef.componentInstance['codenv']).toBe('DEV');
    expect(mockModalRef.componentInstance['codorg']).toBe('ORG1');
    expect(mockModalRef.componentInstance['codapp']).toBe('APP1');
    expect(mockModalRef.componentInstance['codcom']).toBe('CMD1');
    expect(mockModalRef.componentInstance['codfic']).toBe('FIC1');
    expect(mockModalRef.componentInstance['fichierLabel']).toBe('CMD1-FIC1');
  });

  it('onCellClicked should not open modal when clicking on other columns', () => {
    const mockCellClickedEvent = {
      column: {
        getColId: () => 'codeProd',
      },
      data: {},
    } as unknown as CellClickedEvent;

    component.onCellClicked(mockCellClickedEvent);

    expect(modalServiceMock.open).not.toHaveBeenCalled();
  });

  it('openNoticeDetailsModal should configure modal correctly', () => {
    const mockRowData: NoticesFichiersInterface = {
      codenv: 'PROD',
      codorg: 'ORG2',
      codapp: 'APP2',
      codcom: 'CMD2',
      codfic: 'FIC2',
      codeProd: 'PROD2',
      refImprime: 'REF2',
      notices: ['NOT3'],
      codenv_codorg_codapp: 'PROD-ORG2-APP2',
      codcom_codfic: 'CMD2-FIC2',
      noticesString: 'NOT3',
    };

    const mockModalRef = {
      componentInstance: {},
    };
    modalServiceMock.open.and.returnValue(mockModalRef as any);

    component.openNoticeDetailsModal(mockRowData);

    expect(modalServiceMock.open).toHaveBeenCalledWith(jasmine.anything(), {
      size: 'xl',
      backdrop: 'static',
      windowClass: 'notice-details-modal',
    });
  });
});
