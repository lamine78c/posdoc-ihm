import { DatePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Apollo } from 'apollo-angular';

import { PopupErreurComponent } from '@app/admin/popup/popup-erreur/popup-erreur.component';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauAffectationNoticeService } from '@app/produit/notice/service/tableau-affectation-notice.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { PermissionService } from '@app/services/permission/permission.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { GridReadyEvent } from 'ag-grid-community';
import { of } from 'rxjs';
import { ModalAjoutComponent } from './modal-ajout.component';

describe('ModalAjoutComponent', () => {
  let component: ModalAjoutComponent;
  let fixture: ComponentFixture<ModalAjoutComponent>;
  let noteServiceMock: jasmine.SpyObj<NotesService>;
  let permissionServiceMock: jasmine.SpyObj<PermissionService>;
  let apiNoticesServiceMock: jasmine.SpyObj<ApiNoticesService>;
  let tableauConfigurationBuilderServiceMock: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauAffectationNoticeServiceMock: jasmine.SpyObj<TableauAffectationNoticeService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let activeModalMock: jasmine.SpyObj<NgbActiveModal>;
  const gridApiMock = jasmine.createSpyObj('GridApi', ['addEventListener', 'getSelectedNodes', 'removeEventListener', 'forEachNode']);

  beforeEach(waitForAsync(() => {
    noteServiceMock = jasmine.createSpyObj('NotesService', ['show']);
    permissionServiceMock = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    apiNoticesServiceMock = jasmine.createSpyObj('ApiNoticesService', ['findFichiersForAffectationNotice', 'AffectationNotices']);
    tableauConfigurationBuilderServiceMock = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    tableauAffectationNoticeServiceMock = jasmine.createSpyObj('TableauAffectationNoticeService', [
      'getColumnDefs',
      'getColumnDefsPopupCreate',
      'getOverlayNoRowsTemplate',
    ]);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);
    activeModalMock = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [ModalAjoutComponent],
      providers: [
        FormBuilder,
        Apollo,
        DatePipe,
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceMock },
        { provide: TableauAffectationNoticeService, useValue: tableauAffectationNoticeServiceMock },
        { provide: ApiNoticesService, useValue: apiNoticesServiceMock },
        { provide: NotesService, useValue: noteServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: NgbActiveModal, useValue: activeModalMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    tableauConfigurationBuilderServiceMock.createGridConfiguration.and.returnValue({});
    tableauAffectationNoticeServiceMock.getColumnDefs.and.returnValue([]);
    tableauAffectationNoticeServiceMock.getColumnDefsPopupCreate.and.returnValue([]);
    tableauAffectationNoticeServiceMock.getOverlayNoRowsTemplate.and.returnValue('<span>No data</span>');

    fixture = TestBed.createComponent(ModalAjoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit validity', () => {
    component.ngOnInit();
    expect(component.gridOptions).toEqual({});
    expect(component.columnDefs).toEqual([]);
    expect(component.overlayNoRowsTemplate).toEqual('<span>No data</span>');
  });

  it('ngOnDestroy validity', () => {
    component.gridApi = gridApiMock;
    component.ngOnDestroy();
    expect(component.gridApi.removeEventListener).toHaveBeenCalled();
  });

  it('isValid validity', () => {
    component.notificToCreate = [{}, {}] as any;
    const result = component.isValid();
    expect(result).toBeTruthy();
  });

  it('isApply validity', () => {
    component.gridApi = gridApiMock;
    gridApiMock.getSelectedNodes.and.returnValue([
      {
        data: { dnotid: '', dnotit: '', isAuthorisedToReset: false },
      },
    ]);
    const result = component.isApply();
    expect(component.gridApi.getSelectedNodes).toHaveBeenCalled();
    expect(result).toBeTruthy();
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
    expect(gridApiMock.addEventListener).toHaveBeenCalled();
  });

  it('lister validity', () => {
    const responseMock = {
      data: {
        findFichiersForAffectationNotice: [
          {
            codenv: 'd',
            codorg: '1',
            codapp: 's',
            codcom: 'c',
            codfic: 'f',
            codeProd: '',
            refImprime: '',
            dnotid: '',
            dnotit: '',
            maxnot: '',
          },
          {
            codenv: 'd',
            codorg: '2',
            codapp: 'a',
            codcom: 'cc',
            codfic: 'ff',
            codeProd: '',
            refImprime: '',
            dnotid: '',
            dnotit: '',
            maxnot: '',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    const event = {};
    apiNoticesServiceMock.findFichiersForAffectationNotice.and.returnValue(of(responseMock as any));
    spyOn(SharedUtil, 'extractSelectedOrgs');
    spyOn(component, 'resetChanges');
    component.lister(event);

    expect(component.totalNotices).toBe(responseMock.data.findFichiersForAffectationNotice.length);
    expect(component.resetChanges).toHaveBeenCalled();
  });

  it('resetChanges validity', () => {
    spyOn(component.form, 'reset');
    component.resetChanges();
    expect(component.form.reset).toHaveBeenCalled();
    expect(component.notificToCreate).toEqual([]);
    expect(component.isSomeChangeNotSubmited).toBeFalsy();
  });

  it('should close the popup after warning confirmation', fakeAsync(() => {
    // with warning
    component.isSomeChangeNotSubmited = true;
    const fakeModalRef = {
      componentInstance: { messages: [] },
      result: Promise.reject(2),
    } as any;
    modalServiceMock.open.and.returnValue(fakeModalRef);
    component.closePopup();

    expect(modalServiceMock.open).toHaveBeenCalledWith(PopupErreurComponent);
    expect(fakeModalRef.componentInstance.messages).toEqual([
      'Changement non sauvegardé',
      'Des modifications non enregistrées ont été détectées.',
      'Êtes-vous sûr de vouloir quitter ?',
    ]);
    flushMicrotasks();
    expect(activeModalMock.close).toHaveBeenCalled();
  }));

  it('should close the popup directly when there are no unsaved changes', () => {
    // without warning
    component.isSomeChangeNotSubmited = false;
    component.closePopup();
    expect(activeModalMock.close).toHaveBeenCalled();
  });

  it('validerEnMasse validity', () => {
    component.notificToCreate = [
      {
        codnot: 'aa',
        codenv: 'aa',
        codorg: 'aa',
        codapp: 'aa',
        codcom: 'aa',
        codfic: 'aa',
        dnotid: '',
        dnotit: '',
      },
    ];
    const responseMock = {
      data: {
        affectationNotfic: [{}],
      },
      loading: false,
      networkStatus: 7,
    };
    apiNoticesServiceMock.AffectationNotices.and.returnValue(of(responseMock));

    spyOn(component, 'resetChanges');
    spyOn(component, 'closePopup');
    spyOn(component.passEntry, 'emit');
    component.validerEnMasse();
    expect(component.resetChanges).toHaveBeenCalled();
    expect(noteServiceMock.show).toHaveBeenCalled();
    expect(component.closePopup).toHaveBeenCalled();
    expect(component.passEntry.emit).toHaveBeenCalledWith(true);
  });

  it('updateDateIhm validity', () => {
    component.selectedNotice = 'aa';
    gridApiMock.getSelectedNodes.and.returnValue([
      {
        data: { codenv: 'a', codorg: 'b', codapp: 'c', codcom: 'd', codfic: 'e', dnotid: 'f', dnotit: 'g', isAuthorisedToReset: true },
        setDataValue: jasmine.createSpy('setDataValue'),
        setSelected: jasmine.createSpy('setSelected'),
      },
    ]);
    spyOn(component.datePipe, 'transform');
    component.gridApi = gridApiMock;
    component.form.controls.dateDeb.setValue('2025-12-12');
    component.form.controls.dateFin.setValue('2025-12-15');
    component.updateDateIhm();
    expect(gridApiMock.getSelectedNodes).toHaveBeenCalled();
    expect(component.notificToCreate).toEqual([]);
    expect(gridApiMock.forEachNode).toHaveBeenCalled();
  });

  it('tableDataUpdated validity', () => {
    spyOn(component, 'getNotificToCreate');
    component.tableDataUpdated();
    expect(component.getNotificToCreate).toHaveBeenCalled();
  });
});
