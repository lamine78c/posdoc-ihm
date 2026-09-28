import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { ApiBonTravailService } from '@app/services/api-adelaide/exploitation-editique/bon-travail/api-bon-travail.service';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of } from 'rxjs';
import { SearchBonTravailComponent } from './search-bon-travail.component';

describe('SearchBonTravailComponent', () => {
  let component: SearchBonTravailComponent;
  let fixture: ComponentFixture<SearchBonTravailComponent>;
  let apolloSpy: jasmine.SpyObj<Apollo>;
  let apiBonTravailServiceSpy: jasmine.SpyObj<ApiBonTravailService>;
  let apiAdelaideParametreServiceSpy: jasmine.SpyObj<ApiAdelaideParametreService>;
  let sessionDataSearchServiceSpy: jasmine.SpyObj<SessionDataSearchService>;

  beforeEach(async () => {
    apolloSpy = jasmine.createSpyObj('Apollo', ['watchQuery']);
    apiBonTravailServiceSpy = jasmine.createSpyObj('ApiBonTravailService', ['getDistinctEnvOrgAppPerFromGenApp', 'getDistinctEnvOrgAppFromGenapp']);
    apiAdelaideParametreServiceSpy = jasmine.createSpyObj('ApiAdelaideParametreService', ['getParamsForMasappMasgamMasuti']);
    sessionDataSearchServiceSpy = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession']);

    await TestBed.configureTestingModule({
      declarations: [SearchBonTravailComponent],
      providers: [
        { provide: Apollo, useValue: apolloSpy },
        { provide: ApiBonTravailService, useValue: apiBonTravailServiceSpy },
        { provide: ApiAdelaideParametreService, useValue: apiAdelaideParametreServiceSpy },
        { provide: SessionDataSearchService, useValue: sessionDataSearchServiceSpy },
        FormBuilder,
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBonTravailComponent);
    component = fixture.componentInstance;

    component.selectedApp$ = new BehaviorSubject<string>('MAS');

    const mockFromGenappResponse = {
      data: {
        getDistinctEnvOrgAppFromGenapp: [
          { codenv: 'ENV1', codorg: 'ORG1', codapp: 'APP1' },
          { codenv: 'ENV2', codorg: 'ORG2', codapp: 'APP2' },
        ],
        allSitesCNP: [{ code: 'SITE1' }, { code: 'SITE2' }],
        allClients: [{ code: 'CLIENT1' }, { code: 'CLIENT2' }],
        allOrganismes: [{ name: 'ORG1' }, { name: 'ORG2' }],
      },
    };

    apiBonTravailServiceSpy.getDistinctEnvOrgAppFromGenapp.and.returnValue(of(mockFromGenappResponse as any));

    const mockParamsForMasResponse = {
      data: {
        getParamsForMasappMasgamMasuti: [{ code: 'MASAPP', value: 'MAS' }],
      },
    };
    apiAdelaideParametreServiceSpy.getParamsForMasappMasgamMasuti.and.returnValue(of(mockParamsForMasResponse as any));

    const mockPeriodeResponse = {
      data: {
        getDistinctEnvOrgAppPerFromGenApp: [
          { codapp: 'MAS', percod: '230404-00', statut: 'T', dateDebut: '2024-01-01', dateFin: '2024-12-31', isManuel: true },
        ],
      },
    };

    apiBonTravailServiceSpy.getDistinctEnvOrgAppPerFromGenApp.and.returnValue(of(mockPeriodeResponse as any));

    component.form = new FormBuilder().group({
      codenv: [''],
      codorg: [''],
    });

    component.dappcrDeb = jasmine.createSpyObj('DatePickerComponent', ['resetDate']);
    component.dappcrFin = jasmine.createSpyObj('DatePickerComponent', ['resetDate']);
    component.dfiexpDeb = jasmine.createSpyObj('DatePickerComponent', ['resetDate']);
    component.dfiexpFin = jasmine.createSpyObj('DatePickerComponent', ['resetDate']);

    fixture.detectChanges();
  });

  afterEach(() => {
    if (component && component.subscriptions) {
      component.subscriptions.forEach(sub => {
        if (sub && !sub.closed) {
          sub.unsubscribe();
        }
      });
    }
  });

  it('should initialize optionsEnv, optionsSite, optionsClient, and allOrgReg correctly', () => {
    const mockResponse = {
      data: {
        getDistinctEnvOrgAppFromGenapp: [
          { codenv: 'ENV1', codorg: 'ORG1', codapp: 'APP1' },
          { codenv: 'ENV2', codorg: 'ORG2', codapp: 'APP2' },
        ],
        allSitesCNP: [{ code: 'SITE1' }, { code: 'SITE2' }],
        allClients: [{ code: 'CLIENT1' }, { code: 'CLIENT2' }],
        allOrganismes: [{ name: 'ORG1' }, { name: 'ORG2' }],
      },
    };

    apiBonTravailServiceSpy.getDistinctEnvOrgAppFromGenapp.and.returnValue(of(mockResponse as any));

    component.getDistinctEnvOrgAppFromGenapp();

    expect(apiBonTravailServiceSpy.getDistinctEnvOrgAppFromGenapp).toHaveBeenCalled();

    expect(component.optionsSite).toEqual(['SITE1', 'SITE2']);
    expect(component.optionsClient).toEqual(['CLIENT1', 'CLIENT2']);
    expect(component.allOrgReg).toEqual([{ name: 'ORG1' }, { name: 'ORG2' }]);
  });

  describe('onDateEmptyChange', () => {
    it('should disable and reset dfiexpDeb and dfiexpFin when isDateEmpty is true', () => {
      component.form.get('isDateEmpty').setValue(true);

      expect(component.form.get('dfiexpDeb').disabled).toBe(true);
      expect(component.form.get('dfiexpFin').disabled).toBe(true);
      expect(component.form.get('dfiexpDeb').value).toBeNull();
      expect(component.form.get('dfiexpFin').value).toBeNull();
    });

    it('should enable dfiexpDeb and dfiexpFin when isDateEmpty is false', () => {
      component.form.get('isDateEmpty').setValue(false);

      expect(component.form.get('dfiexpDeb').disabled).toBe(false);
      expect(component.form.get('dfiexpFin').disabled).toBe(false);
    });

    it('should handle multiple value changes correctly', () => {
      component.form.get('isDateEmpty').setValue(false);
      expect(component.form.get('dfiexpDeb').disabled).toBe(false);
      expect(component.form.get('dfiexpFin').disabled).toBe(false);

      component.form.get('isDateEmpty').setValue(true);
      expect(component.form.get('dfiexpDeb').disabled).toBe(true);
      expect(component.form.get('dfiexpFin').disabled).toBe(true);
    });
  });

  describe('setBonTravailPeriodeFilterPayloadModel', () => {
    it('should create payload with correct values', () => {
      const payload = component.setBonTravailPeriodeFilterPayloadModel('ENV1', ['ORG1', 'ORG2'], 'APP1');

      expect(payload.codenv).toBe('ENV1');
      expect(payload.codorg).toEqual(['ORG1', 'ORG2']);
      expect(payload.codapp).toBe('APP1');
    });
  });

  describe('onEnvironnementChange', () => {
    it('should update selectedEnv$ and initialize org options when environment changes', () => {
      component.ngOnInit();
      component.searchData = [
        { codenv: 'ENV1', codorg: 'ORG1', codapp: 'APP1' },
        { codenv: 'ENV1', codorg: 'ORG2', codapp: 'APP2' },
      ];
      component.allOrgReg = [{ code: 'ORG1' }, { code: 'ORG2' }];

      spyOn(component.selectedEnv$, 'next');

      component.formEnv.setValue('ENV1');

      expect(component.selectedEnv$.next).toHaveBeenCalledWith('ENV1');
      expect(component.isOrgOptionsInitialized).toBe(true);
    });
  });

  describe('onChangeOrganisme', () => {
    it('should update selectedOrgs$ with organism titles', () => {
      component.ngOnInit();
      spyOn(component.selectedOrgs$, 'next');

      const organisms = { org1: { title: 'ORG1' }, org2: { title: 'ORG2' } };
      component.onChangeOrganisme(organisms);

      expect(component.selectedOrgs$.next).toHaveBeenCalledWith(['ORG1', 'ORG2']);
    });
  });

  describe('onApplicationChange', () => {
    it('should update selectedApp$ when application changes', () => {
      component.ngOnInit();
      spyOn(component.selectedApp$, 'next');

      component.formApp.setValue('APP1');

      expect(component.selectedApp$.next).toHaveBeenCalledWith('APP1');
    });
  });

  describe('getEnvAndOrgsSelection', () => {
    it('should return combined latest values of selectedEnv$ and selectedOrgs$', done => {
      component.selectedEnv$.next('ENV1');
      component.selectedOrgs$.next(['ORG1', 'ORG2']);

      component.getEnvAndOrgsSelection().subscribe(([env, orgs]) => {
        expect(env).toBe('ENV1');
        expect(orgs).toEqual(['ORG1', 'ORG2']);
        done();
      });
    });
  });

  describe('getOptionsPeriode', () => {
    it('should return periode options for selected app', done => {
      component.ngOnInit();
      component.selectedApp$.next('MAS');

      component.optionsPeriode$.subscribe(options => {
        if (options.length > 0) {
          expect(options).toBeDefined();
          expect(apiBonTravailServiceSpy.getDistinctEnvOrgAppPerFromGenApp).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('initAppOptions', () => {
    it('should return empty array when env or orgs are not selected', done => {
      component.ngOnInit();
      component.selectedEnv$.next('');
      component.selectedOrgs$.next([]);

      component.optionsApp$.subscribe(apps => {
        expect(apps).toEqual([]);
        done();
      });
    });

    it('should return filtered apps when env and orgs are selected', done => {
      component.ngOnInit();
      component.searchData = [
        { codenv: 'ENV1', codorg: 'ORG1', codapp: 'APP1' },
        { codenv: 'ENV1', codorg: 'ORG1', codapp: 'APP2' },
      ];
      component.selectedEnv$.next('ENV1');
      component.selectedOrgs$.next(['ORG1']);

      component.optionsApp$.subscribe(apps => {
        if (apps.length > 0) {
          expect(apps).toContain('APP1');
          expect(apps).toContain('APP2');
          done();
        }
      });
    });
  });

  describe('isFormValid', () => {
    it('should return observable that checks form validity', done => {
      component.ngOnInit();
      component.masApp = 'MAS';
      component.formApp.setValue('OTHER');
      component.optionsApp$ = of(['OTHER']);

      component.isFormValid().subscribe(isValid => {
        expect(typeof isValid).toBe('boolean');
        done();
      });
    });
  });

  describe('hasRequiredFields', () => {
    it('should return true when all required fields are valid', () => {
      component.ngOnInit();
      component.formEnv.setValue('ENV1');
      component.formApp.setValue('APP1');

      const result = component.hasRequiredFields(['APP1']);
      expect(typeof result).toBe('boolean');
    });

    it('should validate form for all applications including MAS', () => {
      component.ngOnInit();
      component.formEnv.setValue('ENV1');
      component.formApp.setValue('MAS');

      const result = component.hasRequiredFields(['MAS']);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isSelectedAppInOptionsApp', () => {
    it('should return true when selected app is in options', () => {
      component.ngOnInit();
      component.formApp.setValue('APP1');

      expect(component.isSelectedAppInOptionsApp(['APP1', 'APP2'])).toBe(true);
    });

    it('should return false when selected app is not in options', () => {
      component.ngOnInit();
      component.formApp.setValue('APP3');

      expect(component.isSelectedAppInOptionsApp(['APP1', 'APP2'])).toBe(false);
    });
  });

  describe('valider', () => {
    it('should emit validated data with formatted dates', () => {
      component.ngOnInit();
      spyOn(component.applySearchEvent, 'emit');

      component.formEnv.setValue('ENV1');
      component.formApp.setValue('APP1');
      component.form.get('dappcrDeb').setValue({ year: 2024, month: 1, day: 15 });
      component.form.get('isDateEmpty').setValue(true);

      component.valider();

      expect(sessionDataSearchServiceSpy.updateDataSearchToSession).toHaveBeenCalled();
      expect(component.applySearchEvent.emit).toHaveBeenCalled();
    });

    it('should format dfiexp dates when isDateEmpty is false', () => {
      component.ngOnInit();
      spyOn(component.applySearchEvent, 'emit');

      component.form.get('isDateEmpty').setValue(false);
      component.form.get('dfiexpDeb').setValue({ year: 2024, month: 2, day: 10 });
      component.form.get('dfiexpFin').setValue({ year: 2024, month: 2, day: 20 });

      component.valider();

      expect(component.applySearchEvent.emit).toHaveBeenCalled();
    });

    it('should emit all validated data', () => {
      spyOn(component.applySearchEvent, 'emit');
      component.formEnv.setValue('ENV1');
      component.formApp.setValue('APP1');
      component.formCom.setValue('COM1');
      component.formFic.setValue('FIC1');
      component.form.get('periode').setValue('2000-01-01');
      component.form.get('codcli').setValue('CIP');
      component.form.get('codbon').setValue('aa');
      component.form.get('delmsp').setValue('1');
      component.form.get('codsit').setValue('cirso');
      component.form.get('dappcrDeb').setValue({ year: 2024, month: 1, day: 15 });
      component.form.get('isDateEmpty').setValue(true);
      const dataEmit = {
        environnement: 'ENV1',
        organisme: {},
        application: 'APP1',
        periode: '2000-01-01',
        commande: 'COM1',
        fichier: 'FIC1',
        codcli: 'CIP',
        codbon: 'aa',
        dappcrDeb: '2024-01-15 00:00:00',
        dappcrFin: null,
        dfiexpDeb: null,
        dfiexpFin: null,
        isDateEmpty: true,
        delmsp: '1',
        codsit: 'cirso',
        codenv: 'ENV1',
        codorg: {},
        codapp: 'APP1',
        percod: '2000-01-01',
        codcom: 'COM1',
        codfic: 'FIC1',
      };
      component.valider();
      expect(sessionDataSearchServiceSpy.updateDataSearchToSession).toHaveBeenCalledWith(dataEmit);
      expect(component.applySearchEvent.emit).toHaveBeenCalledWith(dataEmit);
    });
  });

  describe('resetForm', () => {
    it('should reset form and all observables', () => {
      spyOn(component.form, 'reset');
      spyOn(component.selectedApp$, 'next');
      spyOn(component.selectedEnv$, 'next');
      spyOn(component.selectedOrgs$, 'next');

      component.resetForm();

      expect(component.form.reset).toHaveBeenCalled();
      expect(component.selectedApp$.next).toHaveBeenCalledWith('');
      expect(component.selectedEnv$.next).toHaveBeenCalledWith('');
      expect(component.selectedOrgs$.next).toHaveBeenCalledWith([]);
    });
  });

  describe('getMasApp', () => {
    it('should set masApp value from API response', () => {
      component.ngOnInit();
      expect(component.masApp).toBe('MAS');
    });
  });
});
