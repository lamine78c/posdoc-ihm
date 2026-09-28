import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormBuilder, FormControl } from '@angular/forms';
import { ApolloQueryResult } from '@apollo/client/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Commande } from '@app/models/commande';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { DataService } from '@app/shared/utils/data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { AddCommandeModalComponent } from './add-commande-modal.component';

describe('AddCommandeModalComponent', () => {
  let component: AddCommandeModalComponent;
  let fixture: ComponentFixture<AddCommandeModalComponent>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;
  let mockApiAdelaideCommandeService: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let mockDataService: jasmine.SpyObj<DataService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let fb: FormBuilder;

  const mockResponse: ApolloQueryResult<any> = {
    data: {
      allRegions: [
        {
          code: '117',
          libelle: '117',
        },
        {
          code: '116',
          libelle: '116',
        },
      ],
      allOrganismes: [
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
      ],
      allEnvironnementsInApplication: [
        {
          code: 'P',
          libelle: 'P',
        },
      ],
      allApplications: [
        {
          code: 'app1',
          libelle: 'app1',
          codeOrganisation: '117',
          codeEnvironnement: 'P',
        },
        {
          code: 'app2',
          libelle: 'app2',
          codeOrganisation: '117',
          codeEnvironnement: 'P',
        },
        {
          code: 'app3',
          libelle: 'app3',
          codeOrganisation: '116',
          codeEnvironnement: 'P',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockFilterSharedDataService = jasmine.createSpyObj('FilterSharedDataService', ['updateData']);
    mockApiAdelaideCommandeService = jasmine.createSpyObj('ApiAdelaideCommandeService', ['getAPIsForAddCommande', 'createCommandes']);
    mockDataService = jasmine.createSpyObj('DataService', ['getServerData', 'setServerData', 'setDataToTransfer']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [AddCommandeModalComponent],
      providers: [
        FormBuilder,
        { provide: FilterSharedDataService, useValue: mockFilterSharedDataService },
        { provide: ApiAdelaideCommandeService, useValue: mockApiAdelaideCommandeService },
        { provide: DataService, useValue: mockDataService },
        { provide: NotesService, useValue: mockNoteService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockApiAdelaideCommandeService.getAPIsForAddCommande.and.returnValue(of(mockResponse));
    mockDataService.getServerData.and.returnValue(null);
    fixture = TestBed.createComponent(AddCommandeModalComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.modalRef = mockModal;
    component.title = 'AddCommandeModalComponent';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should updateData on ngOnDestroy', () => {
    component.ngOnDestroy();
    fixture.detectChanges();
    expect(mockFilterSharedDataService.updateData).toHaveBeenCalledWith(false);
  });

  it('should init regions applications environnementsList organismes with api', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.regions).toEqual(mockResponse.data.allRegions);
    expect(component.applications).toEqual(mockResponse.data.allApplications);
    expect(component.environnementsList).toEqual([{ value: 'P', text: 'P' }]);
    expect(component.organismes).toEqual(mockResponse.data.allOrganismes);
    expect(mockApiAdelaideCommandeService.getAPIsForAddCommande).toHaveBeenCalled();
    expect(mockDataService.setServerData).toHaveBeenCalledWith({
      action: 'add',
      regions: component.regions,
      applications: component.applications,
      environnements: component.environnementsList,
      organismes: component.organismes,
    });
  });

  it('should init regions applications environnementsList organismes with serverData', () => {
    mockDataService.getServerData.and.returnValue({
      action: 'add',
      regions: mockResponse.data.allRegions,
      applications: mockResponse.data.allApplications,
      environnements: [{ value: 'Z', text: 'Z' }],
      organismes: mockResponse.data.allOrganismes,
    });
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.regions).toEqual(mockResponse.data.allRegions);
    expect(component.applications).toEqual(mockResponse.data.allApplications);
    expect(component.environnementsList).toEqual([{ value: 'Z', text: 'Z' }]);
    expect(component.organismes).toEqual(mockResponse.data.allOrganismes);
  });

  it('should create and init correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.controls.commande).toBeTruthy();
    expect(component.formGroup.controls.designation).toBeTruthy();
    expect(component.formGroup.controls.environnements).toBeTruthy();
    expect(component.formGroup.controls.applications).toBeTruthy();
  });

  it('form invalid when empty', () => {
    component.formGroup.controls.commande.setValue('');
    component.formGroup.controls.designation.setValue('');
    component.formGroup.controls.environnements.setValue('');
    component.formGroup.controls.applications.setValue('');
    fixture.detectChanges();
    expect(component.formGroup.valid).toBeFalsy();
  });

  it('commande field validity', () => {
    const commande = component.formGroup.controls.commande;
    commande.setValue('aa');
    fixture.detectChanges();
    expect(commande.valid).toBeFalsy();
    commande.setValue('aaaa');
    expect(commande.valid).toBeTruthy();
  });

  it('closePopup validity', () => {
    component.closePopup();
    fixture.detectChanges();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('should execute closePopup when click button Abandonner', (done: DoneFn) => {
    if (!jasmine.isSpy(component.closePopup)) {
      spyOn(component, 'closePopup').and.callThrough();
    }
    if (component.modalRef && !jasmine.isSpy(component.modalRef.close)) {
      spyOn(component.modalRef, 'close');
    }
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-outline-primary');
    button.click();
    fixture.whenStable().then(() => {
      expect(component.closePopup).toHaveBeenCalled();
      expect(component.modalRef.close).toHaveBeenCalled();
      done();
    });
  });

  it('should execute passBack when click button Confirmer', (done) => {
    spyOn(component, 'passBack');
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-primary');
    button.click();
    fixture.whenStable().then(() => {
      expect(component.passBack).toHaveBeenCalled();
      done();
    });
  });

  it('should throw errorFom when execute passBack with formGroup invalid', () => {
    component.passBack();
    fixture.detectChanges();
    expect(component.errorForm).toEqual("Le formulaire n'est pas valide veuillez remplir tous les champs");
  });

  it('should execute passBack with error', () => {
    component.formGroup.controls.commande.setValue('comm');
    component.formGroup.controls.designation.setValue('comm');
    component.formGroup.controls.environnements.setValue('P');
    component.formGroup.controls.applications.setValue('SNV2');
    component.orgGroup = fb.group({
      117: { 117: new FormControl(true, null) },
    });
    const error = { graphQLErrors: [{ message: 'Erreur de création' }] };
    mockApiAdelaideCommandeService.createCommandes.and.returnValue(throwError(error));
    component.passBack();
    fixture.detectChanges();
    expect(mockApiAdelaideCommandeService.createCommandes).toHaveBeenCalled();
    expect(component.errorForm).toEqual('Erreur de création');
  });

  it('should execute passBack correctly for popup complete', () => {
    component.isCompleteStep = true;
    component.formGroup.controls.commande.setValue('comm');
    component.formGroup.controls.designation.setValue('comm');
    component.formGroup.controls.environnements.setValue('P');
    component.formGroup.controls.applications.setValue('SNV2');
    component.orgGroup = fb.group({
      117: { 117: new FormControl(true, null) },
    });
    component.selectedNode = { data: { code: 'comm', libelle: 'comm', codenv: 'P', codorg: '117', codapp: 'SNV2' } };
    component.organismesSelected = ['117'];
    component.codeEnvironnement = 'P';
    component.codeApplication = 'SNV2';
    component.formGroup.controls.commande;
    const mockResponsCreate = {
      data: {
        createCommandes: [
          {
            code: component.selectedNode.data.code,
            libelle: component.selectedNode.data.libelle,
            codenv: component.codeEnvironnement,
            codorg: '117',
            codapp: component.codeApplication,
          },
        ],
      },
    };
    mockApiAdelaideCommandeService.createCommandes.and.returnValue(of(mockResponsCreate));
    spyOn(component.passEntry, 'emit');
    component.ngOnInit();
    component.passBack();
    fixture.detectChanges();
    const createsDTO = [
      new Commande(
        component.selectedNode.data.code,
        component.selectedNode.data.libelle,
        component.codeEnvironnement,
        '117',
        component.codeApplication
      ),
    ];
    const createdDTO = mockResponsCreate.data.createCommandes;
    expect(mockApiAdelaideCommandeService.createCommandes).toHaveBeenCalledWith(createsDTO);
    expect(mockDataService.setDataToTransfer).toHaveBeenCalledWith({
      environnement: component.codeEnvironnement,
      organisme: component.organismesSelected,
      application: component.codeApplication,
    });
    expect(component.createCommandesNumber).toEqual(1);
    expect(component.modalRef.close).toHaveBeenCalled();
    expect(component.passEntry.emit).toHaveBeenCalledWith({
      createCommandesNumber: component.createCommandesNumber,
      createdDTO: createdDTO,
    });
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title:
        'La commande "' +
        createdDTO[0].codenv +
        '-' +
        createdDTO[0].codorg +
        '-' +
        createdDTO[0].codapp +
        '-' +
        createdDTO[0].code +
        '" a été ajoutée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should execute passBack with x commandes added', () => {
    component.formGroup.controls.commande.setValue('comm');
    component.formGroup.controls.designation.setValue('comm');
    component.formGroup.controls.environnements.setValue('P');
    component.formGroup.controls.applications.setValue('SNV2');
    component.orgGroup = fb.group({
      117: { 117: new FormControl(true, null) },
    });
    mockApiAdelaideCommandeService.createCommandes.and.returnValue(
      of({
        data: {
          createCommandes: [1, 2, 3],
        },
      })
    );
    component.passBack();
    fixture.detectChanges();
    expect(mockApiAdelaideCommandeService.createCommandes).toHaveBeenCalled();
    expect(component.createCommandesNumber).toEqual(3);
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: '3 commandes ont été ajoutées avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('getApplicationsControl validity', () => {
    component.codeApplication = 'SNV2';
    component.applicationsList = [{ value: 'SNV2', text: 'SNV2' }];
    component.getApplicationsControl();
    fixture.detectChanges();
    expect(component.formGroup.controls.applications.value).toEqual(component.codeApplication);
  });

  it('getRegions validity', () => {
    component.formGroup.controls.commande.setValue('comm');
    component.organismes = mockResponse.data.allOrganismes;
    component.filtredApplications = mockResponse.data.allApplications;
    component.regions = mockResponse.data.allRegions;
    component.commandes = [
      {
        codorg: '117',
        codapp: 'app1',
        codenv: 'P',
        code: 'comm',
      },
    ];
    component.codeEnvironnement = 'P';
    component.codeApplication = 'app1';
    component.formGroup.controls.commande.setValue('comm');
    component.getRegions();
    fixture.detectChanges();
    expect(component.regionsList).toEqual(['117', '116']);
    expect(component.organismesReg).toEqual([{ code: '116', libelle: '116', codeRegion: '116' }]);
  });

  it('getApplicationsByEnvs validity', () => {
    component.codeApplication = 'SNV2';
    component.applications = [
      { codeEnvironnement: 'P', code: 'SNV2' },
      { codeEnvironnement: 'P', code: 'MAS' },
      { codeEnvironnement: 'T', code: 'MAS' },
    ];
    component.getApplicationsByEnvs('P');
    fixture.detectChanges();
    expect(component.applicationsList).toEqual([
      { value: 'SNV2', text: 'SNV2' },
      { value: 'MAS', text: 'MAS' },
    ]);
  });

  it('onChangeApplication with param code validity', () => {
    spyOn(component, 'getRegions');
    component.filtredApplicationsByApp = [{ code: 'MAS' }];
    component.onChangeApplication('SNV2');
    fixture.detectChanges();
    expect(component.getRegions).toHaveBeenCalled();
  });

  it('onChangeApplication with param null validity', () => {
    component.filtredApplicationsByApp = [{ code: 'MAS' }];
    component.onChangeApplication(null);
    fixture.detectChanges();
    expect(component.codeApplication).toEqual('');
  });

  it('onChangeOrganisme validity', () => {
    component.onChangeOrganisme([{ title: '117' }, { title: '116' }]);
    fixture.detectChanges();
    expect(component.organismesSelected).toEqual(['117', '116']);
  });

  it('onChangeEnvironnement with param code validity', () => {
    spyOn(component, 'getApplicationsByEnvs');
    spyOn(component, 'onChangeApplication');
    component.codeApplication = 'MAS';
    component.onChangeEnvironnement('P');
    fixture.detectChanges();
    expect(component.codeEnvironnement).toEqual('P');
    expect(component.applicationsList).toEqual([]);
    expect(component.getApplicationsByEnvs).toHaveBeenCalledWith('P');
    expect(component.onChangeApplication).toHaveBeenCalledWith('MAS');
  });

  it('onChangeEnvironnement with param null validity', () => {
    spyOn(component, 'getApplicationsByEnvs');
    spyOn(component, 'onChangeApplication');
    component.onChangeEnvironnement(null);
    fixture.detectChanges();
    expect(component.codeEnvironnement).toEqual(null);
    expect(component.getApplicationsByEnvs).not.toHaveBeenCalled();
    expect(component.onChangeApplication).not.toHaveBeenCalled();
  });
});
