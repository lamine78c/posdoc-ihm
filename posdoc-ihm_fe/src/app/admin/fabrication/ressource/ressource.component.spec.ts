import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { RessourceComponent } from './ressource.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauRessourceService } from './service/tableau-ressource.service';
import { ApiAdelaideRessourceService } from '@app/services/api-adelaide-ressource.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { PermissionService } from '@app/services/permission/permission.service';

const mockGridApi = {
  setGridOption: jasmine.createSpy('setGridOption'),
  forEachNode: jasmine.createSpy('forEachNode'),
  forEachNodeAfterFilterAndSort: jasmine.createSpy('forEachNodeAfterFilterAndSort'),
  applyTransaction: jasmine.createSpy('applyTransaction'),
  redrawRows: jasmine.createSpy('redrawRows'),
  getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue([
    { field: 'test', headerName: 'Test' }
  ])
};

const mockRessourceData = {
  data: {
    allRessources: [
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'MB',
        codeSite: 'CIRTIL',
        codeRessource: 'MEMO'
      }
    ],
    allOrganismes: [
      { code: '117', codeRegion: '117' }
    ]
  },
  loading: false,
  networkStatus: 7
};

const mockSelectConfigData = {
  data: {
    allEnvironnementsInApplication: [{ value: 'P' }],
    allGammes: [{ value: 'MB' }],
    allSitesCNP: [{ value: 'CIRTIL' }],
    allServers: [{ value: 'SERVER1', actif: true }],
    allParametresDistribution: [{ value: 'CMD1', logicielDistribution: 'LOG1' }],
    allApplications: [{ value: 'SNV2', codeEnv: 'P', codeOrg: '117' }]
  },
  loading: false,
  networkStatus: 7
};

