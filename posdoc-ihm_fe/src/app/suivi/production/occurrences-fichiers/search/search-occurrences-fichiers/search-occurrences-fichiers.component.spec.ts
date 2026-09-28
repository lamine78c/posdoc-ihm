import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchOccurrencesFichiersComponent } from './search-occurrences-fichiers.component';
import { ApiAdelaideReeditionProduitService } from '@app/services/api-adelaide-reedition-produit.service';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import { of, throwError } from 'rxjs';
import { OccurrencesFichiersFilters } from '@app/models/suivi/occurrence-fichier.model';
import { PeriodeInterface } from '@app/models/supervision/production/details/periode-interface';

describe('SearchOccurrencesFichiersComponent', () => {
  let component: SearchOccurrencesFichiersComponent;
  let fixture: ComponentFixture<SearchOccurrencesFichiersComponent>;
  let apiAdelaideReeditionProduitService: jasmine.SpyObj<ApiAdelaideReeditionProduitService>;
  let apiAdelaideOccurenceApplicationService: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
  let sessionDataSearchService: jasmine.SpyObj<SessionDataSearchService>;

  const mockDistinctEnvOrgApp = [
    { codenv: 'P', codorg: '117', codapp: 'SNV2' },
    { codenv: 'P', codorg: '780', codapp: 'SNV2' },
    { codenv: 'P', codorg: '00L', codapp: 'SNV2' },
    { codenv: 'P', codorg: '00T', codapp: 'SNV2' },
    { codenv: 'T', codorg: '117', codapp: 'APP1' },
  ];

  const mockAllOrganismes = [
    { code: '117', libelle: 'Organisme 117' },
    { code: '780', libelle: 'Organisme 780' },
    { code: '00L', libelle: 'Organisme 00L' },
    { code: '00T', libelle: 'Organisme 00T' },
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiAdelaideReeditionProduitService', ['getDistinctEnvOrgAppFromGenfic', 'getPeriode']);
    const apiOccurrenceApplicationSpy = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['getDetailsPeriodeFromGenApp']);
    const sessionSpy = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession', 'getDataSearchFromSession']);

    await TestBed.configureTestingModule({
      declarations: [SearchOccurrencesFichiersComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiAdelaideReeditionProduitService, useValue: apiSpy },
        { provide: ApiAdelaideOccurenceApplicationService, useValue: apiOccurrenceApplicationSpy },
        { provide: SessionDataSearchService, useValue: sessionSpy },
      ],
    }).compileComponents();

    apiAdelaideReeditionProduitService = TestBed.inject(ApiAdelaideReeditionProduitService) as jasmine.SpyObj<ApiAdelaideReeditionProduitService>;
    apiAdelaideOccurenceApplicationService = TestBed.inject(
      ApiAdelaideOccurenceApplicationService
    ) as jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
    sessionDataSearchService = TestBed.inject(SessionDataSearchService) as jasmine.SpyObj<SessionDataSearchService>;

    apiAdelaideReeditionProduitService.getDistinctEnvOrgAppFromGenfic.and.returnValue(
      of({
        data: {
          getDistinctEnvOrgAppFromGenfic: mockDistinctEnvOrgApp,
          allOrganismes: mockAllOrganismes,
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    // Mock default response for getDetailsPeriodeFromGenApp
    apiAdelaideOccurenceApplicationService.getDetailsPeriodeFromGenApp.and.returnValue(
      of({
        data: {
          getDetailsPeriodeFromGenApp: [],
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    fixture = TestBed.createComponent(SearchOccurrencesFichiersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    fixture.detectChanges();
    expect(component.form).toBeDefined();
    expect(component.formEnv.value).toBe('P');
    expect(component.formApp.value).toBe('');
    expect(component.formPeriode.value).toBe('');
    expect(component.formCom.value).toBe('');
    expect(component.formFic.value).toBe('');
    expect(component.formPrd.value).toBe('');
    expect(component.formSta.value).toBe('');
    expect(component.formImp.value).toBe('');
  });

  it('should load initial data and populate environment options', () => {
    fixture.detectChanges();
    expect(apiAdelaideReeditionProduitService.getDistinctEnvOrgAppFromGenfic).toHaveBeenCalled();
    expect(component.optionsEnv().length).toBeGreaterThan(0);
    expect(component.optionsEnv()).toContain('P');
    expect(component.optionsEnv()).toContain('T');
  });

  it('should populate application options after loading data', () => {
    fixture.detectChanges();
    expect(component.optionsApp().length).toBeGreaterThan(0);
    expect(component.optionsApp()).toContain('SNV2');
  });

  it('should update organisme options when environment changes', done => {
    fixture.detectChanges();
    component.formEnv.setValue('P');

    setTimeout(() => {
      expect(component.isOrgOptionsInitialized).toBe(true);
      expect(component.formOrg).toBeDefined();
      done();
    }, 100);
  });

  it('should fetch periodes when application is selected', done => {
    const mockPeriodesData: PeriodeInterface[] = [
      { perCod: '251002-M0', appsta: 'TERMINE', dappld: new Date(), dapplt: new Date(), manuel: true },
      { perCod: '251002-M0', appsta: 'HISTO', dappld: new Date(), dapplt: new Date(), manuel: true },
      { perCod: '251001-M0', appsta: 'TERMINE', dappld: new Date(), dapplt: new Date(), manuel: true },
      { perCod: '250012-M0', appsta: 'TERMINE', dappld: new Date(), dapplt: new Date(), manuel: true },
    ];

    apiAdelaideOccurenceApplicationService.getDetailsPeriodeFromGenApp.and.returnValue(
      of({
        data: {
          getDetailsPeriodeFromGenApp: mockPeriodesData,
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );
    fixture.detectChanges();
    component.formEnv.setValue('P');
    component.formApp.setValue('SNV2');

    setTimeout(() => {
      expect(apiAdelaideOccurenceApplicationService.getDetailsPeriodeFromGenApp).toHaveBeenCalledWith({
        codEnv: 'P',
        codOrgs: [],
        codApp: 'SNV2',
        isManuel: true,
      });
      expect(component.optionsPeriode().length).toBe(4);
      expect(component.optionsPeriode().find(e => e.value == '')).toEqual({
        value: '',
        columns: [
          { label: 'Période', value: '' },
          { label: 'Statut', value: '' },
          { label: 'Débuté', value: '' },
          { label: 'Terminé', value: '' },
        ],
      });
      expect(component.optionsPeriode().find(e => e.value == '251002-M0')).toEqual({
        value: '251002-M0',
        columns: [
          { label: 'Période', value: '251002-M0' },
          { label: 'Statut', value: '' },
          { label: 'Débuté', value: '' },
          { label: 'Terminé', value: '' },
        ],
      });
      done();
    }, 600);
  });

  it('should validate form correctly when required fields are filled', () => {
    fixture.detectChanges();
    expect(component.isFormValid()).toBe(true);
  });

  it('should emit applySearchEvent with correct payload when valider is called', () => {
    spyOn(component.applySearchEvent, 'emit');
    fixture.detectChanges();

    component.formEnv.setValue('P');
    component.formApp.setValue('SNV2');
    component.formPeriode.setValue('251002-M0');
    component.formCom.setValue('AD04');
    component.formFic.setValue(' ');
    component.formPrd.setValue('QDI9A');
    component.formSta.setValue('T');
    component.formImp.setValue('V90');

    component.valider();

    const expectedPayload: OccurrencesFichiersFilters = {
      codenv: 'P',
      codorg: null,
      codapp: 'SNV2',
      percod: '251002-M0',
      codcom: '%AD04%',
      codfic: null,
      codprd: '%QDI9A%',
      codsta: 'T',
      refimp: '%V90%',
    };

    expect(component.applySearchEvent.emit).toHaveBeenCalledWith(expectedPayload);
    expect(sessionDataSearchService.updateDataSearchToSession).toHaveBeenCalled();
  });

  it('should build search payload with null values for empty optional fields', () => {
    spyOn(component.applySearchEvent, 'emit');
    fixture.detectChanges();
    component.formEnv.setValue('P');

    component.valider();

    expect(component.applySearchEvent.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        codenv: 'P',
        codapp: null,
        percod: null,
        codcom: null,
        codfic: null,
        codprd: null,
        codsta: null,
        refimp: null,
      })
    );
  });

  it('should handle API error gracefully when loading initial data', () => {
    apiAdelaideReeditionProduitService.getDistinctEnvOrgAppFromGenfic.and.returnValue(throwError({ error: 'API Error' }));

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should not auto-trigger search when fichier, codprd or codsta changes', () => {
    spyOn(component.applySearchEvent, 'emit');
    fixture.detectChanges();

    component.formPrd.setValue('QDI9A');
    component.formSta.setValue('T');
    component.formFic.setValue('L00');

    expect(component.applySearchEvent.emit).not.toHaveBeenCalled();
  });
});
