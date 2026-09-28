import { LoginService } from '@acoss/prisme-angular-intranet';
import { DatePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiBonTravailService } from '@app/services/api-adelaide/exploitation-editique/bon-travail/api-bon-travail.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { BonTravailComponent } from './bon-travail.component';
import { ApiBonTravailUpdateService } from './service/api-bon-travail-update.service';
import { GridApi } from 'ag-grid-community';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauBonTravailService } from './service/tableau-bon-travail.service';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenerateFileService } from '@app/services/generate-file.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';

describe('BonTravailComponent', () => {
  let component: BonTravailComponent;
  let fixture: ComponentFixture<BonTravailComponent>;
  let apiBonTravailServiceSpy: jasmine.SpyObj<ApiBonTravailService>;
  let apiBonTravailUpdateServiceSpy: jasmine.SpyObj<ApiBonTravailUpdateService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let tableauConfigurationBuilderServiceSpy: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauBonTravailServiceSpy: jasmine.SpyObj<TableauBonTravailService>;
  let notesServiceSpy: jasmine.SpyObj<NotesService>;
  let ngbModalSpy: jasmine.SpyObj<NgbModal>;
  let generateFileServiceSpy: jasmine.SpyObj<GenerateFileService>;
  let filterSharedDataServiceSpy: jasmine.SpyObj<FilterSharedDataService>;
  let popupConfirmationServiceSpy: jasmine.SpyObj<PopupConfirmationService>;

  beforeEach(async () => {
    apiBonTravailServiceSpy = jasmine.createSpyObj('ApiBonTravailService', ['searchBonTravail']);
    apiBonTravailUpdateServiceSpy = jasmine.createSpyObj('ApiBonTravailUpdateService', ['updateBonTravail']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['getIdentifiantUtilisateur']);
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);
    tableauConfigurationBuilderServiceSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    tableauBonTravailServiceSpy = jasmine.createSpyObj('TableauBonTravailService', ['getColumnDefs']);
    notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    ngbModalSpy = jasmine.createSpyObj('NgbModal', ['open']);
    generateFileServiceSpy = jasmine.createSpyObj('GenerateFileService', ['generateFile']);
    filterSharedDataServiceSpy = jasmine.createSpyObj('FilterSharedDataService', ['getData']);
    popupConfirmationServiceSpy = jasmine.createSpyObj('PopupConfirmationService', ['openPopupConfirmation']);

    await TestBed.configureTestingModule({
      declarations: [BonTravailComponent],
      providers: [
        Apollo,
        DatePipe,
        { provide: ApiBonTravailService, useValue: apiBonTravailServiceSpy },
        { provide: ApiBonTravailUpdateService, useValue: apiBonTravailUpdateServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderServiceSpy },
        { provide: TableauBonTravailService, useValue: tableauBonTravailServiceSpy },
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: NgbModal, useValue: ngbModalSpy },
        { provide: GenerateFileService, useValue: generateFileServiceSpy },
        { provide: FilterSharedDataService, useValue: filterSharedDataServiceSpy },
        { provide: PopupConfirmationService, useValue: popupConfirmationServiceSpy },
        FormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    permissionServiceSpy.hasPermission.and.returnValue(true);
    permissionServiceSpy.hasActionDeMasse.and.returnValue(true);
    tableauBonTravailServiceSpy.getColumnDefs.and.returnValue([]);
    tableauConfigurationBuilderServiceSpy.createGridConfiguration.and.returnValue({});
    filterSharedDataServiceSpy.getData.and.returnValue(of(false));

    fixture = TestBed.createComponent(BonTravailComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      setFilterModel: jasmine.createSpy('setFilterModel'),
      onFilterChanged: jasmine.createSpy('onFilterChanged'),
      refreshHeader: jasmine.createSpy('refreshHeader'),
      resetColumnState: jasmine.createSpy('resetColumnState'),
      getSelectedNodes: jasmine.createSpy('getSelectedNodes').and.returnValue([]),
    } as unknown as GridApi;
    fixture.detectChanges();
  });

  it('should call searchBonTravail and populate bonTravailData on success', fakeAsync(() => {
    const mockEvent = { codorg: { A: { ORG1: true } }, codenv: 'ENV1' };
    const mockResponse = {
      data: {
        searchBonTravail: {
          groupedBonTravail: [
            {
              codbon: 'BON1',
              codenv: 'ENV1',
              codorg: 'ORG1',
              codapp: 'APP1',
              percod: 'PER1',
              codcom: 'COM1',
              codfic: 'FIC1',
              numcom: 'NUM1',
              pagfic: 10,
              dappcr: '2023-01-01T00:00:00',
              drecep: '2023-01-02T00:00:00',
              dfiexp: '2023-01-03T00:00:00',
              delmsp: 'MSP1',
              inform: 'INFO1',
              codpal: 'PAL1',
              libfic: 'LIB1',
              codnot: ['NOT1', 'NOT2', 'NOT3'],
              libnot: ['LIBNOT1', 'LIBNOT2', 'LIBNOT3'],
              codsit: 'SIT1',
            },
            {
              codbon: 'BON2',
              codenv: 'ENV2',
              codorg: 'ORG2',
              codapp: 'APP2',
              percod: 'PER2',
              codcom: 'COM2',
              codfic: 'FIC2',
              numcom: 'NUM2',
              pagfic: 20,
              dappcr: '2023-02-01T00:00:00',
              drecep: '2023-02-02T00:00:00',
              dfiexp: '2023-02-03T00:00:00',
              delmsp: 'MSP2',
              inform: 'INFO2',
              codpal: 'PAL2',
              libfic: 'LIB2',
              codnot: ['NOT4', 'NOT5', 'NOT6'],
              libnot: ['LIBNOT4', 'LIBNOT5', 'LIBNOT6'],
              codsit: 'SIT2',
            },
          ],
          message: null,
        },
      },
    };

    apiBonTravailServiceSpy.searchBonTravail.and.returnValue(of(mockResponse as any));
    component.searchBonTravail(mockEvent);
    tick();

    expect(apiBonTravailServiceSpy.searchBonTravail).toHaveBeenCalledWith(component.searchBonTravailPayload(mockEvent));
    expect(component.bonTravailData.length).toBe(2);
    expect(component.bonTravailData[0].codbon).toBe('BON1');
    expect(component.totalBonTravail).toBe(2);
  }));

  it('should update correctly', () => {
    const mockResponseUpdateBonTravail: { data: { updateBonTravail: any[] } } = {
      data: {
        updateBonTravail: [
          {
            codenv: 'a',
            codorg: 'a',
            codapp: 'a',
            percod: 'a',
            codcom: 'a',
            codfic: 'a',
            numcom: 'a',
            drecep: '2014-10-10T10:10:10',
            dfiexp: '2014-10-11T10:10:10',
            inform: 'a',
            delmsp: 1,
          },
        ],
      },
    };
    const mockResponseSearchBonTravail = {
      data: {
        searchBonTravail: {
          groupedBonTravail: [
            {
              codbon: 'BON1',
              codenv: 'ENV1',
              codorg: 'ORG1',
              codapp: 'APP1',
              percod: 'PER1',
              codcom: 'COM1',
              codfic: 'FIC1',
              numcom: 'NUM1',
              pagfic: 10,
              dappcr: '2023-01-01T00:00:00',
              drecep: '2023-01-02T00:00:00',
              dfiexp: '2023-01-03T00:00:00',
              delmsp: 'MSP1',
              inform: 'INFO1',
              codpal: 'PAL1',
              libfic: 'LIB1',
              codnot: ['NOT1', 'NOT2', 'NOT3'],
              libnot: ['LIBNOT1', 'LIBNOT2', 'LIBNOT3'],
              codsit: 'SIT1',
            },
            {
              codbon: 'BON2',
              codenv: 'ENV2',
              codorg: 'ORG2',
              codapp: 'APP2',
              percod: 'PER2',
              codcom: 'COM2',
              codfic: 'FIC2',
              numcom: 'NUM2',
              pagfic: 20,
              dappcr: '2023-02-01T00:00:00',
              drecep: '2023-02-02T00:00:00',
              dfiexp: '2023-02-03T00:00:00',
              delmsp: 'MSP2',
              inform: 'INFO2',
              codpal: 'PAL2',
              libfic: 'LIB2',
              codnot: ['NOT4', 'NOT5', 'NOT6'],
              libnot: ['LIBNOT4', 'LIBNOT5', 'LIBNOT6'],
              codsit: 'SIT2',
            },
          ],
          message: null,
        },
      },
    };
    component.lastSearchEvent = { codorg: { A: { ORG1: true } }, codenv: 'ENV1' };
    component.hasEditPerm = true;
    apiBonTravailUpdateServiceSpy.updateBonTravail.and.returnValue(of(mockResponseUpdateBonTravail as any));
    apiBonTravailServiceSpy.searchBonTravail.and.returnValue(of(mockResponseSearchBonTravail as any));
    component.valider(false);
    expect(component.bonTravailUpdateResultat.data.updateBonTravail.length).toEqual(1);
    expect(apiBonTravailServiceSpy.searchBonTravail).toHaveBeenCalledWith(component.searchBonTravailPayload(component.lastSearchEvent));
    expect(component.bonTravailData.length).toBe(2);
    expect(component.bonTravailData[0].codbon).toBe('BON1');
    expect(component.totalBonTravail).toBe(2);
  });
});
