import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SearchOccurrenceApplicationComponent } from './search-occurrence-application.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import { of } from 'rxjs';
import { OccurrenceApplicationFilter } from '@app/models/suivi/occurrence-application-interface';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';

describe('SearchOccurrenceApplicationComponent', () => {
  let component: SearchOccurrenceApplicationComponent;
  let fixture: ComponentFixture<SearchOccurrenceApplicationComponent>;
  let apiOccurrenceApplicationService: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
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

  const mockDetailsPeriodes = [
    {
      appsta: 'T',
      dappld: '2025-10-21T12:39:01',
      dapplt: '2025-10-21T12:39:23',
      manuel: false,
      perCod: '251021-01',
    },
    {
      appsta: 'T',
      dappld: '2025-10-19T09:12:04',
      dapplt: '2025-10-19T09:12:20',
      manuel: false,
      perCod: '251019-01',
    },
  ];
  const mockAllSitesCNP = [{ code: 'CIRTIL' }, { code: 'CIRSO' }];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['getDistinctEnvOrgAppFromGenapp', 'getDetailsPeriodeFromGenApp']);
    const sessionSpy = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession']);

    await TestBed.configureTestingModule({
      declarations: [SearchOccurrenceApplicationComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiAdelaideOccurenceApplicationService, useValue: apiSpy },
        { provide: SessionDataSearchService, useValue: sessionSpy },
      ],
    }).compileComponents();

    apiOccurrenceApplicationService = TestBed.inject(
      ApiAdelaideOccurenceApplicationService
    ) as jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
    sessionDataSearchService = TestBed.inject(SessionDataSearchService) as jasmine.SpyObj<SessionDataSearchService>;

    apiOccurrenceApplicationService.getDistinctEnvOrgAppFromGenapp.and.returnValue(
      of({
        data: {
          getDistinctEnvOrgAppFromGenapp: mockDistinctEnvOrgApp,
          allOrganismes: mockAllOrganismes,
          allSitesCNP: mockAllSitesCNP,
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    fixture = TestBed.createComponent(SearchOccurrenceApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    fixture.detectChanges();
    expect(component.form).toBeDefined();
    expect(component.formEnv.value).toBe('');
    expect(component.formApp.value).toBe('');
    expect(component.formPeriode.value).toBe('');
    expect(component.formSite.value).toBe('');
  });

  it('should load initial data and populate environment options', () => {
    fixture.detectChanges();
    expect(apiOccurrenceApplicationService.getDistinctEnvOrgAppFromGenapp).toHaveBeenCalled();
    expect(component.optionsEnv().length).toBeGreaterThan(0);
    expect(component.optionsEnv()).toContain('P');
    expect(component.optionsEnv()).toContain('T');
  });

  it('should populate application options after loading data', () => {
    fixture.detectChanges();
    expect(component.optionsApp().length).toBeGreaterThan(0);
    expect(component.optionsApp()).toContain('SNV2');
  });

  it('should fetch periodes when application is selected', fakeAsync(() => {
    apiOccurrenceApplicationService.getDetailsPeriodeFromGenApp.and.returnValue(
      of({
        data: {
          getDetailsPeriodeFromGenApp: mockDetailsPeriodes,
        },
        loading: false,
        networkStatus: 7,
      } as any)
    );

    fixture.detectChanges();
    component.formEnv.setValue('P');
    component.formApp.setValue('SNV2');
    tick(DELAI_VALUE_CHANGE);
    expect(apiOccurrenceApplicationService.getDetailsPeriodeFromGenApp).toHaveBeenCalled();
    expect(component.optionsPeriode().length).toBe(mockDetailsPeriodes.length + 1);
  }));

  it('should populate sites options after loading data', () => {
    fixture.detectChanges();
    expect(component.optionsSite().length).toBeGreaterThan(0);
    expect(component.optionsSite()).toContain('CIRTIL');
  });

  it('should emit applySearchEvent with correct payload when valider is called', () => {
    spyOn(component.applySearchEvent, 'emit');
    fixture.detectChanges();

    component.formEnv.setValue('P');
    component.formApp.setValue('SNV2');
    component.formPeriode.setValue('251021-01');
    component.formSite.setValue('CIRTIL');

    component.valider();

    const expectedPayload: OccurrenceApplicationFilter = {
      codenv: 'P',
      codorgs: null,
      codapp: 'SNV2',
      percod: '251021-01',
      codsit: 'CIRTIL',
    };

    expect(component.applySearchEvent.emit).toHaveBeenCalledWith(expectedPayload);
    expect(sessionDataSearchService.updateDataSearchToSession).toHaveBeenCalled();
  });
});
