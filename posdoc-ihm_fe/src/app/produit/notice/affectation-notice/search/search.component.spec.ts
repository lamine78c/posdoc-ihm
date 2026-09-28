import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { of } from 'rxjs';

import { PopupErreurComponent } from '@app/admin/popup/popup-erreur/popup-erreur.component';
import { DELAI_VALUE_CHANGE_LONG } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchComponent } from './search.component';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let apiNoticesServiceMock: jasmine.SpyObj<ApiNoticesService>;
  let apiAdelaideFichierServiceMock: jasmine.SpyObj<ApiAdelaideFichierService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let sessionDataSearchServiceMock: jasmine.SpyObj<SessionDataSearchService>;

  beforeEach(waitForAsync(() => {
    apiNoticesServiceMock = jasmine.createSpyObj('ApiNoticesService', ['getOnlyActiveNotices']);
    apiAdelaideFichierServiceMock = jasmine.createSpyObj('ApiAdelaideFichierService', [
      'getDistinctEnvironnements',
      'getDistinctOrgsByEnvs',
      'getDistAppsByEnvOrg',
      'getDistinctOrgsNoMasByEnvs',
      'getDistComsByEnvOrgApp',
      'findFicPrdImpByEnvOrgAppCom',
    ]);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);
    sessionDataSearchServiceMock = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession']);

    TestBed.configureTestingModule({
      declarations: [SearchComponent],
      providers: [
        { provide: ApiNoticesService, useValue: apiNoticesServiceMock },
        { provide: ApiAdelaideFichierService, useValue: apiAdelaideFichierServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: SessionDataSearchService, useValue: sessionDataSearchServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    const mockResponseGetOnlyActiveNotices: { data: { allActiveNotices: {} } } = {
      data: {
        allActiveNotices: [
          {
            codnot: 'codnot',
            libnot: 'libnot',
          },
        ],
      },
    };
    apiNoticesServiceMock.getOnlyActiveNotices.and.returnValue(of(mockResponseGetOnlyActiveNotices as any));
    const mockResponseGetDistinctEnvironnements: { data: { getDistinctEnvsFromFichier: {}; allOrganismes: {} } } = {
      data: {
        getDistinctEnvsFromFichier: ['P'],
        allOrganismes: [
          {
            code: 't',
            libelle: 't',
            codeRegion: 't',
          },
        ],
      },
    };
    apiAdelaideFichierServiceMock.getDistinctEnvironnements.and.returnValue(of(mockResponseGetDistinctEnvironnements as any));

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('relanceSearchAffNot validity', done => {
    // send without warning
    component.isSomeChangeNotSubmited = false;
    component.relanceSearchAffNot();
    // send with warning
    component.isSomeChangeNotSubmited = true;
    const fakeModalRef = {
      componentInstance: { messages: [] },
      result: Promise.reject(2),
    } as any;
    modalServiceMock.open.and.returnValue(fakeModalRef);
    spyOn(component, 'send');
    component.relanceSearchAffNot();
    expect(modalServiceMock.open).toHaveBeenCalledWith(PopupErreurComponent);
    expect(fakeModalRef.componentInstance.messages).toEqual([
      'Changement non sauvegardé',
      'Des modifications non enregistrées ont été détectées.',
      'Êtes-vous sûr de vouloir relancer la recherche ?',
    ]);
    setTimeout(() => {
      expect(component.send).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('on change value of form validity', fakeAsync(() => {
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    const mockDistOrgResponse = {
      data: {
        getDistOrgNoMasByEnvFromFichier: ['117'],
        allOrganismes: [
          {
            code: '117',
            libelle: '117',
            codeRegion: '117',
          },
        ],
      },
    };
    apiAdelaideFichierServiceMock.getDistinctOrgsNoMasByEnvs.and.returnValue(of(mockDistOrgResponse as any));
    const mockDistAppResponse = {
      data: {
        getDistAppByEnvOrgFromFichier: ['MAS'],
      },
    };
    apiAdelaideFichierServiceMock.getDistAppsByEnvOrg.and.returnValue(of(mockDistAppResponse) as any);
    component.ngOnInit();
    component.isOrgOptionsInitialized = true;
    component.orgsSelected = [{ title: '117' }];
    component.formEnv.setValue('P');
    expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
    expect(apiAdelaideFichierServiceMock.getDistinctOrgsNoMasByEnvs).toHaveBeenCalledWith({
      codenvs: ['P'],
      codorgs: [],
      codapp: '',
      codcom: '',
    });
    expect(apiAdelaideFichierServiceMock.getDistAppsByEnvOrg).toHaveBeenCalledWith({
      codenvs: ['P'],
      codorgs: ['117'],
      codapp: '',
      codcom: '',
    });
    expect(component.optionsApp).toEqual(mockDistAppResponse.data.getDistAppByEnvOrgFromFichier);
    const mockDistComResponse = {
      data: {
        getDistComByEnvOrgAppFromFichier: ['ADEH', 'PD01'],
      },
    };
    apiAdelaideFichierServiceMock.getDistComsByEnvOrgApp.and.returnValue(of(mockDistComResponse as any));
    component.formApp.setValue('MAS');
    expect(apiAdelaideFichierServiceMock.getDistComsByEnvOrgApp).toHaveBeenCalledWith({
      codenvs: ['P'],
      codorgs: ['117'],
      codapp: 'MAS',
      codcom: '',
    });
    expect(component.optionsCom).toEqual(mockDistComResponse.data.getDistComByEnvOrgAppFromFichier);
    const mockDistFicResponse = {
      data: {
        findFicPrdImpByEnvOrgAppCom: [
          {
            codfic: 'L00',
            refimp: 'V90RR50',
            codprd: 'PDP4B',
          },
          {
            codfic: 'L00',
            refimp: 'V90RR50',
            codprd: null,
          },
        ],
      },
    };
    apiAdelaideFichierServiceMock.findFicPrdImpByEnvOrgAppCom.and.returnValue(of(mockDistFicResponse as any));
    component.formCom.setValue('ADEH');
    tick(DELAI_VALUE_CHANGE_LONG);
    expect(apiAdelaideFichierServiceMock.findFicPrdImpByEnvOrgAppCom).toHaveBeenCalledWith({
      codenv: 'P',
      codorgs: ['117'],
      codapp: 'MAS',
      codcom: '%ADEH%',
    });
    expect(component.optionsFic).toEqual([
      {
        value: 'L00',
        columns: [
          { label: 'Fichier', value: 'L00' },
          { label: 'Code Prd', value: 'PDP4B' },
          { label: 'Imprimé', value: 'V90RR50' },
        ],
      },
      {
        value: 'L00',
        columns: [
          { label: 'Fichier', value: 'L00' },
          { label: 'Code Prd', value: null },
          { label: 'Imprimé', value: 'V90RR50' },
        ],
      },
    ]);
  }));

  it('send validity', () => {
    spyOn(component.applySearchEvent, 'emit');
    component.initializeForm();
    component.formNot.setValue('codNot');
    component.formEnv.setValue('P');
    component.formApp.setValue('SNV2');
    component.formCom.setValue('com');
    component.formFic.setValue(['f00', 'f01']);
    component.formImp.setValue('imp');
    component.send();

    expect(sessionDataSearchServiceMock.updateDataSearchToSession).toHaveBeenCalledWith({
      notice: 'codNot',
      environnement: 'P',
      organisme: {},
      application: 'SNV2',
      commande: 'com',
      fichier: ['f00', 'f01'],
      Imprime: 'imp',
    });
    expect(component.applySearchEvent.emit).toHaveBeenCalledWith({
      notice: 'codNot',
      environnement: 'P',
      organisme: null,
      application: 'SNV2',
      commande: '%com%',
      fichier: ['f00', 'f01'],
      Imprime: '%imp%',
    });
  });
});