describe('RessourceComponent', () => {
  let component: RessourceComponent;
  let fixture: ComponentFixture<RessourceComponent>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauRessourceService: jasmine.SpyObj<TableauRessourceService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideRessourceService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(waitForAsync(() => {
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const tableauRessourceSpy = jasmine.createSpyObj('TableauRessourceService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const apiSpy = jasmine.createSpyObj('ApiAdelaideRessourceService', ['getAllRessources', 'getAllSelectConfig', 'createRessource', 'updateRessource', 'deleteRessources']);
    const notesSpy = jasmine.createSpyObj('NotesService', ['show']);
    const generateFileSpy = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    const filterSharedDataSpy = jasmine.createSpyObj('FilterSharedDataService', ['getData']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);

    TestBed.configureTestingModule({
      declarations: [RessourceComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: TableauRessourceService, useValue: tableauRessourceSpy },
        { provide: ApiAdelaideRessourceService, useValue: apiSpy },
        { provide: NotesService, useValue: notesSpy },
        { provide: GenerateFileService, useValue: generateFileSpy },
        { provide: FilterSharedDataService, useValue: filterSharedDataSpy },
        { provide: PermissionService, useValue: permissionSpy }
      ]
    }).compileComponents();

    mockTableauConfigService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockTableauRessourceService = TestBed.inject(TableauRessourceService) as jasmine.SpyObj<TableauRessourceService>;
    mockApiService = TestBed.inject(ApiAdelaideRessourceService) as jasmine.SpyObj<ApiAdelaideRessourceService>;
    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockGenerateFileService = TestBed.inject(GenerateFileService) as jasmine.SpyObj<GenerateFileService>;
    mockFilterSharedDataService = TestBed.inject(FilterSharedDataService) as jasmine.SpyObj<FilterSharedDataService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RessourceComponent);
    component = fixture.componentInstance;

    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauRessourceService.getColumnDefs.and.returnValue([
      { field: 'codeEnvironnement', cellRendererParams: { selectData: new BehaviorSubject([]) } },
      { field: 'codeApplication', cellRendererParams: { selectData: new BehaviorSubject([]) } },
      { field: 'codeOrganisme', cellRendererParams: { selectData: new BehaviorSubject([]) }, floatingFilterComponentParams: { selectData: new BehaviorSubject([]) } },
      { field: 'codeGamme', cellRendererParams: { selectData: new BehaviorSubject([]) } },
      { field: 'codeSite', cellRendererParams: { selectData: new BehaviorSubject([]) } }
    ]);
    mockTableauRessourceService.getOverlayNoRowsTemplate.and.returnValue('<div>Aucune ressource</div>');
    mockApiService.getAllRessources.and.returnValue(of(mockRessourceData));
    mockApiService.getAllSelectConfig.and.returnValue(of(mockSelectConfigData));
    mockFilterSharedDataService.getData.and.returnValue(of({}));
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options and column definitions on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigService.createGridConfiguration).toHaveBeenCalled();
    expect(mockTableauRessourceService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauRessourceService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions.masterDetail).toBe(true);
    expect(component.gridOptions.detailRowAutoHeight).toBe(false);
  });

  it('should load data on grid ready', () => {
    const gridReadyEvent = { api: mockGridApi, columnApi: mockGridApi, type: 'gridReady', context: null } as any;

    component.onGridReady(gridReadyEvent);

    expect(mockApiService.getAllRessources).toHaveBeenCalled();
    expect(mockApiService.getAllSelectConfig).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
  });

  // Test 4: Vérification de la récupération du code région par organisme
  it('should return correct region code for given organism code', () => {
    component.organismes = [
      { code: '117', codeRegion: '117' },
      { code: '999', codeRegion: 'REG2' }
    ];
    const result = component.getCodeRegionByCodeOrg('117');
    expect(result).toBe('117');
  });

  // Test 5: Vérification de la création d'une nouvelle ressource
  it('should create new resource successfully', () => {
    const newResource = new Map();
    newResource.set(1, {
      newRow: true,
      codeEnvironnement: 'P',
      codeOrganisme: '117',
      codeApplication: 'SNV2',
      codeGamme: 'MB',
      codeSite: 'CIRTIL',
      codeRessource: 'MEMO'
    });
    mockApiService.createRessource.and.returnValue(of({ data: {} }));
    component.gridApi = mockGridApi as any;
    component.onSaveEdition(newResource);
    expect(mockApiService.createRessource).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La ressource a été créée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  // Test 6: Vérification de la gestion d'erreur lors de la création
  it('should handle error when creating resource fails', () => {
    const newResource = new Map();
    newResource.set(1, {
      newRow: true,
      codeEnvironnement: 'P',
      codeOrganisme: '117',
      codeApplication: 'SNV2'
    });
    const error = { graphQLErrors: [{ message: 'Erreur de création' }] };
    mockApiService.createRessource.and.returnValue(throwError(error));
    component.onSaveEdition(newResource);
    expect(mockApiService.createRessource).toHaveBeenCalled();
    expect(component.asynchronousErrors$.getValue()).not.toBeNull();
  });

  // Test 7: Vérification de la mise à jour d'une ressource existante
  it('should update existing resource successfully', () => {
    const existingResource = new Map();
    existingResource.set(1, {
      codeEnvironnement: 'P',
      codeOrganisme: '117',
      codeApplication: 'SNV2',
      codeGamme: 'MB'
    });
    mockApiService.updateRessource.and.returnValue(of({ data: {} }));
    component.onSaveEdition(existingResource);
    expect(mockApiService.updateRessource).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La ressource a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  // Test 8: Vérification de la suppression de ressources
  it('should delete resources successfully', () => {
    const resourcesToDelete = [
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'MB',
        codeSite: 'CIRTIL',
        codeRessource: 'MEMO'
      }
    ];
    mockApiService.deleteRessources.and.returnValue(of({ data: {} }));
    component.gridApi = mockGridApi as any;
    component.onDeleteRow(resourcesToDelete);
    expect(mockApiService.deleteRessources).toHaveBeenCalled();
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: resourcesToDelete });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La ressource a été supprimée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const exportEvent = { type: 'exportAsPDF' };
    component.gridApi = mockGridApi as any;
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback({ data: { field1: 'value1' } });
    });

    component.export(exportEvent);

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalled();
  });

  it('should export data as Excel', () => {
    const exportEvent = { type: 'exportAsExcel' };
    component.gridApi = mockGridApi as any;
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback({ data: { field1: 'value1' } });
    });

    component.export(exportEvent);

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
  });

  // Test 11: Vérification de la mise à jour des applications par environnement
  it('should update application list when environment changes', () => {
    const mockNode = {
      data: { codeEnvironnement: 'P', codeApplication: 'SNV2' },
      setDataValue: jasmine.createSpy('setDataValue')
    };
    component.compareData$ = new BehaviorSubject([
      { codeApp: 'SNV2', codeEnv: 'P', codeOrg: '117' },
      { codeApp: 'APP2', codeEnv: 'P', codeOrg: '999' }
    ]);
    component.updateSelectApplicationByCodeEnv(mockNode);
    expect(component.applicationData$.getValue()).toEqual([
      { text: 'SNV2', value: 'SNV2' },
      { text: 'APP2', value: 'APP2' }
    ]);
  });
});
