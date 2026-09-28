import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { of } from 'rxjs';
import { TableauExemplaireService } from '../service/tableau-exemplaire.service';
import { DistributionExemplairesComponent } from './distribution-exemplaires.component';

describe('DistributionExemplairesComponent', () => {
  let component: DistributionExemplairesComponent;
  let fixture: ComponentFixture<DistributionExemplairesComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauExemplaireService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let fb: FormBuilder;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  const mockColumnDefs = [
    {
      headerName: 'Organisme',
      field: 'codorg',
      floatingFilterComponentParams: { selectData: null },
    },
  ];
  const mockResponseAllOrgsData = [
    {
      code: '117',
      codeRegion: '117',
    },
    {
      code: '116',
      codeRegion: '111',
    },
  ];
  const mockResponseAllOrgs = {
    data: {
      allOrganismes: mockResponseAllOrgsData,
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponsePre = {
    data: {
      getPreselectedExemplaire: [
        {
          codenv: 'p',
          codorg: '117',
          codapp: 'a1',
          codcom: 'c1',
          codfic: 'f1',
        },
        {
          codenv: 'p',
          codorg: '116',
          codapp: 'a2',
          codcom: 'c2',
          codfic: 'f2',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponsePreVide = {
    data: {
      getPreselectedExemplaire: [],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', [
      'createGridConfiguration',
      'getNoDataMessage',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideDistributionService', ['getAllOrganismes', 'getPreselectedData']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockTableauService = jasmine.createSpyObj('TableauExemplaireService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);

    TestBed.configureTestingModule({
      declarations: [DistributionExemplairesComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauExemplaireService, useValue: mockTableauService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: ApiAdelaideDistributionService, useValue: mockApiAdelaideService },
        { provide: NotesService, useValue: mockNoteService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockApiAdelaideService.getAllOrganismes.and.returnValue(of(mockResponseAllOrgs));
    mockApiAdelaideService.getPreselectedData.and.returnValue(of(mockResponsePre));

    fixture = TestBed.createComponent(DistributionExemplairesComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.gridApi = mockGridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit validity', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.formPreselection).toBeTruthy();
    expect(component.formPreselection.controls.commande).toBeDefined();
    expect(component.formPreselection.controls.application).toBeDefined();
    expect(component.formPreselection.controls.organisme).toBeDefined();
    expect(component.formPreselection.controls.environnement).toBeDefined();
    expect(component.formPreselection.controls.fichier).toBeDefined();
  });

  it('onGridReady validity', () => {
    const mockParams = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as GridReadyEvent;
    component.onGridReady(mockParams);
    fixture.detectChanges();

    expect(mockApiAdelaideService.getAllOrganismes).toHaveBeenCalled();
  });

  it('setError validity', () => {
    const errors = new Map<number, TableAsynchronousError[]>();
    const error: TableAsynchronousError = {
      isError: true,
      message: 'Test error message',
      id: null,
    };

    component.setError(1, error, errors);
    fixture.detectChanges();

    expect(errors.has(1)).toBe(true);
    expect(errors.get(1).length).toBe(1);
    expect(errors.get(1)[0]).toEqual(error);

    component.setError(1, error, errors);
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    const colDef = [
      { field: 'codenv', headerName: 'environnement' },
      { field: 'codreg', headerName: 'région' },
      { field: 'codorg', headerName: 'organisme' },
      { field: 'codcom', headerName: 'commande' },
      { field: 'codfic', headerName: 'fichier' },
    ];
    const title = 'Liste des exemplaires';
    const data = [
      ['p', '111', '116', 'c2', 'f2'],
      ['p', '117', '117', 'c1', 'f1'],
    ];
    component.organismes = mockResponseAllOrgsData;
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
        '111': fb.group({ '116': [true] }),
      }),
      application: [],
      commande: [],
      fichier: [],
    });
    mockGridApi.getColumnDefs.and.returnValue(colDef);
    mockApiAdelaideService.getPreselectedData.and.returnValue(of(mockResponsePre));

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      data,
      colDef.map(c => c.headerName),
      title,
      {
        columnDefs: colDef,
      }
    );
  });

  it('should not export and send warning message', () => {
    const exportEvent = { type: 'exportAsExcel' };
    component.organismes = mockResponseAllOrgsData;
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [false],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [false] }),
      }),
      application: [],
      commande: [],
      fichier: [],
    });
    mockApiAdelaideService.getPreselectedData.and.returnValue(of(mockResponsePre));

    component.export(exportEvent);
    fixture.detectChanges();

    expect(mockNoteService.show).toHaveBeenCalled();
  });

  it('validerPreselection validity', () => {
    spyOn(AgGridUtil, 'resetFilterAndColumnSort');
    component.organismes = mockResponseAllOrgsData;
    component.formPreselection = fb.group({
      environnement: fb.group({
        P: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
      fichier: ['fic1'],
    });
    component.validerPreselection();
    fixture.detectChanges();

    expect(component.nombreExemplairesTotal).toBe(2);

    component.formPreselection.controls.fichier.setValue('');
    mockApiAdelaideService.getPreselectedData.and.returnValue(of(mockResponsePreVide));
    component.validerPreselection();
    expect(mockTableauConfigurationBuilderService.getNoDataMessage).toHaveBeenCalled();
  });
});
