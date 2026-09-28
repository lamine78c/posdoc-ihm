import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { ApiAdelaideDestinataireService } from '@app/services/api-adelaide-destinataire.service';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { DELAI_VALUE_CHANGE, getFormName } from '@app/shared/utils/Constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { ModalAjoutCompletComponent } from './modal-ajout-complet.component';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('ModalAjoutCompletComponent', () => {
  let component: ModalAjoutCompletComponent;
  let fixture: ComponentFixture<ModalAjoutCompletComponent>;
  let noteServiceMock: jasmine.SpyObj<NotesService>;
  let permissionServiceMock: jasmine.SpyObj<PermissionService>;
  let apiAdelaideDistibutionServiceMock: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let apiAdelaideDestinataireServiceMock: jasmine.SpyObj<ApiAdelaideDestinataireService>;
  let apiAdelaideParametreServiceMock: jasmine.SpyObj<ApiAdelaideParametreService>;
  let apiCommandeServiceMock: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let apiFichierServiceMock: jasmine.SpyObj<ApiAdelaideFichierService>;
  let fb: FormBuilder;

  beforeEach(() => {
    apiAdelaideDistibutionServiceMock = jasmine.createSpyObj('ApiAdelaideDistributionService', ['createExemplaires']);
    apiAdelaideDestinataireServiceMock = jasmine.createSpyObj('ApiAdelaideDestinataireService', ['getConfigDestinataire']);
    apiAdelaideParametreServiceMock = jasmine.createSpyObj('ApiAdelaideParametreService', ['getCodeOrgOGUR']);
    apiCommandeServiceMock = jasmine.createSpyObj('ApiAdelaideCommandeService', [
      'getDistinctApplications',
      'getDistinctEnvsByApp',
      'getDistinctCommByAppEnv',
    ]);
    apiFichierServiceMock = jasmine.createSpyObj('ApiAdelaideFichierService', ['getExistedFichiers', 'getOrgByEnvAppComFics', 'getRessourcesGam']);
    noteServiceMock = jasmine.createSpyObj('NotesService', ['show']);
    permissionServiceMock = jasmine.createSpyObj('PermissionService', ['hasProfileAdmin']);

    TestBed.configureTestingModule({
      declarations: [ModalAjoutCompletComponent],
      providers: [
        { provide: ApiAdelaideDistributionService, useValue: apiAdelaideDistibutionServiceMock },
        { provide: ApiAdelaideDestinataireService, useValue: apiAdelaideDestinataireServiceMock },
        { provide: ApiAdelaideParametreService, useValue: apiAdelaideParametreServiceMock },
        { provide: ApiAdelaideCommandeService, useValue: apiCommandeServiceMock },
        { provide: ApiAdelaideFichierService, useValue: apiFichierServiceMock },
        { provide: NotesService, useValue: noteServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        FormBuilder,
        Apollo,
        NgbActiveModal,
      ],
    }).compileComponents();

    // Mock de la réponse des appels ngInit()
    const mockResponseGetConfigDestinataire = {
      data: {
        findAllCodeDestinsAndCodeOrg: [
          {
            code: 't',
            codeorg: 't',
          },
        ],
        allOrganismes: [
          {
            code: 't',
            libelle: 't',
            codeRegion: 't',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseGetCodeOrgOGUR = {
      data: {
        getCodeOrgOGUR: 'aaa',
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseGetDistinctApplications = {
      data: {
        getDistinctApplications: ['a'],
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseGetDistinctEnvsByApp = {
      data: {
        getDistinctEnvsByApp: ['p', 'i'],
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseGetDistinctCommByAppEnv = {
      data: {
        getDistinctCommByAppEnv: ['comm1', 'comm2'],
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseGetOrgByEnvAppComFics = {
      data: {
        getOrgByEnvAppComFics: ['116', '117'],
      },
      loading: false,
      networkStatus: 7,
    };
    const mockResponseGetExistedFichiers = {
      data: {
        getExistedFichiers: [
          {
            codeEnv: 'p',
            codeOrg: '117',
            codeApp: 'snv2',
            codeCom: 'comm1',
            codeFich: 'fic1',
            codeProd: '',
          },
          {
            codeEnv: 'p',
            codeOrg: '117',
            codeApp: 'snv2',
            codeCom: 'comm2',
            codeFich: 'fic2',
            codeProd: '',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };

    const mockResponseGetRessourcesGam = {
      data: {
        getRessourcesGam: [
          {
            codeEnvironnement: 'p',
            codeOrganisme: '117',
            codeApplication: 'snv2',
            codeGamme: 'gm',
            codeSite: 'sit',
            codeRessource: 'res',
            codeServeur: 'serv',
          },
          {
            codeEnvironnement: 'p',
            codeOrganisme: '117',
            codeApplication: 'app2',
            codeGamme: 'gm',
            codeSite: 'sit',
            codeRessource: 'res',
            codeServeur: 'serv',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    // Configurer le mock pour retourner la réponse
    apiAdelaideDestinataireServiceMock.getConfigDestinataire.and.returnValue(of(mockResponseGetConfigDestinataire));
    apiAdelaideParametreServiceMock.getCodeOrgOGUR.and.returnValue(of(mockResponseGetCodeOrgOGUR));
    apiCommandeServiceMock.getDistinctApplications.and.returnValue(of(mockResponseGetDistinctApplications));
    apiCommandeServiceMock.getDistinctEnvsByApp.and.returnValue(of(mockResponseGetDistinctEnvsByApp));
    apiCommandeServiceMock.getDistinctCommByAppEnv.and.returnValue(of(mockResponseGetDistinctCommByAppEnv));
    apiFichierServiceMock.getExistedFichiers.and.returnValue(of(mockResponseGetExistedFichiers));
    apiFichierServiceMock.getOrgByEnvAppComFics.and.returnValue(of(mockResponseGetOrgByEnvAppComFics));
    apiFichierServiceMock.getRessourcesGam.and.returnValue(of(mockResponseGetRessourcesGam));

    fixture = TestBed.createComponent(ModalAjoutCompletComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    component.form = fb.group({
      environnement: ['p'],
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
      fichier: ['fic1'],
      ressources: ['res1'],
    });
    component.selectedValues = {
      environnement: ['p'],
      organisme: ['117'],
      application: 'SNV2',
      commande: 'comm1',
      fichier: 'fic1',
    };
    component.ressourcesList = [
      {
        codeEnvironnement: 'p',
        codeOrganisme: '117',
        codeApplication: 'snv2',
        codeGamme: 'gm',
        codeSite: 'sit',
        codeRessource: 'res1',
        codeServeur: 'serv',
      },
      {
        codeEnvironnement: 'p',
        codeOrganisme: '117',
        codeApplication: 'app2',
        codeGamme: 'gm',
        codeSite: 'sit',
        codeRessource: 'res2',
        codeServeur: 'serv',
      },
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the component and initialize the form', () => {
    const formName = getFormName();
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.controls[formName.ENVIRONNEMENT]).toBeTruthy();
    expect(component.form.controls[formName.ORGANISME]).toBeTruthy();
    expect(component.form.controls[formName.APPLICATION]).toBeTruthy();
    expect(component.form.controls[formName.COMMANDE]).toBeTruthy();
    expect(component.form.controls[formName.FICHIER]).toBeTruthy();
    expect(component.form.controls['destinataire']).toBeTruthy();
    expect(component.form.controls['copies']).toBeTruthy();
    expect(component.form.controls['ressources']).toBeTruthy();
    expect(component.form.controls['etat']).toBeTruthy();
  });

  it('should create exemplaire correctly', () => {
    const mockResponse = {
      data: {
        createExemplaires: [
          {
            codenv: 't',
            codorg: 't',
            codapp: 't',
            codcom: 't',
            exeact: true,
            nbrexe: 1,
            coddes: 't',
            codres: 't',
            codfic: 't',
            codgam: 't',
            numexe: 't',
            codsit: 't',
          },
          {
            codenv: 't',
            codorg: 't',
            codapp: 't',
            codcom: 't',
            exeact: true,
            nbrexe: 1,
            coddes: 't',
            codres: 't',
            codfic: 't',
            codgam: 't',
            numexe: 't',
            codsit: 't',
          },
        ],
      },
    };
    apiAdelaideDistibutionServiceMock.createExemplaires.and.returnValue(of(mockResponse as any));
    component.passBack();
  });

  it('onChangeFormValue validity with debounceTime', fakeAsync(() => {
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    component.form.get('application').setValue('app');
    tick(DELAI_VALUE_CHANGE);
    fixture.detectChanges();

    expect(component.optionsEnv).toEqual(['p', 'i']);
    expect(component.optionsCom).toEqual(['comm1', 'comm2']);
    expect(component.optionsFic).toEqual(['fic1', 'fic2']);
    expect(apiFichierServiceMock.getOrgByEnvAppComFics).toHaveBeenCalled();
    expect(apiFichierServiceMock.getRessourcesGam).toHaveBeenCalled();

    component.onChangeOrganisme([]);
    expect(component.optionsDes).toEqual([]);
  }));
});
