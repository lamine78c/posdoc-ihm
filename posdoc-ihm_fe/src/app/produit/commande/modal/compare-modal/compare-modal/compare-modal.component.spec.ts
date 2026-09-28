import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApolloQueryResult } from '@apollo/client/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { of } from 'rxjs';
import { TableauCompareCommandeService } from '../service/tableau-compare-commande.service';
import { CompareModalComponent } from './compare-modal.component';

describe('CompareModalComponent', () => {
  let component: CompareModalComponent;
  let fixture: ComponentFixture<CompareModalComponent>;
  let mockApiAdelaideCommandeService: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockTableauService: jasmine.SpyObj<TableauCompareCommandeService>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockResponse: ApolloQueryResult<any> = {
    data: {
      compareCommandes: [
        {
          application: 'SNV2',
          organisme: '117',
          codeReg: '117',
          sortHelper: 'TZ26',
          environnements: 'P',
        },
        {
          application: 'SNV2',
          organisme: '117',
          codeReg: '117',
          sortHelper: 'PD71',
          environnements: 'P',
        },
        {
          application: 'SNV2',
          organisme: '117',
          codeReg: '117',
          sortHelper: 'TD89',
          environnements: 'P',
        },
        {
          application: 'MAS',
          organisme: '00L',
          codeReg: '',
          sortHelper: 'TZ21',
          environnements: 'P',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiAdelaideCommandeService = jasmine.createSpyObj('ApiAdelaideCommandeService', ['compareCommandes']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockTableauService = jasmine.createSpyObj('TableauCompareCommandeService', ['getOverlayNoRowsTemplate']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption', 'sizeColumnsToFit', 'addEventListener']);

    TestBed.configureTestingModule({
      declarations: [CompareModalComponent],
      providers: [
        { provide: ApiAdelaideCommandeService, useValue: mockApiAdelaideCommandeService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: ApiAdelaideCommandeService, useValue: mockApiAdelaideCommandeService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: TableauCompareCommandeService, useValue: mockTableauService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockApiAdelaideCommandeService.compareCommandes.and.returnValue(of(mockResponse));
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    fixture = TestBed.createComponent(CompareModalComponent);
    component = fixture.componentInstance;
    component.modalRef = mockModal;
    fixture.detectChanges();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.rowData = [
      {
        application: 'APAZ',
        Région: '',
        organisme: '00L',
      },
    ];
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalled();
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.columnDefs).toEqual([{ field: 'application' }, { field: 'Région' }, { field: 'organisme' }]);
    expect(component.overlayNoRowsTemplate).toEqual('nodata');
  });

  it('should register event listener on api', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    component.onGridReady(mockParams);
    fixture.detectChanges();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
    expect(mockGridApi.addEventListener).toHaveBeenCalledWith('paginationChanged', jasmine.any(Function));
  });

  it('closePopup validity', () => {
    component.closePopup();
    fixture.detectChanges();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('SharedUtil gridHeight validity', () => {
    spyOn(SharedUtil, 'getGridHeight');
    component.gridHeight();
    fixture.detectChanges();
    expect(SharedUtil.getGridHeight).toHaveBeenCalled();
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    component.rowDetails = [
      {
        application: 'MAS',
        Région: '',
        organisme: '00L',
        sortHelper: 'MAS0',
        P: 'MAS0',
      },
      {
        application: 'MAS',
        Région: '',
        organisme: '00L',
        sortHelper: 'MASX',
        P: 'MASX',
      },
    ];
    const data = [
      ['MAS', '', '00L', 'MAS0'],
      ['MAS', '', '00L', 'MASX'],
    ];
    const headers = ['application', 'Région', 'organisme', 'P'];
    const title = 'Comparaison des Commandes';

    component.exportDetails(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(data, headers, title);
  });

  it('lister validity', () => {
    component.params = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    const event = {
      codesEnvironnement: ['P', 'T'],
      codesOrganisme: ['00L', '00T'],
      codesApplication: ['MAS', 'SNV2'],
    };
    component.lister(event);
    fixture.detectChanges();
    expect(mockApiAdelaideCommandeService.compareCommandes).toHaveBeenCalled();
  });
});
