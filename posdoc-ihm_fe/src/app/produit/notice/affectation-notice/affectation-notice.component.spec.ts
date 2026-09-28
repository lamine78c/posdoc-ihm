import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableauAffectationNoticeService } from '../service/tableau-affectation-notice.service';
import { AffectationNoticeComponent } from './affectation-notice.component';
import { ModalAjoutComponent } from './modal/modal-ajout/modal-ajout.component';

describe('AffectationNoticeComponent', () => {
  let component: AffectationNoticeComponent;
  let fixture: ComponentFixture<AffectationNoticeComponent>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let apiNoticesServiceMock: jasmine.SpyObj<ApiNoticesService>;
  let noteServiceMock: jasmine.SpyObj<NotesService>;
  let tableauConfigurationBuilderServiceMock: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauAffectationNoticeServiceMock: jasmine.SpyObj<TableauAffectationNoticeService>;
  const gridApiMock = jasmine.createSpyObj('GridApi', [
    'addEventListener',
    'getSelectedNodes',
    'removeEventListener',
    'forEachNode',
    'setGridOption',
    'applyTransaction',
    'redrawRows',
    'refreshCells',
    'deselectAll',
  ]);

  beforeEach(async () => {
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);
    apiNoticesServiceMock = jasmine.createSpyObj('ApiNoticesService', ['findNotficByParam', 'deleteAffectationNotices', 'updateNofics']);
    tableauConfigurationBuilderServiceMock = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    tableauAffectationNoticeServiceMock = jasmine.createSpyObj('TableauAffectationNoticeService', [
      'getColumnDefs',
      'getColumnDefsPopupCreate',
      'getOverlayNoRowsTemplate',
    ]);
    noteServiceMock = jasmine.createSpyObj('NotesService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [AffectationNoticeComponent],
      providers: [
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceMock },
        { provide: TableauAffectationNoticeService, useValue: tableauAffectationNoticeServiceMock },
        { provide: ApiNoticesService, useValue: apiNoticesServiceMock },
        { provide: NotesService, useValue: noteServiceMock },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AffectationNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initMinEndDate validity', () => {
    component.form.get('dateFin').setValue({ year: '2026', month: '01', day: '10' });
    component.initMinEndDate();
    component.form.get('dateDeb').setValue({ year: '2026', month: '01', day: '11' });
    expect(component.form.get('dateFin').value).toEqual('');
  });

  it('onGridReady validity', () => {
    const mockGridReadyEvent = {
      api: gridApiMock,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.onGridReady(mockGridReadyEvent);
    expect(component.gridApi).toEqual(gridApiMock);
    expect(component.gridColumnApi).toEqual(gridApiMock);
    expect(gridApiMock.setGridOption).toHaveBeenCalled();
  });

  it('openAddPopup validity', () => {
    component.selectedNotice = 'aa';
    const fakeModalRef = {
      componentInstance: { messages: [], rowDataArray: [], firstButton: {}, secondButton: {}, title: '', selectedNotice: '', passEntry: of(2) },
      dismissed: of(111),
    } as any;
    modalServiceMock.open.and.returnValue(fakeModalRef);
    // without warning
    component.isSomeChangeNotSubmited = false;
    component.openAddPopup();
    expect(modalServiceMock.open).toHaveBeenCalledWith(ModalAjoutComponent, { windowClass: 'modal-affectation-notice', backdrop: 'static' });
    expect(fakeModalRef.componentInstance.title).toEqual('Affectation des fichiers à la notice aa');
    expect(fakeModalRef.componentInstance.selectedNotice).toEqual('aa');
    // with warning
    component.isSomeChangeNotSubmited = true;
    spyOn(component, 'resetChanges');
    component.openAddPopup();
    expect(component.resetChanges).toHaveBeenCalled();
  });

  it('resetChanges validity', () => {
    component.gridApi = gridApiMock;
    spyOn(component.form, 'reset');
    component.resetChanges();
    expect(component.notificToUpdate).toEqual([]);
    expect(component.isSomeChangeNotSubmited).toBeFalsy();
    expect(gridApiMock.refreshCells).toHaveBeenCalled();
    expect(gridApiMock.redrawRows).toHaveBeenCalled();
    expect(component.modifiedRows).toEqual(new Set());
    expect(component.form.reset).toHaveBeenCalled();
  });

  it('lister validity', () => {
    component.gridApi = gridApiMock;
    component.tableauComponent = jasmine.createSpyObj('TableauComponent', ['ngOnInit']);
    spyOn(component, 'resetChanges');
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    spyOn(SharedUtil, 'extractSelectedOrgs');
    const response = {
      data: {
        findNotficByParam: [
          {
            codenv: 'a',
            codorg: 'a',
            codapp: 'a',
            codcom: 'a',
            codfic: 'a',
            codeProd: 'a',
            refImprime: 'a',
            dnotid: '',
            dnotit: '',
            maxnot: 'a',
          },
        ],
      },
    } as any;
    apiNoticesServiceMock.findNotficByParam.and.returnValue(of(response));
    component.lister({ notice: 'aa' });
    expect(component.totalNotices).toEqual(1);
    expect(component.rowData).toEqual([
      {
        codenv: 'a',
        codorg: 'a',
        codapp: 'a',
        codcom: 'a',
        codfic: 'a',
        codeProd: 'a',
        refImprime: 'a',
        dnotid: '',
        dnotit: '',
        maxnot: 'a',
        codenv_codorg_codapp: 'a-a-a',
        codcom_codfic: 'a-a',
        codnot: 'aa',
      },
    ] as any);
  });

  it('onDeleteRow validity', () => {
    component.gridApi = gridApiMock;
    component.selectedNotice = 'aa';
    component.isSomeChangeNotSubmited = false;
    const response = {
      data: {
        deleteNotfics: 'ok',
      },
    } as any;
    apiNoticesServiceMock.deleteAffectationNotices.and.returnValue(of(response));
    spyOn(SharedUtil, 'getNumberTotalRows');
    spyOn(component, 'resetChanges');
    // delete successfully
    component.onDeleteRow([{ codenv: 'a', codorg: 'a', codapp: 'a', codcom: 'a', codfic: 'a' }]);
    expect(gridApiMock.applyTransaction).toHaveBeenCalled();
    expect(gridApiMock.redrawRows).toHaveBeenCalled();
    expect(noteServiceMock.show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      })
    );
    expect(component.resetChanges).toHaveBeenCalled();
    // with error
    apiNoticesServiceMock.deleteAffectationNotices.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    component.onDeleteRow([{ codenv: 'a', codorg: 'a', codapp: 'a', codcom: 'a', codfic: 'a' }]);
    expect(component.asynchronousErrors$.value).not.toBeNull();
  });

  it('updateDates validity', () => {
    component.gridApi = gridApiMock;
    component.selectedNotice = 'aa';
    component.form.get('dateDeb').setValue({ year: '2026', month: '01', day: '11' });
    component.form.get('dateFin').setValue({ year: '2026', month: '01', day: '13' });
    const notfic = {
      codenv: 'a',
      codorg: 'a',
      codapp: 'a',
      codcom: 'a',
      codfic: 'a',
      codnot: 'aa',
      dnotid: '2025-01-01',
      dnotit: '2025-01-10',
      maxnot: 'aaa',
    };
    component.notificToUpdate = [notfic];
    const notficToUpdate = [
      {
        codenv: 'a',
        codorg: 'a',
        codapp: 'a',
        codcom: 'a',
        codfic: 'a',
        codnot: 'aa',
        dnotid: '2026-01-11',
        dnotit: '2026-01-13',
        maxnot: 'aaa',
      },
    ];
    gridApiMock.getSelectedNodes.and.returnValue([
      {
        data: notfic,
        setDataValue: jasmine.createSpy('setDataValue'),
      },
    ]);
    component.updateDates();

    expect(gridApiMock.refreshCells).toHaveBeenCalled();
    expect(gridApiMock.redrawRows).toHaveBeenCalled();
    expect(gridApiMock.deselectAll).toHaveBeenCalled();
    expect(component.notificToUpdate).toEqual(notficToUpdate);
  });

  it('updateAffectationNotices validity', () => {
    component.gridApi = gridApiMock;
    component.isSomeChangeNotSubmited = false;
    const response = {
      data: {
        updateNotfics: [
          {
            codenv: 'a',
            codorg: 'a',
            codapp: 'a',
            codcom: 'a',
            codfic: 'a',
            codeProd: 'aa',
            refImprime: '',
            dnotid: '2025-01-01',
            dnotit: '2025-01-10',
            maxnot: 'aaa',
          },
        ],
      },
    } as any;
    apiNoticesServiceMock.updateNofics.and.returnValue(of(response));
    spyOn(SharedUtil, 'getNumberTotalRows');
    spyOn(component, 'resetChanges');
    // update successfully
    component.updateAffectationNotices();
    expect(noteServiceMock.show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      })
    );
    expect(component.resetChanges).toHaveBeenCalled();
    // with error
    apiNoticesServiceMock.updateNofics.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));
    component.updateAffectationNotices();
    expect(component.asynchronousErrors$.value).not.toBeNull();
  });

  it('isApplyButtonDisabled validity', () => {
    gridApiMock.getSelectedNodes.and.returnValue([]);
    const result = component.isApplyButtonDisabled();
    expect(result).toBeTruthy();
  });

  it('isValidateButtonDisabled validity', () => {
    component.notificToUpdate = [];
    const result = component.isValidateButtonDisabled();
    expect(result).toBeTruthy();
  });
});
