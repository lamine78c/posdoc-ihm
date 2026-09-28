import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ModalUpdateComponent } from './modal-update.component';

describe('ModalUpdateComponent', () => {
  let component: ModalUpdateComponent;
  let fixture: ComponentFixture<ModalUpdateComponent>;
  let apiService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let fb: FormBuilder;

  const mockResponseRess = {
    data: {
      getRessourcesByCodeEnvOrgsApp: [
        { codgam: 'G1', codsit: 'S1', codres: 'R1' },
        { codgam: 'G2', codsit: 'S2', codres: 'R2' },
      ],
    },
  };
  const mockResponseDestin = {
    data: {
      getCodeDestinatairesByCodeOrgs: ['D1', 'D2'],
    },
  };
  const allRessources = [
    {
      codeApplication: 'ces',
      codeEnvironnement: 'p',
      codeGamme: 'ma',
      codeOrganisme: '117',
      codeRessource: 'fic-pdf',
      codeSite: 'cirso',
      profil: 'A',
    },
    {
      codeApplication: 'ces',
      codeEnvironnement: 'i',
      codeGamme: 'ma',
      codeOrganisme: '117',
      codeRessource: 'fic-pdf',
      codeSite: 'cirso',
      profil: 'A',
    },
    {
      codeApplication: 'ces',
      codeEnvironnement: 'p',
      codeGamme: 'ma',
      codeOrganisme: '117',
      codeRessource: 'fic-pdf',
      codeSite: 'cirtil',
      profil: 'A',
    },
    {
      codeApplication: 'ces',
      codeEnvironnement: 'i',
      codeGamme: 'ma',
      codeOrganisme: '999',
      codeRessource: 'massi',
      codeSite: 'cirtil',
      profil: 'A',
    },
    {
      codeApplication: 'ces',
      codeEnvironnement: 'i',
      codeGamme: 'ma',
      codeOrganisme: '999',
      codeRessource: 'sepia',
      codeSite: 'cirtil',
      profil: 'A',
    },
    {
      codeApplication: 'ces',
      codeEnvironnement: 'i',
      codeGamme: 'ma',
      codeOrganisme: '999',
      codeRessource: 'sepia',
      codeSite: 'cirso',
      profil: 'A',
    },
  ];
  const allOrganismes = [
    {
      code: '117',
      libelle: '117',
      codeRegion: '117',
      codeSite: 'cirso',
    },
    {
      code: '107',
      libelle: '107',
      codeRegion: '107',
      codeSite: 'cirso',
    },
    {
      code: '999',
      libelle: '999',
      codeRegion: '',
      codeSite: 'cirtil',
    },
  ];

  beforeEach(waitForAsync(() => {
    apiService = jasmine.createSpyObj('ApiAdelaideDistributionService', ['getRessourcesByCodeEnvOrgsApp', 'getCodeDestinatairesByCodeOrgs']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasProfileAdmin']);

    TestBed.configureTestingModule({
      declarations: [ModalUpdateComponent],
      providers: [
        { provide: ApiAdelaideDistributionService, useValue: apiService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NgbActiveModal, useValue: mockModal },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPermissionService.hasProfileAdmin.and.returnValue(true);
    apiService.getRessourcesByCodeEnvOrgsApp.and.returnValue(of(mockResponseRess as any));
    apiService.getCodeDestinatairesByCodeOrgs.and.returnValue(of(mockResponseDestin as any));

    fixture = TestBed.createComponent(ModalUpdateComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.form = fb.group({
      codgam: ['gam'],
      codres: ['res'],
      coddes: ['des'],
    });
    component.modalRef = mockModal;
    component.codeOrgOGUR = '999';
    component.allRessources = allRessources;
    component.allOrganismes = allOrganismes;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter site options on gamme change', () => {
    component.ressources = [
      { codgam: 'G1', codsit: 'S1', codres: 'R1' },
      { codgam: 'G1', codsit: 'S2', codres: 'R2' },
      { codgam: 'G2', codsit: 'S3', codres: 'R3' },
    ];
    const event = { target: { value: 'Gamme: G1' } } as any;

    component.onGammeChange(event);

    expect(component.ressourceOptionsSubject.value).toEqual(['R1', 'R2']);
  });

  it('should change etat ressource message', () => {
    component.toEditEtat();
    expect(component.isOngletEtatActif).toBeTruthy();
    expect(component.isOngletRessourceActif).toBeFalsy();
    expect(component.isOngletMessageActif).toBeFalsy();
    expect(component.isOngletSiteActif).toBeFalsy();

    component.toEditRessource();
    expect(component.isOngletEtatActif).toBeFalsy();
    expect(component.isOngletRessourceActif).toBeTruthy();
    expect(component.isOngletMessageActif).toBeFalsy();
    expect(component.isOngletSiteActif).toBeFalsy();

    component.toEditMessage();
    expect(component.isOngletEtatActif).toBeFalsy();
    expect(component.isOngletRessourceActif).toBeFalsy();
    expect(component.isOngletMessageActif).toBeTruthy();
    expect(component.isOngletSiteActif).toBeFalsy();

    component.toEditSite();
    expect(component.isOngletEtatActif).toBeFalsy();
    expect(component.isOngletRessourceActif).toBeFalsy();
    expect(component.isOngletMessageActif).toBeFalsy();
    expect(component.isOngletSiteActif).toBeTruthy();
  });

  it('should return error for onglet ressource|site|etat when the ressource reserved to the admin and user is non admin', fakeAsync(() => {
    // user non admin
    mockPermissionService.hasProfileAdmin.and.returnValue(false);
    component.selectedNodes = [
      {
        data: {
          codenv: 'i',
          codapp: 'ces',
          codorg: '117',
          codgam: 'ma',
          codsit: 'cirso',
          codres: 'fic-pdf',
          isAdmin: 'A',
        },
      },
    ];
    component.ngOnInit();
    tick(DELAI_VALUE_CHANGE);
    expect(component.msgErrorOngletRessource).toEqual('Vous ne pouvez pas modifier les exemplaires suivants :');
    expect(component.msgErrorOngletSite).toEqual(component.msgErrorOngletRessource);
    expect(component.msgErrorOngletEtat).toEqual(component.msgErrorOngletRessource);
    expect(component.showFormRessource).toBeFalsy();
    expect(component.showFormSite).toBeFalsy();
    expect(component.showFormEtat).toBeFalsy();
  }));

  describe('onglet ressource validity', () => {
    it('should return error when multi environnements selected', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'fic-pdf',
          },
        },
        {
          data: {
            codenv: 'p',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'sepia',
          },
        },
      ];
      component.ngOnInit();
      tick(DELAI_VALUE_CHANGE);
      expect(component.msgErrorOngletRessource).toEqual("La modification de masse n'est pas possible si plusieurs environnements sont sélectionnés.");
      expect(component.showFormRessource).toBeFalsy();
      expect(component.form.valid).toBeFalsy();
    }));

    it('should return error when ressource length is zero', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'fic-pdf',
          },
        },
      ];
      apiService.getRessourcesByCodeEnvOrgsApp.and.returnValue(of({ data: { getRessourcesByCodeEnvOrgsApp: [] } } as any));
      component.ngOnInit();
      tick(DELAI_VALUE_CHANGE);
      expect(component.msgErrorOngletRessource).toEqual("La modification de masse n'est pas possible pour des exemplaires de périmètre différent.");
      expect(component.showFormRessource).toBeFalsy();
      expect(component.form.valid).toBeFalsy();
    }));

    it('should fetch ressources and destinataires', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'fic-pdf',
          },
        },
      ];
      component.ngOnInit();

      expect(apiService.getRessourcesByCodeEnvOrgsApp).toHaveBeenCalled();
      expect(component.ressources).toEqual(mockResponseRess.data.getRessourcesByCodeEnvOrgsApp);
      expect(component.gammeOptionsSubject.value).toEqual(['G1', 'G2']);
      expect(apiService.getCodeDestinatairesByCodeOrgs).toHaveBeenCalled();
      expect(component.destinataireOptionsSubject.value).toEqual(['D1', 'D2']);
    }));

    it('updateMasseExemplaire validity', () => {
      component.form = fb.group({
        codgam: ['gam'],
        codres: ['res'],
        coddes: ['des'],
      });
      const emitSpy = spyOn(component.updateMasse, 'emit');
      component.updateMasseExemplaire();
      expect(emitSpy).toHaveBeenCalledWith({
        codgam: 'gam',
        codres: 'res',
        coddes: 'des',
      });
    });
  });

  describe('onglet site validity', () => {
    it('should return error when no change', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'fic-pdf',
          },
        },
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'sepia',
          },
        },
      ];
      component.initFormSite();
      component.onChangeSite();
      const siteSelected = 'cirso';
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeTruthy();
      expect(component.msgErrorFormSite).toEqual("Aucune modification n'est détectée");
      expect(component.formSite.get('site').valid).toBeFalsy();
    }));

    it('should return error when the site to change is not exist in allRessource', fakeAsync(() => {
      // siteSelected in ressource i-117-ces-ma-massi-cirso not exist
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirtil',
            codres: 'massi',
          },
        },
      ];
      component.initFormSite();
      component.onChangeSite();
      let siteSelected = 'cirso';
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeTruthy();
      expect(component.msgErrorFormSite).toEqual(
        "Vous ne pouvez pas poursuivre la modification de votre sélection, car certaines ressources n'existent pas."
      );
      expect(component.formSite.get('site').valid).toBeFalsy();

      // codenv in ressource p-117-ces-ma-massi-cirtil not exist
      component.selectedNodes = [
        {
          data: {
            codenv: 'p',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'massi',
          },
        },
      ];
      siteSelected = 'cirtil';
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeTruthy();
      expect(component.formSite.get('site').valid).toBeFalsy();

      // codapp in ressource i-117-cdes-ma-massi-cirtil not exist
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'cdes',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'massi',
          },
        },
      ];
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeTruthy();
      expect(component.formSite.get('site').valid).toBeFalsy();

      // codgam in ressource i-117-ces-mb-massi-cirtil not exist
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'mb',
            codsit: 'cirso',
            codres: 'massi',
          },
        },
      ];
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeTruthy();
      expect(component.formSite.get('site').valid).toBeFalsy();

      // codres in ressource i-117-ces-ma-ss-cirtil not exist
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'ss',
          },
        },
      ];
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeTruthy();
      expect(component.formSite.get('site').valid).toBeFalsy();
    }));

    it('should return error when multi fichiers selected', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'fic-pdf',
            codfic: 'f1',
          },
        },
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'sepia',
            codfic: 'f2',
          },
        },
      ];
      component.ngOnInit();
      tick(DELAI_VALUE_CHANGE);
      expect(component.msgErrorOngletSite).toEqual("La modification de masse n'est pas possible si plusieurs fichiers sont sélectionnés.");
      expect(component.showFormSite).toBeFalsy();
      expect(component.formSite.get('site').valid).toBeFalsy();
    }));

    it('updateSite validity', () => {
      const emitSpy = spyOn(component.updateMasseSite, 'emit');
      component.formSite.get('site').setValue('codsit');
      component.updateSite();
      expect(emitSpy).toHaveBeenCalledWith('codsit');
    });

    it('should pass validation', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirtil',
            codres: 'fic-pdf',
          },
        },
      ];
      component.ngOnInit();
      component.onChangeSite();
      const siteSelected = 'cirso';
      component.formSite.get('site').setValue(siteSelected);
      tick(DELAI_VALUE_CHANGE);
      expect(component.errorFormSite).toBeFalsy();
      expect(component.msgErrorFormSite).toEqual('');
      expect(component.formSite.get('site').valid).toBeTruthy();
    }));
  });

  describe('onglet etat validity', () => {
    it('updateEtat validity', () => {
      const emitSpy = spyOn(component.updateMasseEtat, 'emit');
      component.formEtat.get('etat').setValue(true);
      component.updateEtat();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('onglet message validity', () => {
    it('should return error when multi environnements selected', fakeAsync(() => {
      component.selectedNodes = [
        {
          data: {
            codenv: 'i',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'fic-pdf',
          },
        },
        {
          data: {
            codenv: 'p',
            codapp: 'ces',
            codorg: '117',
            codgam: 'ma',
            codsit: 'cirso',
            codres: 'sepia',
          },
        },
      ];
      component.ngOnInit();
      tick(DELAI_VALUE_CHANGE);
      expect(component.msgErrorOngletMessage).toEqual("La modification de masse n'est pas possible si plusieurs environnements sont sélectionnés.");
      expect(component.showFormMessage).toBeFalsy();
    }));

    it('updateMessage validity', () => {
      const emitSpy = spyOn(component.updateMasseMessage, 'emit');
      component.formMessage.get('ficatt').setValue('msg');
      component.updateMessage();
      expect(emitSpy).toHaveBeenCalledWith('msg');
    });
  });
});
