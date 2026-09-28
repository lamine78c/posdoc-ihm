import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { SearchCommande } from '@app/models/searchCommande';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { of } from 'rxjs';
import { SearchCommandeCompareModalComponent } from './search-commande-compare-modal.component';

describe('SearchCommandeCompareModalComponent', () => {
  let component: SearchCommandeCompareModalComponent;
  let fixture: ComponentFixture<SearchCommandeCompareModalComponent>;
  let mockApiAdelaideCommandeService: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let fb: FormBuilder;

  const responseApps = {
    data: {
      getDistAppByEnvsFromCommande: ['MAS', 'SNV2'],
    },
    loading: false,
    networkStatus: 7,
  };

  const responseOrgs = {
    data: {
      getDistOrgByEnvsAndAppsFromCommande: ['117', '116'],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiAdelaideCommandeService = jasmine.createSpyObj('ApiAdelaideCommandeService', ['getDistOrgsByEnvApp', 'getDistAppsByEnvsFromCommande']);
    TestBed.configureTestingModule({
      declarations: [SearchCommandeCompareModalComponent],
      providers: [FormBuilder, { provide: ApiAdelaideCommandeService, useValue: mockApiAdelaideCommandeService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockApiAdelaideCommandeService.getDistAppsByEnvsFromCommande.and.returnValue(of(responseApps));
    mockApiAdelaideCommandeService.getDistOrgsByEnvApp.and.returnValue(of(responseOrgs));
    fixture = TestBed.createComponent(SearchCommandeCompareModalComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.environnementList = ['P', 'T', 'D', 'I'];
    component.allOrgReg = [
      {
        code: '117',
        libelle: '117',
        codeRegion: '117',
      },
      {
        code: '116',
        libelle: '116',
        codeRegion: '116',
      },
      {
        code: '00L',
        libelle: '00L',
        codeRegion: '',
      },
      {
        code: '00T',
        libelle: '00T',
        codeRegion: '',
      },
    ];
    fixture.detectChanges();
  });

  it('should init form on ngOnInit', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.form).toBeDefined();
    expect(Object.keys(component.formEnv.controls).length).toEqual(4);
  });

  it('should debounce environment changes and process only the last one', fakeAsync(() => {
    const event1 = [{ title: 'ENV1', selected: true }];
    const event2 = [{ title: 'ENV2', selected: true }];
    const event3 = [{ title: 'ENV3', selected: false }];
    spyOn(component, 'doChangeEnvCompare');
    component.onChangeEnvCompare(event1);
    tick(100);
    component.onChangeEnvCompare(event2);
    tick(100);
    component.onChangeEnvCompare(event3);
    tick(DELAI_VALUE_CHANGE);

    expect(component['doChangeEnvCompare']).toHaveBeenCalledTimes(1);
    expect(component['doChangeEnvCompare']).toHaveBeenCalledWith(event3);
  }));

  it('doChangeEnvCompare validity', () => {
    spyOn(component, 'onChangeApplication');
    const envEvent = [{ title: 'P', selected: true }];
    component.appOptSelected = ['MAS', 'APP1'];
    const envSelected = ['P'];
    const appSelected = ['MAS'];
    const appEvent = [{ title: 'MAS', selected: true }];
    component.doChangeEnvCompare(envEvent);

    expect(component.envOptSelected).toEqual(envSelected);
    expect(mockApiAdelaideCommandeService.getDistAppsByEnvsFromCommande).toHaveBeenCalledWith(envSelected);
    expect(component.applicationList).toEqual(responseApps.data.getDistAppByEnvsFromCommande);
    expect(component.appOptSelected).toEqual(appSelected);
    expect(Object.keys(component.formApp.controls).length).toEqual(2);
    expect(component.onChangeApplication).toHaveBeenCalledWith(appEvent);
  });

  it('should debounce environment changes and process only the last one', fakeAsync(() => {
    const event1 = [{ title: 'APP1', selected: true }];
    const event2 = [{ title: 'APP2', selected: true }];
    const event3 = [{ title: 'APP3', selected: false }];
    spyOn(component, 'doChangeApplication');
    component.onChangeApplication(event1);
    tick(100);
    component.onChangeApplication(event2);
    tick(100);
    component.onChangeApplication(event3);
    tick(DELAI_VALUE_CHANGE);

    expect(component['doChangeApplication']).toHaveBeenCalledTimes(1);
    expect(component['doChangeApplication']).toHaveBeenCalledWith(event3);
  }));

  it('doChangeApplication validity', () => {
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    const event = [{ title: 'SNV2', selected: true }];
    component.envOptSelected = ['P'];
    component.orgOptSelected = ['117', '00L'];
    const appSelected = ['SNV2'];
    const orgSelected = ['117'];
    component.doChangeApplication(event);

    expect(component.appOptSelected).toEqual(appSelected);
    expect(mockApiAdelaideCommandeService.getDistOrgsByEnvApp).toHaveBeenCalledWith(component.envOptSelected, component.appOptSelected);
    expect(component.orgOptSelected).toEqual(orgSelected);
    expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
  });

  it('onChangeOrganisme validity', () => {
    component.onChangeOrganisme([{ title: '117' }, { title: '116' }]);
    fixture.detectChanges();

    const orgOptSelected = ['117', '116'];
    expect(component.orgOptSelected).toEqual(orgOptSelected);
  });

  it('lister validity', () => {
    spyOn(component.applyCommandeEvent, 'emit');
    component.envOptSelected = [];
    component.orgOptSelected = [];
    component.appOptSelected = [];

    component.lister();
    fixture.detectChanges();

    const searchCommande: SearchCommande = new SearchCommande();
    searchCommande.codesEnvironnement = component.envOptSelected;
    searchCommande.codesOrganisme = component.orgOptSelected;
    searchCommande.codesApplication = component.appOptSelected;
    expect(component.applyCommandeEvent.emit).toHaveBeenCalledWith(searchCommande);
  });
});
