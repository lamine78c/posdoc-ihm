import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SitesComponent } from './sites.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauSiteService } from './service/tableau-site.service';
import { ApiAdelaideSiteService } from 'src/app/services/api-adelaide-site.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { ApolloQueryResult } from '@apollo/client/core';

interface SiteWithNewRow {
  code: string;
  host?: string;
  ressourceDelestage?: string;
  username?: string;
  password?: string;
  organismeMassification?: string;
  isNotAuthorisedToBeDeleted?: boolean;
  newRow?: boolean;
}

describe('SitesComponent', () => {
  let component: SitesComponent;
  let fixture: ComponentFixture<SitesComponent>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauSiteService: jasmine.SpyObj<TableauSiteService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideSiteService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;

  const mockSitesData: ApolloQueryResult<any> = {
    data: {
      allSitesCNP: [
        {
          code: 'CIRSO',
          host: 'ADELAIDE64T3.CER69.RECOUV',
          ressourceDelestage: 'ADELAIDE',
          username: 'ADEL',
          password: 'm02passadl',
          organismeMassification: '00T',
          isNotAuthorisedToBeDeleted: true
        },
        {
          code: 'PARIS',
          host: 'ADELAIDE64T1.CER75.RECOUV',
          ressourceDelestage: 'ADELAIDE2',
          username: 'USER1',
          password: 'pass123',
          organismeMassification: '00P',
          isNotAuthorisedToBeDeleted: false
        }
      ],
      allOrganismes: [
        { code: '00T', libelle: 'Organisme Test' },
        { code: '00P', libelle: 'Organisme Paris' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  const mockSelectConfigData: ApolloQueryResult<any> = {
    data: {
      allRessources: [
        { code: 'ADELAIDE', libelle: 'Ressource Adelaïde' },
        { code: 'ADELAIDE2', libelle: 'Ressource Adelaïde 2' }
      ]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauSiteService = jasmine.createSpyObj('TableauSiteService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiService = jasmine.createSpyObj('ApiAdelaideSiteService', ['getAllSitesCNP', 'getAllSelectConfig', 'createSite', 'updateSite', 'deleteSites']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption', 'forEachNode', 'applyTransaction', 'redrawRows', 'getColumnDefs', 'forEachNodeAfterFilterAndSort']);

    TestBed.configureTestingModule({
      declarations: [SitesComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigService },
        { provide: TableauSiteService, useValue: mockTableauSiteService },
        { provide: ApiAdelaideSiteService, useValue: mockApiService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauSiteService.getColumnDefs.and.returnValue([
      { field: 'organismeMassification', floatingFilterComponentParams: {}, cellRendererParams: {} },
      { field: 'ressourceDelestage', cellRendererParams: {} }
    ]);
    mockTableauSiteService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiService.getAllSitesCNP.and.returnValue(of(mockSitesData));
    mockApiService.getAllSelectConfig.and.returnValue(of(mockSelectConfigData));

    fixture = TestBed.createComponent(SitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauSiteService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauSiteService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucun résultat</span>');
  });

  it('should load data on grid ready', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(mockApiService.getAllSitesCNP).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
  });

  it('should process data and update grids after successful data load', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    expect(component.rowData).toEqual(mockSitesData.data.allSitesCNP);
    expect(component.nombreSiteTotal).toBe(2);
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should populate organisme and ressource data on grid ready', () => {
    const gridReadyEvent = {
      api: mockGridApi,
      context: {},
      type: 'gridReady'
    } as unknown as GridReadyEvent;

    component.onGridReady(gridReadyEvent);

    component.organismeData$.subscribe(data => {
      expect(data).toEqual(mockSitesData.data.allOrganismes);
    });

    component.ressourceData$.subscribe(data => {
      expect(data.length).toBe(2);
      expect(data[0]).toEqual({ value: 'ADELAIDE', text: 'ADELAIDE' });
    });
  });

  it('should create new site successfully', () => {
    const newSite: SiteWithNewRow = {
      code: 'LYON',
      host: 'ADELAIDE64T2.CER69.RECOUV',
      ressourceDelestage: 'ADELAIDE',
      username: 'USER2',
      password: 'pass456',
      organismeMassification: '00L',
      isNotAuthorisedToBeDeleted: false,
      newRow: true
    };
    const editedRow = [[1, newSite]];

    mockApiService.createSite.and.returnValue(of({}));
    component.gridApi = mockGridApi;

    component.onSaveEdition(editedRow);

    expect(mockApiService.createSite).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'LYON',
      host: 'ADELAIDE64T2.CER69.RECOUV',
      ressourceDelestage: 'ADELAIDE',
      username: 'USER2'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le site a été ajouté avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should handle create site error', () => {
    const newSite: SiteWithNewRow = {
      code: 'INVALID',
      host: 'test.server.com',
      newRow: true
    };
    const editedRow = [[1, newSite]];
    const error = { graphQLErrors: [{ message: 'Erreur création' }] };

    mockApiService.createSite.and.returnValue(throwError(error));

    component.onSaveEdition(editedRow);

    expect(newSite.newRow).toBe(true);
    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should update existing site successfully', () => {
    const existingSite: SiteWithNewRow = {
      code: 'CIRSO',
      host: 'ADELAIDE64T3.CER69.RECOUV.UPDATED',
      ressourceDelestage: 'ADELAIDE',
      username: 'ADEL',
      password: 'newpass123',
      organismeMassification: '00T'
    };
    const editedRow = [[1, existingSite]];

    mockApiService.updateSite.and.returnValue(of({ data: { updateSiteCNP: { code: 'CIRSO' } } }));

    component.onSaveEdition(editedRow);

    expect(mockApiService.updateSite).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'CIRSO',
      host: 'ADELAIDE64T3.CER69.RECOUV.UPDATED',
      password: 'newpass123'
    }));
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le site "CIRSO" a été mis à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete sites successfully', () => {
    const sitesToDelete = [
      { code: 'CIRSO', host: 'ADELAIDE64T3.CER69.RECOUV' },
      { code: 'PARIS', host: 'ADELAIDE64T1.CER75.RECOUV' }
    ];

    mockApiService.deleteSites.and.returnValue(of({ data: {} }));
    component.gridApi = mockGridApi;

    component.onDeleteRow(sitesToDelete);

    expect(mockApiService.deleteSites).toHaveBeenCalledWith(['CIRSO', 'PARIS']);
    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: sitesToDelete });
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les sites ont été supprimés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should delete single site with correct message', () => {
    const siteToDelete = [{ code: 'PARIS', host: 'ADELAIDE64T1.CER75.RECOUV' }];

    mockApiService.deleteSites.and.returnValue(of({ data: {} }));
    component.gridApi = mockGridApi;

    component.onDeleteRow(siteToDelete);

    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le site a été supprimé avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS
    });
  });

  it('should export data as PDF', () => {
    const mockColumnDefs = [
      { field: 'code', headerName: 'Code' },
      { field: 'host', headerName: 'Serveur' },
      { field: 'ressourceDelestage', headerName: 'Ressource Délestage' }
    ];
    const mockData = [{
      code: 'CIRSO',
      host: 'ADELAIDE64T3.CER69.RECOUV',
      ressourceDelestage: 'ADELAIDE'
    }];

    const mockRowNode = {
      data: mockData[0],
      setSelected: jasmine.createSpy(),
      isSelected: jasmine.createSpy(),
      isRowPinned: jasmine.createSpy(),
      isExpandable: jasmine.createSpy()
    } as any;

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      callback(mockRowNode, 0);
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['CIRSO', 'ADELAIDE64T3.CER69.RECOUV', 'ADELAIDE']],
      ['Code', 'Serveur', 'Ressource Délestage'],
      'Liste des Sites'
    );
  });

  it('should set errors correctly in error map', () => {
    const errors = new Map();
    const error = { isError: true, message: 'Test error', id: null };

    component.setError(1, error, errors);

    expect(errors.has(1)).toBe(true);
    expect(errors.get(1)).toContain(error);

    const secondError = { isError: true, message: 'Second error', id: null };
    component.setError(1, secondError, errors);

    expect(errors.get(1).length).toBe(2);
    expect(errors.get(1)).toContain(secondError);
  });
});

