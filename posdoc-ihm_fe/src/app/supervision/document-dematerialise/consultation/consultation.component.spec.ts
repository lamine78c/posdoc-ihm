import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiAdelaideDocumentDematerialiseService } from '@app/services/api-adelaide-docments-dematerialise.service';
import { Apollo } from 'apollo-angular';

import { ConsultationComponent } from './consultation.component';
import { of } from 'rxjs';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { SearchDocDematerialiseInterface } from './model/search-document-dematerialise-interface';
import { GenerateFileService } from '@app/services/generate-file.service';

describe('ConsultationComponent', () => {
  let component: ConsultationComponent;
  let fixture: ComponentFixture<ConsultationComponent>;
  let apiAdelaideDocumentDematerialiseServiceSpy: jasmine.SpyObj<ApiAdelaideDocumentDematerialiseService>;
  let generateFileServiceSpy: jasmine.SpyObj<GenerateFileService>;
  const mockColumnDefs = [{ field: 'codenv', headerName: 'Env' }];

  beforeEach(async () => {
    apiAdelaideDocumentDematerialiseServiceSpy = jasmine.createSpyObj('ApiAdelaideDocumentDematerialiseService', [
      'getDocsDematerialises',
      'getAllSelectConfig',
    ]);
    generateFileServiceSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);

    await TestBed.configureTestingModule({
      declarations: [ConsultationComponent],
      providers: [
        Apollo,
        DatePipe,
        { provide: ApiAdelaideDocumentDematerialiseService, useValue: apiAdelaideDocumentDematerialiseServiceSpy },
        { provide: GenerateFileService, useValue: generateFileServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      setFilterModel: jasmine.createSpy('setFilterModel'),
      getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue(mockColumnDefs),
      onFilterChanged: jasmine.createSpy('onFilterChanged'),
      refreshHeader: jasmine.createSpy('refreshHeader'),
      resetColumnState: jasmine.createSpy('resetColumnState'),
      setGridOption: jasmine.createSpy('setGridOption'),
      forEachNodeAfterFilterAndSort: jasmine.createSpy('forEachNodeAfterFilterAndSort'),
    } as unknown as GridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onGridReady validity', () => {
    const mockParams = {
      api: component.gridApi,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    const mockResponse = {
      data: {
        allOrganismes: [
          { code: '00L', codeRegion: null },
          { code: '00T', codeRegion: '' },
        ],
      },
    };
    apiAdelaideDocumentDematerialiseServiceSpy.getAllSelectConfig.and.returnValue(of(mockResponse as any));

    component.onGridReady(mockParams);
    expect(apiAdelaideDocumentDematerialiseServiceSpy.getAllSelectConfig).toHaveBeenCalled();
    expect(component.params).toEqual(mockParams);
    expect(component.gridApi).toEqual(mockParams.api);
    expect(component.gridColumnApi).toEqual(mockParams.api);
  });

  it('should populate rowData on successful API call', () => {
    const mockEvent: SearchDocDematerialiseInterface = {
      date: '2025-07-01',
      coddoc: null,
      codorgs: null,
      docsta: null,
      typact: null,
      codapp: null,
      codcom: null,
    };
    const organismes = [
      { code: '00L', libelle: 'Organisme de massification Lyon', codeRegion: null },
      { code: '00T', libelle: 'Organisme de massification Toulouse', codeRegion: '' },
      { code: '117', libelle: 'Organisme 117', codeRegion: '117' },
    ];
    const mockResponse = {
      data: {
        allOrganismes: organismes,
        getDocsDematerialises: [
          {
            datdem: '20221111',
            numdem: '12345',
            codenv: 'p',
            codorg: '117',
            codapp: 'pnr',
            percod: '112233-44',
            codcom: 'com',
            codfic: 'f00',
            coddoc: 'doc',
            refdem: 'ref',
            typact: '1',
            imprim: false,
            docsta: 's',
            docinf: 'inf',
            ddodeb: '2025-07-01 23:59:57',
            ddofin: '2025-07-01 23:59:57',
            ddosus: '2025-07-01 23:59:57',
            tpscom: 'tps',
            libinf: 'error',
            codeSiteDematerialisation: 'test',
          },
        ],
      },
    };
    apiAdelaideDocumentDematerialiseServiceSpy.getDocsDematerialises.and.returnValue(of(mockResponse as any));
    component.organismes = organismes;
    component.lister(mockEvent);
    expect(component.rowData.length).toBe(1);
    expect(component.rowData[0].id).toEqual('20221111-12345');
    expect(component.rowData[0].produit).toEqual('com.f00');
    expect(component.rowData[0].document).toEqual('doc');
    expect(component.rowData[0].statut).toEqual('s-inf');
    expect(component.rowData[0].typact).toEqual('Cotisant');
    expect(component.rowData[0].codeRegion).toEqual('117');
  });

  it('should export data as excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    component.export(exportEvent);
    expect(component.gridApi.getColumnDefs).toHaveBeenCalled();
    expect(component.gridApi.forEachNodeAfterFilterAndSort).toHaveBeenCalled();
    expect(generateFileServiceSpy.generateExcelFile).toHaveBeenCalled();
  });
});
