import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { COD_APP_SNV2, CODE_CLIENT_UR_GENERAL, PREFIXE_COD_CLI_SNV2 } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AddModalComponent } from './add-modal.component';
import { OrganismeClientModalComponent } from '../organisme-client-modal/organisme-client-modal.component';

describe('AddModalComponent', () => {
  let component: AddModalComponent;
  let fixture: ComponentFixture<AddModalComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideFichierService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideFichierService', [
      'getConfigDataForAdd',
      'createFichierWithExemplaire',
      'getRessourcesGam',
    ]);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasProfileAdmin']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    TestBed.configureTestingModule({
      declarations: [AddModalComponent, OrganismeClientModalComponent],
      providers: [
        FormBuilder,
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ApiAdelaideFichierService, useValue: mockApiAdelaideService },
        { provide: NotesService, useValue: mockNoteService },
        { provide: NgbActiveModal, useValue: mockModal },
        { provide: NgbModal, useValue: modalServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    const mockResponseConfig = {
      data: {
        allFormats: [
          {
            code: 'for1',
            libelle: 'for1',
          },
          {
            code: 'for2',
            libelle: 'for2',
          },
        ],
        allClients: [
          {
            code: 'cli1',
          },
          {
            code: 'cli2',
          },
        ],
        allSupports: [
          {
            type: 't',
            libelle: 'supp1',
          },
          {
            type: 's',
            libelle: 'supp2',
          },
        ],
        findAllOrganiClient: [
          {
            codorg: '117',
            codcli: 'cli1',
          },
          {
            codorg: '116',
            codcli: 'cli1',
          },
          {
            codorg: '117',
            codcli: 'cli2',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };

    mockApiAdelaideService.getConfigDataForAdd.and.returnValue(of(mockResponseConfig));

    fixture = TestBed.createComponent(AddModalComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.activeModal = mockModal;
    component.imprimeData$ = new BehaviorSubject([
      { reference: 'ref1', libelle: 'lib1' },
      { reference: 'ref2', libelle: 'lib2' },
    ]);
    component.appDistinctData$ = new BehaviorSubject([]);
    component.allOrgReg = [
      { code: '117', codeRegion: '117', codeSite: 'cirtil' },
      { code: '116', codeRegion: '116', codeSite: 'cirtil' },
      { code: '38G', codeRegion: '', codeSite: 'cirtil' },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create and init correctly', () => {
    spyOn(component, 'onChangeOrganisme');
    spyOn(component, 'onChangeApplication');
    spyOn(component, 'onChangeCodeClient');

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.onChangeOrganisme).toHaveBeenCalled();
    expect(component.onChangeApplication).toHaveBeenCalled();
    expect(component.onChangeCodeClient).toHaveBeenCalled();
  });

  it('enableNextButton null validity', () => {
    component.active = null;
    const result = component.enableNextButton();
    fixture.detectChanges();
    expect(result).toBeTruthy();
  });

  it('enableNextButton for step 1 validity', () => {
    component.formDefinition = fb.group({
      fichier: ['', CustomValidators.required()],
    });
    component.active = 1;
    component.formDefinition.controls.fichier.setValue('aaa');
    const result = component.enableNextButton();
    fixture.detectChanges();
    expect(result).toBeTruthy();
  });

  it('enableNextButton for step 2 validity', () => {
    component.formGeneralite = fb.group({
      fichier: ['', CustomValidators.required()],
      codeClient: ['', CustomValidators.required()],
    });
    component.active = 2;
    component.orgsNoRegSelected = ['100'];
    component.formOrganismeClientValue = [{ '100': 'urz100' }];
    component.formGeneralite.controls.codeClient.setValue(CODE_CLIENT_UR_GENERAL);
    component.formGeneralite.controls.fichier.setValue('aaa');
    const result = component.enableNextButton();
    fixture.detectChanges();
    expect(result).toBeTruthy();
  });

  it('previousStep validity', () => {
    component.active = 2;
    component.previousStep();
    fixture.detectChanges();
    expect(component.active).toBe(1);
  });

  it('nextStep validity', () => {
    spyOn(component, 'getRessGam');
    component.active = 1;
    component.nextStep();
    fixture.detectChanges();
    expect(component.active).toBe(2);
    expect(component.getRessGam).toHaveBeenCalled();
  });

  it('stepClicked validity', () => {
    component.active = 3;
    component.stepClicked(2);
    fixture.detectChanges();
    expect(component.active).toBe(2);

    component.active = 1;
    component.stepClicked(2);
    expect(component.active).toBe(1);
  });

  it('save zero validity', () => {
    const mockResponse = {
      data: {
        createFichierWithExemplaire: {
          nbFichiers: 1,
          nbProduits: 1,
          nbExemplaires: 1,
        },
      },
    };
    mockApiAdelaideService.createFichierWithExemplaire.and.returnValue(of(mockResponse));
    component.save();
    fixture.detectChanges();
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: 'Aucun fichier créé',
      classname: 'note-avertissement',
      category: ToastCategoryEnum.WARNING,
    });
  });

  it('save validity', () => {
    const mockResponse = {
      data: {
        createFichierWithExemplaire: {
          nbFichiers: 2,
          nbProduits: 2,
          nbExemplaires: 2,
        },
      },
    };
    component.allOrganiClientList = [
      {
        codorg: '117',
        codcli: 'cli1',
      },
      {
        codorg: '116',
        codcli: 'cli1',
      },
      {
        codorg: '117',
        codcli: 'cli2',
      },
    ];
    component.formDefinition = fb.group({
      environnement: fb.group({
        P: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
        '38G-null': fb.group({ '38G': [true] }),
      }),
      application: ['SNV2'],
      commande: ['comm1'],
      fichier: ['fic1'],
    });
    component.formGeneralite = fb.group({
      designation: ['des'],
      codeProduit: [''],
      refFormat: [''],
      typeFormat: ['1'],
      fondPage: ['1'],
      page: [8],
      codeClient: ['cc'],
      signature: [''],
      codeDocument: ['cd'],
      typeSupport: [''],
      eclatement: [''],
    });
    component.ressources = [
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'gam',
        codeSite: 'site',
        codeRessource: 'res',
        codeServeur: 'ser',
        value: 'a',
      },
    ];
    mockApiAdelaideService.createFichierWithExemplaire.and.returnValue(of(mockResponse));
    component.formOrganismeClientValue = { '38G': '38GCLI' };
    component.save();
    fixture.detectChanges();
    expect(mockApiAdelaideService.createFichierWithExemplaire).toHaveBeenCalledWith([
      {
        codeEnv: 'P',
        codeOrg: '117',
        codeApp: 'SNV2',
        codeCom: 'comm1',
        codeFich: 'fic1',
        libFichier: 'des',
        typeSig: '',
        codeProd: '',
        refFormat: '',
        typeFormat: '1',
        refImprime: '1',
        codeClient: 'cc',
        eclatement: '0',
        page: 8,
        typeSupport: '',
        codeDocument: '',
        exemplaires: [{ codeRessource: 'res', codeGamme: 'gam', codeSite: 'site' }],
      },
      {
        codeEnv: 'P',
        codeOrg: '38G',
        codeApp: 'SNV2',
        codeCom: 'comm1',
        codeFich: 'fic1',
        libFichier: 'des',
        typeSig: '',
        codeProd: '',
        refFormat: '',
        typeFormat: '1',
        refImprime: '1',
        codeClient: 'cc',
        eclatement: '0',
        page: 8,
        typeSupport: '',
        codeDocument: '',
      },
    ]);
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: '2 fichiers ont été créés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: '2 produits ont été créés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: '2 exemplaires ont été créés avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });

    component.ressources = [
      {
        codeEnvironnement: 'P',
        codeOrganisme: '999',
        codeApplication: 'SNV2',
        codeGamme: 'gam',
        codeSite: 'cirtil',
        codeRessource: 'res',
        codeServeur: 'ser',
        value: 'a',
      },
    ];
    component.formGeneralite.controls.eclatement.setValue('-');
    component.formGeneralite.controls.codeClient.setValue(CODE_CLIENT_UR_GENERAL);
    component.save();

    component.allOrganiClientList = [];
    component.allClientList = [PREFIXE_COD_CLI_SNV2 + '117', PREFIXE_COD_CLI_SNV2 + '116'];
    component.save();

    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiAdelaideService.createFichierWithExemplaire.and.returnValue(throwError(error));
    component.save();
    expect(mockNoteService.show).toHaveBeenCalled();
  });

  it('abandonner validity', () => {
    component.abandonner();
    fixture.detectChanges();
    expect(component.activeModal.dismiss).toHaveBeenCalled();
  });

  it('getRessGam validity', () => {
    component.dataDefinition = {
      application: 'SNV2',
      environnement: { I: false, P: true, R: true, T: false },
      organisme: {
        '38G-null': {
          '38G': false,
        },
        '116': {
          '116': false,
        },
        '117': {
          '117': true,
          '771': true,
        },
      },
    };
    const mockResponse = [
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'gam',
        codeSite: 'site',
        codeRessource: 'res',
        codeServeur: 'ser',
      },
    ];
    mockPermissionService.hasProfileAdmin.and.returnValue(true);
    mockApiAdelaideService.getRessourcesGam.and.returnValue(
      of({
        data: {
          getRessourcesGam: mockResponse,
        },
        loading: false,
        networkStatus: 7,
      })
    );
    component.getRessGam();
    fixture.detectChanges();
    expect(mockApiAdelaideService.getRessourcesGam).toHaveBeenCalledWith({
      codesEnv: ['P', 'R'],
      codesOrg: ['117', '771'],
      codeApp: 'SNV2',
      isProfilAdmin: true,
    });
    expect(component.ressources).toEqual(mockResponse);
  });

  it('formDefinition application valueChange validity', () => {
    component.clientOption = [CODE_CLIENT_UR_GENERAL];

    component.ngOnInit();
    fixture.detectChanges();

    component.formDefinition.controls.application.setValue(COD_APP_SNV2);
    expect(component.dataDefinition).toEqual(component.formDefinition.getRawValue());
    component.formGeneralite.controls.codeClient.setValue(CODE_CLIENT_UR_GENERAL);
    component.formDefinition.controls.application.setValue('PNR');
    expect(component.formGeneralite.controls.codeClient.value).toBeNull();
  });

  it('formDefinition codeClient valueChange validity', () => {
    component.clientOption = [CODE_CLIENT_UR_GENERAL];
    component.clientOptionNoURG = ['urcli'];
    component.ngOnInit();
    component.formDefinition = fb.group({
      organisme: fb.group({
        '00L-null': fb.group({ '00L': [true] }),
      }),
      application: ['SNV2'],
    });
    component.allOrgReg = [{ code: '00L', codeRegion: '', codeSite: 'cirtil' }];

    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);
    modalRefSpy.componentInstance.passEntry = of({
      formOrganismeClientValue: {
        '00L': 'urcli',
      },
    });
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    fixture.detectChanges();

    component.formGeneralite.controls.codeClient.setValue(CODE_CLIENT_UR_GENERAL);
    expect(component.formOrganismeClientValue).toEqual({ '00L': 'urcli' });
    expect(component.orgsNoRegSelected).toEqual(['00L']);
    expect(component.noRegionFound).toEqual('00L: urcli');
    expect(component.noRegionFoundb).toBeTruthy();
  });
});
