import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchParametreEditionColonneComponent } from './search-parametre-edition-colonne.component';
import { Apollo } from 'apollo-angular';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client';
import { DistFicByEnvOrgAppComFromExemplaireInterface } from '@app/models/fichier';
import { SearchRessourceByEnvOrgApComFicInterface } from '@app/exploitation-editique/reedition/reedition-produit/model/data-ressource';
import { filter } from 'rxjs/operators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';

describe('SearchParametreEditionColonneComponent', () => {
  let component: SearchParametreEditionColonneComponent;
  let fixture: ComponentFixture<SearchParametreEditionColonneComponent>;
  let apolloSpy: jasmine.SpyObj<Apollo>;
  let apiDistributionServiceSpy: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let apiFichierServiceSpy: jasmine.SpyObj<ApiAdelaideFichierService>;
  let sessionDataSearchServiceSpy: jasmine.SpyObj<SessionDataSearchService>;

  beforeEach(async () => {
    apolloSpy = jasmine.createSpyObj('Apollo', ['watchQuery']);
    sessionDataSearchServiceSpy = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession']);
    apiDistributionServiceSpy = jasmine.createSpyObj('ApiAdelaideDistributionService', [
      'getDistinctEnvsFromExemplaire',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'getDistComsByEnvOrgApp',
      'getDistFicsByEnvOrgAppCom',
      'getDistRessourceByEnvOrgAppComFic',
    ]);
    apiFichierServiceSpy = jasmine.createSpyObj('ApiAdelaideFichierService', [
      'getDistinctEnvironnements',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'getDistComsByEnvOrgApp',
      'getSearchFichierFilterQuery',
    ]);

    await TestBed.configureTestingModule({
      declarations: [SearchParametreEditionColonneComponent],
      providers: [
        { provide: Apollo, useValue: apolloSpy },
        { provide: ApiAdelaideDistributionService, useValue: apiDistributionServiceSpy },
        { provide: ApiAdelaideFichierService, useValue: apiFichierServiceSpy },
        { provide: SessionDataSearchService, useValue: sessionDataSearchServiceSpy },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchParametreEditionColonneComponent);
    component = fixture.componentInstance;

    const mockSearchEnvsResponse = {
      data: {
        getDistinctEnvsFromFichier: ['P', 'T', 'I'],
      },
    };
    apiFichierServiceSpy.getDistinctEnvironnements.and.returnValue(
      of(mockSearchEnvsResponse as ApolloQueryResult<{ getDistinctEnvsFromFichier: string[] }>)
    );

    const mockSearchOrgsResponse = {
      data: {
        getDistOrgByEnvFromFichier: ['00L', '117'],
        allOrganismes: [
          { code: '00L', libelle: 'Organisme de massification Lyon', codeRegion: null },
          { code: '117', libelle: 'URSSAF REGIONALE ILE DE FRANCE', codeRegion: '117' },
        ],
      },
      loading: false,
      networkStatus: 7,
      stale: false,
    };

    apiFichierServiceSpy.getDistinctOrgsByEnvs.and.returnValue(of(mockSearchOrgsResponse as any));

    const mockSearchAppResponse = {
      data: {
        getDistAppByEnvOrgFromFichier: ['SRCB', 'SNV2'],
      },
    };
    apiFichierServiceSpy.getDistAppsByEnvOrg.and.returnValue(of(mockSearchAppResponse as any));

    const mockSearchComResponse = {
      data: {
        getDistComByEnvOrgAppFromFichier: ['AD04'],
      },
    };
    apiFichierServiceSpy.getDistComsByEnvOrgApp.and.returnValue(of(mockSearchComResponse as any));

    const mockSearchFicResponse = {
      data: {
        getDistFicByEnvOrgAppComFromExemplaire: [{ codfic: 'L00', refImprime: 'QDI9A09', codeProd: 'QDI9A' }],
      },
    };
    apiDistributionServiceSpy.getDistFicsByEnvOrgAppCom.and.returnValue(
      of(mockSearchFicResponse as ApolloQueryResult<DistFicByEnvOrgAppComFromExemplaireInterface>)
    );

    const mockSearchRessourceResponse = {
      data: {
        getDistRessourceByEnvOrgAppComFicFromExemplaire: [{ codgam: 'MA', codsit: 'CIRSO', codres: 'MASSI' }],
      },
    };
    apiDistributionServiceSpy.getDistRessourceByEnvOrgAppComFic.and.returnValue(
      of(mockSearchRessourceResponse as ApolloQueryResult<SearchRessourceByEnvOrgApComFicInterface>)
    );

    component.form = new FormBuilder().group({
      codenv: [''],
      codorg: [''],
      codapp: [''],
      percod: [''],
      codcom: [''],
      codfic: [''],
      codsit: [''],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize options for environment', () => {
    expect(apiFichierServiceSpy.getDistinctEnvironnements).toHaveBeenCalled();
    component.optionsEnv$.subscribe(options => {
      expect(options).toEqual(['P', 'T', 'I']);
    });
  });

  it('should initialize options for other fields when selecting values', () => {
    component.formEnv.setValue('P');
    expect(apiFichierServiceSpy.getDistinctOrgsByEnvs).toHaveBeenCalled();
    expect(Object.keys(component.formOrg.controls).length).toEqual(2);

    component.optionsApp$.pipe(filter(options => options.length > 0)).subscribe(options => {
      expect(apiFichierServiceSpy.getDistAppsByEnvOrg).toHaveBeenCalled();
      expect(options.length).toEqual(2);
      expect(options[1]).toEqual('SNV2');
    });
    component.optionsCom$.pipe(filter(options => options.length > 0)).subscribe(options => {
      expect(apiFichierServiceSpy.getDistComsByEnvOrgApp).toHaveBeenCalled();
      expect(options.length).toEqual(1);
      expect(options[0]).toEqual('AD04');
    });
    component.optionsFic$.pipe(filter(options => options.length > 0)).subscribe(options => {
      expect(apiDistributionServiceSpy.getDistFicsByEnvOrgAppCom).toHaveBeenCalled();
      expect(options.length).toEqual(1);
      const option = options[0];
      expect(option.value).toEqual('L00');
      expect(option.columns[1].value).toEqual('QDI9A');
    });
    component.formOrg.setValue({ '00L-null': { '00L': false }, '117': { '117': true } });
    component.formApp.setValue('SNV2');
    component.formCom.setValue('AD04');
    component.formFic.setValue(['L00']);
    expect(apiDistributionServiceSpy.getDistRessourceByEnvOrgAppComFic).toHaveBeenCalled();
    expect(Object.keys(component.formRes.controls).length).toEqual(1);
    expect(Object.keys(component.formRes.controls)[0]).toEqual('MA/CIRSO/MASSI');
  });

  it('onChangeResource validity', () => {
    component.onChangeResource([{ title: 'ress1' }, { title: 'ress2' }]);
    expect(component.selectedRes).toEqual(['ress1', 'ress2']);
  });

  it('onChangeOrganisme validity', () => {
    component.onChangeOrganisme({ org1: { title: 'org1' }, org2: { title: 'org2' } });
    component.selectedOrgs$.subscribe(org => expect(org).toEqual(['org1', 'org2']));
  });

  it('valider validity', () => {
    const emitSpy = spyOn(component.applySearchEvent, 'emit');
    component.selectedOrgs = ['117'];
    component.selectedRes = ['ress'];
    component.form = new FormBuilder().group({
      environnement: 'p',
      application: 'app',
      periode: '2222-11-11',
      commande: 'com',
      fichier: ['fic'],
      site: 'sit',
      message: 'mess',
    });
    component.valider();
    expect(sessionDataSearchServiceSpy.updateDataSearchToSession).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });
});
