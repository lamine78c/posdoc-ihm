import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalAddAdressComponent } from './modal-add-adress.component';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { of, throwError } from 'rxjs';
import { AdresseRetourDTO } from '@app/models/adresseRetour';

describe('ModalAddAdressComponent', () => {
  let component: ModalAddAdressComponent;
  let fixture: ComponentFixture<ModalAddAdressComponent>;
  let mockApiAdresseRetourService: jasmine.SpyObj<ApiAdelaideAdresseRetourService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let fb: FormBuilder;
  const organismes = [
    {
      code: '00L',
      codeRegion: null,
    },
    {
      code: '117',
      codeRegion: '117',
    },
    {
      code: '116',
      codeRegion: '116',
    },
  ];
  const applications = [
    {
      code: 'ASI',
      codeOrganisation: '116',
      codeEnvironnement: 'P',
    },
    {
      code: 'ASI',
      codeOrganisation: '00L',
      codeEnvironnement: 'P',
    },
    {
      code: 'ASI',
      codeOrganisation: '117',
      codeEnvironnement: 'P',
    },
    {
      code: 'SNV2',
      codeOrganisation: '117',
      codeEnvironnement: 'P',
    },
    {
      code: 'MAS',
      codeOrganisation: '116',
      codeEnvironnement: 'P',
    },
  ];
  const allAdressesRetourId = [
    {
      code: '75_TSA1',
      codeOrganisme: '116',
    },
    {
      code: '75_TSA1',
      codeOrganisme: '117',
    },
    {
      code: '75_TSA2',
      codeOrganisme: '00L',
    },
    {
      code: '75_TSA1',
      codeOrganisme: '00L',
    },
    {
      code: '75_TSA3',
      codeOrganisme: '117',
    },
  ];
  const mockResponseCreateData = [
    {
      code: 't',
      codeOrganisme: 't',
      adresse1: 't',
      adresse2: 't',
      adresse3: 't',
      adresse4: 't',
    },
    {
      code: 's',
      codeOrganisme: 's',
      adresse1: 's',
      adresse2: 's',
      adresse3: 's',
      adresse4: 's',
    },
  ];
  const mockResponse = {
    data: {
      createAdressesRetour: mockResponseCreateData,
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockApiAdresseRetourService = jasmine.createSpyObj('ApiAdelaideAdresseRetourService', ['createAdressesRetour']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockFilterSharedDataService = jasmine.createSpyObj('FilterSharedDataService', ['updateData']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [ModalAddAdressComponent],
      providers: [
        FormBuilder,
        { provide: ApiAdelaideAdresseRetourService, useValue: mockApiAdresseRetourService },
        { provide: NotesService, useValue: mockNoteService },
        { provide: FilterSharedDataService, useValue: mockFilterSharedDataService },
        { provide: NgbActiveModal, useValue: mockModal },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockApiAdresseRetourService.createAdressesRetour.and.returnValue(of(mockResponse));

    fixture = TestBed.createComponent(ModalAddAdressComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.modalRef = mockModal;
    component.organismes = organismes;
    component.applications = applications;
    component.allAdressesRetourId = allAdressesRetourId;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit validity', done => {
    spyOn(component, 'onChangeCodeAdresse');
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.controls.organismes).toBeDefined();
    expect(component.formGroup.controls.environnement).toBeDefined();
    expect(component.formGroup.controls.application).toBeDefined();
    expect(component.formGroup.controls.codeAdresse).toBeDefined();
    expect(component.formGroup.controls.adresse1).toBeDefined();
    expect(component.formGroup.controls.adresse2).toBeDefined();
    expect(component.formGroup.controls.adresse3).toBeDefined();
    expect(component.formGroup.controls.adresse4).toBeDefined();

    component.formGroup.controls.codeAdresse.setValue('75_TSA1');
    setTimeout(() => {
      expect(component.onChangeCodeAdresse).toHaveBeenCalledWith('75_TSA1');
      done();
    }, 400);
  });

  it('getApplicationsControl validity', () => {
    spyOn(component.formGroup, 'patchValue');
    component.applicationSelected = 'ASI';
    component.getApplicationsControl();
    fixture.detectChanges();

    expect(component.formGroup.patchValue).toHaveBeenCalledWith({ application: 'ASI' });
  });

  it('getApplications validity', () => {
    component.environnementSelected = ['P'];
    component.applicationSelectedLast = 'ASI';
    component.getApplications();
    fixture.detectChanges();

    expect(component.applicationsList).toEqual([
      { value: 'ASI', text: 'ASI' },
      { value: 'MAS', text: 'MAS' },
      { value: 'SNV2', text: 'SNV2' },
    ]);
    expect(component.applicationSelected).toEqual('ASI');
  });

  it('getOrganismes validity', () => {
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    component.environnementSelected = ['P'];
    component.applicationSelected = 'ASI';
    component.organismesSelectedLast = ['116'];
    component.getOrganismes();
    fixture.detectChanges();

    expect(component.organismesSelected).toEqual(['116']);

    component.codeAdresse = '75_TSA1';
    component.getOrganismes();
    expect(component.organismesSelected).toEqual([]);
  });

  it('onChangeEnvironnement validity', () => {
    spyOn(component, 'getApplications');
    spyOn(component, 'getOrganismes');
    component.onChangeEnvironnement([{ title: 'P' }]);
    fixture.detectChanges();

    expect(component.getApplications).toHaveBeenCalled();
    expect(component.getOrganismes).toHaveBeenCalled();
  });

  it('onChangeApplication validity', () => {
    spyOn(component, 'getOrganismes');
    component.onChangeApplication('ASI');
    fixture.detectChanges();

    expect(component.applicationSelected).toEqual('ASI');
    expect(component.applicationSelectedLast).toEqual('ASI');
    expect(component.getOrganismes).toHaveBeenCalled();
  });

  it('onChangeCodeAdresse validity', done => {
    spyOn(component, 'getOrganismes');
    component.organismesSelected = ['116'];
    component.onChangeCodeAdresse('75_TSA1');
    fixture.detectChanges();

    expect(component.codeAdresse).toEqual('75_TSA1');
    setTimeout(() => {
      expect(component.getOrganismes).toHaveBeenCalled();
      done();
    }, 300);

    component.organismesSelected = [];
    component.onChangeCodeAdresse('75_TSA1');
  });

  it('onChangeOrganisme validity', () => {
    component.onChangeOrganisme([{ title: '116' }]);
    fixture.detectChanges();

    expect(component.organismesSelected).toEqual(['116']);
    expect(component.organismesSelectedLast).toEqual(['116']);
  });

  it('closePopup validity', () => {
    component.closePopup();
    fixture.detectChanges();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('passBack validity', () => {
    spyOn(component.passEntry, 'emit');
    component.organismesSelected = ['116'];
    component.codeAdresse = '75_TSA3';
    component.formGroup.controls.codeAdresse.setValue('75_TSA3');
    component.formGroup.controls.adresse1.setValue('adresse1');
    component.formGroup.controls.adresse2.setValue('adresse2');
    component.passBack();
    fixture.detectChanges();

    const createsDTO = [];
    createsDTO.push(new AdresseRetourDTO('75_TSA3', '116', 'adresse1', 'adresse2', '', ''));
    expect(mockApiAdresseRetourService.createAdressesRetour).toHaveBeenCalledWith(createsDTO);
    expect(component.createAdressesRetourNumber).toBe(2);
    expect(component.passEntry.emit).toHaveBeenCalledWith(2);
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: '2 adresses retour ont été ajoutées avec succès. Les adresses retour existants ne sont pas modifiés.',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });

    const mockError = { graphQLErrors: [{ message: 'error' }] };
    mockApiAdresseRetourService.createAdressesRetour.and.returnValue(throwError(mockError));
    component.passBack();
    expect(component.errorPass).toEqual('error');
  });

  it('passBack simple validity', () => {
    spyOn(component.passEntry, 'emit');
    component.organismesSelected = ['116'];
    component.codeAdresse = '75_TSA1';
    component.formGroup.controls.codeAdresse.setValue('75_TSA1');
    mockApiAdresseRetourService.createAdressesRetour.and.returnValue(
      of({
        data: {
          createAdressesRetour: [
            {
              code: 't',
              codeOrganisme: 't',
              adresse1: 't',
              adresse2: 't',
              adresse3: 't',
              adresse4: 't',
            },
          ],
        },
        loading: false,
        networkStatus: 7,
      })
    );
    component.passBack();
    fixture.detectChanges();

    expect(component.createAdressesRetourNumber).toBe(1);
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: "L'adresse retour a été ajoutée avec succès.  Les adresses retour existants ne sont pas modifiés.",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });
});
