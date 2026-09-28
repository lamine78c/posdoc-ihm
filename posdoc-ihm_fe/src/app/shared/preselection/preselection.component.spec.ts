import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { of } from 'rxjs';
import { ArrayUtil } from '../utils/ArrayUtil';
import { SessionDataSearchService } from '../utils/session-data-search.service';
import { PreselectionComponent } from './preselection.component';

describe('PreselectionComponent', () => {
  let component: PreselectionComponent;
  let fixture: ComponentFixture<PreselectionComponent>;
  let sessionDataSearchServiceSpy: jasmine.SpyObj<SessionDataSearchService>;
  let apiAdelaideDistributionServiceSpy: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let filterSharedDataServiceSpy: jasmine.SpyObj<FilterSharedDataService>;
  let apiAdelaideFichierServiceSpy: jasmine.SpyObj<ApiAdelaideFichierService>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    filterSharedDataServiceSpy = jasmine.createSpyObj('FilterSharedDataService', ['getData']);
    sessionDataSearchServiceSpy = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession']);
    apiAdelaideDistributionServiceSpy = jasmine.createSpyObj('ApiAdelaideDistributionService', ['getDistFicsByEnvOrgAppCom']);
    apiAdelaideFichierServiceSpy = jasmine.createSpyObj('ApiAdelaideFichierService', [
      'getDistinctEnvironnements',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'getDistComsByEnvOrgApp',
      'getSearchFichierFilterQuery',
    ]);

    TestBed.configureTestingModule({
      declarations: [PreselectionComponent],
      providers: [
        { provide: SessionDataSearchService, useValue: sessionDataSearchServiceSpy },
        { provide: ApiAdelaideDistributionService, useValue: apiAdelaideDistributionServiceSpy },
        { provide: FilterSharedDataService, useValue: filterSharedDataServiceSpy },
        { provide: ApiAdelaideFichierService, useValue: apiAdelaideFichierServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    filterSharedDataServiceSpy.getData.and.returnValue(of(false));

    fixture = TestBed.createComponent(PreselectionComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.form = fb.group({
      [component.formName.ENVIRONNEMENT]: fb.group({}),
      [component.formName.ORGANISME]: fb.group({}),
      [component.formName.APPLICATION]: [''],
      [component.formName.COMMANDE]: [''],
      [component.formName.FICHIER]: [''],
    });
    spyOn(component.selectedEnvironnements, 'emit');
    fixture.detectChanges();
  });

  it('should create with defaut param', fakeAsync(() => {
    tick(500);
    expect(component).toBeTruthy();
    expect(component.isDistribution).toBeFalsy();
    expect(component.isWithoutCommandeOptions).toBeFalsy();
    expect(component.isWithoutFichierOptions).toBeFalsy();
    expect(component.isEnvOptionsInitialized).toBeFalsy();
    expect(component.isOrgOptionsInitialized).toBeFalsy();
    expect(component.isFicInList).toBeFalsy();
    expect(component.isFormValid()).toBeFalsy();
    expect(component.isSearchDisabled).toBeFalsy();
  }));

  it('should create without commande and fichier and follow validator', fakeAsync(() => {
    component.isWithoutCommandeOptions = true;
    component.isWithoutFichierOptions = true;
    component.applicationOptions = ['MAS', 'SNV2'];
    component.isEnvOptionsInitialized = true;
    component.isOrgOptionsInitialized = true;
    component.formApp.setValue('SNV2d');
    tick(500);
    expect(component.isFormApplicationValid()).toBeFalsy();
    expect(component.isFormValid()).toBeFalsy();
    component.formApp.setValue('SNV2');
    expect(component.isFormApplicationValid()).toBeTruthy();
    expect(component.isFormValid()).toBeTruthy();
  }));

  it('should create with distribution param and follow valuechange event', fakeAsync(() => {
    component.isDistribution = true;
    apiAdelaideFichierServiceSpy.getSearchFichierFilterQuery.and.returnValue({
      codenvs: [],
      codorgs: [],
      codapp: '',
      codcom: '',
    });
    apiAdelaideFichierServiceSpy.getDistinctEnvironnements.and.returnValue(
      of({
        data: {
          getDistinctEnvsFromFichier: ['P', 'T'],
          allOrganismes: [
            { code: '00L', libelle: 'ORGANISME DE MASSIFICATION LYON', codeRegion: null, codeSite: 'CIRTIL' },
            { code: '691', libelle: 'URSSAF DU RHONE SITE DE LYON', codeRegion: '827', codeSite: 'CIRTIL' },
          ],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    apiAdelaideFichierServiceSpy.getDistinctOrgsByEnvs.and.returnValue(
      of({
        data: {
          getDistOrgByEnvFromFichier: ['00L', '691'],
          allOrganismes: [
            { code: '00L', libelle: 'ORGANISME DE MASSIFICATION LYON', codeRegion: null, codeSite: 'CIRTIL' },
            { code: '691', libelle: 'URSSAF DU RHONE SITE DE LYON', codeRegion: '827', codeSite: 'CIRTIL' },
          ],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    apiAdelaideFichierServiceSpy.getDistAppsByEnvOrg.and.returnValue(
      of({
        data: {
          getDistAppByEnvOrgFromFichier: ['SNV2', 'MAS'],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    apiAdelaideFichierServiceSpy.getDistComsByEnvOrgApp.and.returnValue(
      of({
        data: {
          getDistComByEnvOrgAppFromFichier: ['COM1', 'COM2'],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    apiAdelaideDistributionServiceSpy.getDistFicsByEnvOrgAppCom.and.returnValue(
      of({
        data: {
          getDistFicByEnvOrgAppComFromExemplaire: [
            {
              codfic: 'L00',
              refImprime: 'QDI9A11',
              codeProd: 'QDI9A',
            },
            {
              codfic: 'L01',
              refImprime: 'QDI9A01',
              codeProd: 'QDI9B',
            },
          ],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    component.ngOnInit();
    tick(500);
    expect(apiAdelaideFichierServiceSpy.getDistinctEnvironnements).toHaveBeenCalled();
    expect(component.isEnvOptionsInitialized).toBeTruthy();
    component.formEnv.setValue({ P: [true], T: [false] });
    expect(apiAdelaideFichierServiceSpy.getDistinctOrgsByEnvs).toHaveBeenCalled();
    expect(component.isOrgOptionsInitialized).toBeTruthy();
    component.onChangeOrganisme([
      {
        title: '691',
        selected: true,
      },
    ]);
    expect(apiAdelaideFichierServiceSpy.getDistAppsByEnvOrg).toHaveBeenCalled();
    expect(component.applicationOptions).toEqual(['SNV2', 'MAS']);
    component.formApp.setValue('SNV2');
    expect(apiAdelaideFichierServiceSpy.getDistComsByEnvOrgApp).toHaveBeenCalled();
    expect(component.commandeOptions).toEqual(['COM1', 'COM2']);
    component.formCom.setValue('COM1');
    expect(apiAdelaideDistributionServiceSpy.getDistFicsByEnvOrgAppCom).toHaveBeenCalled();
    expect(component.fichierOptions).toEqual([
      {
        value: '',
        columns: [
          { label: 'Fichier', value: '' },
          { label: 'Code Prd', value: '' },
          { label: 'Imprimé', value: '' },
        ],
      },
      {
        value: 'L00',
        columns: [
          { label: 'Fichier', value: 'L00' },
          { label: 'Code Prd', value: 'QDI9A' },
          { label: 'Imprimé', value: 'QDI9A11' },
        ],
      },
      {
        value: 'L01',
        columns: [
          { label: 'Fichier', value: 'L01' },
          { label: 'Code Prd', value: 'QDI9B' },
          { label: 'Imprimé', value: 'QDI9A01' },
        ],
      },
    ]);
  }));

  it('selecteur commande should not be required when one region selected in distribution form', done => {
    spyOn(ArrayUtil, 'isSelectedOrgsInOneRegion').and.returnValue(true);
    component.distributionValueChangeOrg({});
    setTimeout(() => {
      expect(component.isFormCommandeValid()).toBeTruthy();
      done();
    });
  });

  it('selecteur commande should be required when multi region selected in distribution form', done => {
    spyOn(ArrayUtil, 'isSelectedOrgsInOneRegion').and.returnValue(false);
    component.distributionValueChangeOrg({});
    setTimeout(() => {
      expect(component.isFormCommandeValid()).toBeFalsy();
      done();
    });
  });

  it('isSearchDisabled should be true when filterSharedDataService receive true in getData ', fakeAsync(() => {
    filterSharedDataServiceSpy.getData.and.returnValue(of(true));
    component.ngOnInit();
    tick(500);
    expect(component.isSearchDisabled).toBeTruthy();
  }));
});
