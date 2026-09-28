import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacturationFichierComponent } from './facturation-fichier.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauFacturationFichierMassifieService } from './service/tableau-facturation-fichier-massifie.service';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { of, throwError } from 'rxjs';
import { ParamsPopupFichiers } from '../../models/params-fichiers-interface';
import { GridApi, GridReadyEvent } from 'ag-grid-community';

describe('FacturationFichierComponent', () => {
  let component: FacturationFichierComponent;
  let fixture: ComponentFixture<FacturationFichierComponent>;
  let mockTableauConfigService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauFacturationFichierMassifieService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  const mockResponse = {
    data: {
      searchFacturationsByFichier: {
        facturations: [],
        fichiersMas: [],
      },
    },
    loading: false,
    networkStatus: 7,
  };
  const params: ParamsPopupFichiers = {
    codenv: 'A',
    codorg: 'A',
    codapp: 'A',
    percod: 'A',
    codcom: 'A',
    codfic: 'A',
    numcom: 'A',
  };

  beforeEach(waitForAsync(() => {
    mockTableauConfigService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauService = jasmine.createSpyObj('TableauFacturationFichierMassifieService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiService = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['searchFacturationsByFichier']);
    mockApiService.searchFacturationsByFichier.and.returnValue(of(mockResponse));
    mockTableauConfigService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue([]);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');

    TestBed.configureTestingModule({
      declarations: [FacturationFichierComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigService },
        { provide: TableauFacturationFichierMassifieService, useValue: mockTableauService },
        { provide: ApiAdelaideOccurenceApplicationService, useValue: mockApiService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturationFichierComponent);
    component = fixture.componentInstance;
    component.params = params;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle onGridReady event correctly', () => {
    const gridReadyEvent: GridReadyEvent = {
      api: mockGridApi,
      type: 'gridReady',
      columnApi: mockGridApi,
      context: {},
    } as GridReadyEvent;
    component.onGridReady(gridReadyEvent);
    fixture.detectChanges();

    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
  });

  it('should run nginit correctly', () => {
    spyOn(component, 'initGridOptions');
    spyOn(component, 'loadFacturations');
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.initGridOptions).toHaveBeenCalled();
    expect(component.loadFacturations).toHaveBeenCalled();
  });

  it('should run initGridOptions correctly', () => {
    component.initGridOptions();
    fixture.detectChanges();

    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should run loadFacturations correctly', () => {
    component.loadFacturations();
    fixture.detectChanges();

    expect(mockApiService.searchFacturationsByFichier).toHaveBeenCalled();
  });

  it('should handle loadFacturations error', () => {
    const error = { graphQLErrors: [{ message: 'Erreur' }] };
    mockApiService.searchFacturationsByFichier.and.returnValue(throwError(error));
    component.loadFacturations();
    fixture.detectChanges();

    expect(component.error).toBeDefined();
  });
});
