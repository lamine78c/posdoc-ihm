import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrencesApplicationComponent } from './occurrences-application.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauOccurrenceApplicationService } from './service/tableau-occurrence-application.service';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { OccurrenceApplicationSuiviProduction } from '@app/models/suivi/occurrence-application-interface';
import { filter, of } from 'rxjs';
import { OccurrenceApplicationSuiviProductionQuery } from '@app/models/payload/search-occurrence-application-suivi-production';
import { GenerateFileService } from '@app/services/generate-file.service';
import { GridApi } from 'ag-grid-community';

describe('OccurrencesApplicationComponent', () => {
  let component: OccurrencesApplicationComponent;
  let fixture: ComponentFixture<OccurrencesApplicationComponent>;
  let tableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauOccurrenceApplicationService: jasmine.SpyObj<TableauOccurrenceApplicationService>;
  let apiOccurrenceApplicationService: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
  let generateFileService: jasmine.SpyObj<GenerateFileService>;
  let gridApi: jasmine.SpyObj<GridApi>;

  const mockColumnDefs = [
    { field: 'codenv', headerName: 'Code Environnement' },
    { field: 'codorg', headerName: 'Code Organisation' },
  ];

  const mockOccurrencesApplication: OccurrenceApplicationSuiviProduction[] = [
    {
      codenv: 'P',
      codorg: '117',
      codapp: 'SNV2',
      percod: '250608-00',
      appsta: 'H',
      appinf: '000',
      arefec: true,
      dappld: '2025-06-08T21:45:02',
      dapplt: '2025-06-12T08:49:52',
      dappls: null,
      manuel: false,
      codsit: 'CIRSO',
      codcom: 'EDS2',
      codfic: 'L04',
      numcom: '00',
      codprd: 'QDS2A',
      ficsta: 'H',
      ficinf: '000',
      frefec: false,
      ficvid: false,
      dappcr: '2025-06-08T11:09:00',
      dfichd: '2025-06-08T21:46:48',
      dficht: '2025-06-09T03:01:49',
      dfichs: null,
    },
    {
      codenv: 'P',
      codorg: '117',
      codapp: 'SNV2',
      percod: '250608-00',
      appsta: 'H',
      appinf: '000',
      arefec: true,
      dappld: '2025-06-08T21:45:02',
      dapplt: '2025-06-12T08:49:52',
      dappls: null,
      manuel: false,
      codsit: 'CIRSO',
      codcom: 'ES10',
      codfic: 'L00',
      numcom: '00',
      codprd: 'PS02A',
      ficsta: 'H',
      ficinf: '000',
      frefec: true,
      ficvid: false,
      dappcr: '2025-06-08T21:38:00',
      dfichd: '2025-06-08T21:46:13',
      dficht: '2025-06-09T03:01:49',
      dfichs: null,
    },
  ];

  beforeEach(async () => {
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration', 'getNoDataMessage']);
    const tableauOccurrenceApplicationSpy = jasmine.createSpyObj('TableauOccurrenceApplicationService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
      'setCommandeModalCallback',
      'setDetailsOccurrenceModalCallback',
    ]);
    const apiOccurrenceApplicationSpy = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', [
      'getOccurrenceApplicationForSuiviProduction',
    ]);
    generateFileService = jasmine.createSpyObj('GenerateFileService', ['generateExcelFile']);
    gridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);

    await TestBed.configureTestingModule({
      declarations: [OccurrencesApplicationComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: TableauOccurrenceApplicationService, useValue: tableauOccurrenceApplicationSpy },
        { provide: ApiAdelaideOccurenceApplicationService, useValue: apiOccurrenceApplicationSpy },
        { provide: GenerateFileService, useValue: generateFileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrencesApplicationComponent);
    component = fixture.componentInstance;
    tableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    tableauOccurrenceApplicationService = TestBed.inject(TableauOccurrenceApplicationService) as jasmine.SpyObj<TableauOccurrenceApplicationService>;
    apiOccurrenceApplicationService = TestBed.inject(
      ApiAdelaideOccurenceApplicationService
    ) as jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;

    tableauOccurrenceApplicationService.getColumnDefs.and.returnValue(mockColumnDefs);
    tableauOccurrenceApplicationService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucune donnée</span>');
    apiOccurrenceApplicationService.getOccurrenceApplicationForSuiviProduction.and.returnValue(
      of({
        data: {
          getOccurrenceApplicationForSuiviProduction: {
            occurrencesApplication: mockOccurrencesApplication,
          },
          message: '',
        },
        loading: false,
        networkStatus: 7,
      })
    );

    component.gridApi = gridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize column definitions on ngOnInit', () => {
    expect(tableauOccurrenceApplicationService.getColumnDefs).toHaveBeenCalled();
    expect(component.columnDefs).toEqual(mockColumnDefs);
  });

  it('should load occurrences application successfully', () => {
    const filters: OccurrenceApplicationSuiviProductionQuery = {
      codenv: 'P',
      codorgs: null,
      codapp: null,
      percod: '250608-00',
      codsit: null,
    };

    component.searchFilter$.next({ codenv: 'P', codorgs: null, codapp: null, percod: '250608-00', codsit: null });
    expect(apiOccurrenceApplicationService.getOccurrenceApplicationForSuiviProduction).toHaveBeenCalledWith(filters);
    component.rowData$.pipe(filter(rowData => rowData.length > 0)).subscribe(rowData => {
      expect(rowData).toEqual(mockOccurrencesApplication);
      expect(rowData.length).toBe(2);
    });
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    gridApi.getColumnDefs.and.returnValue([
      { field: 'a', headerName: 'a' },
      { field: 'b', headerName: 'b' },
    ]);
    gridApi.forEachNodeAfterFilterAndSort.and.callFake(callback => {
      callback({ data: { a: 'a', b: '' } } as any, 0);
    });
    component.export(exportEvent);
    fixture.detectChanges();

    expect(generateFileService.generateExcelFile).toHaveBeenCalled();
  });
});
