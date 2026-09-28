import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Destinataire } from '@app/models/destinataire';
import { ApiAdelaideDestinataireService } from '@app/services/api-adelaide-destinataire.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { PopupFormulaireCreationComponent } from './popup-formulaire-creation.component';

describe('PopupFormulaireCreationComponent', () => {
  let component: PopupFormulaireCreationComponent;
  let fixture: ComponentFixture<PopupFormulaireCreationComponent>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideDestinataireService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(waitForAsync(() => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const apiAdelaideSpy = jasmine.createSpyObj('ApiAdelaideDestinataireService', ['createDestinataires']);
    const filterSharedDataServiceSpy = jasmine.createSpyObj('FilterSharedDataService', ['updateData']);
    const activeModalSpy = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [PopupFormulaireCreationComponent],
      providers: [
        FormBuilder,
        NgbActiveModal,
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: ApiAdelaideDestinataireService, useValue: apiAdelaideSpy },
        { provide: FilterSharedDataService, useValue: filterSharedDataServiceSpy },
        { provide: NgbActiveModal, useValue: activeModalSpy },
      ],
    }).compileComponents();

    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockApiAdelaideService = TestBed.inject(ApiAdelaideDestinataireService) as jasmine.SpyObj<ApiAdelaideDestinataireService>;
    mockFilterSharedDataService = TestBed.inject(FilterSharedDataService) as jasmine.SpyObj<FilterSharedDataService>;
    mockActiveModal = TestBed.inject(NgbActiveModal) as jasmine.SpyObj<NgbActiveModal>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFormulaireCreationComponent);
    component = fixture.componentInstance;
    component.organismes = [
      {
        code: '116',
        libelle: 'URSSAF REGIONALE ILE DE FRANCE',
        codeRegion: '116',
      },
      {
        code: '117',
        libelle: 'URSSAF REGIONALE ILE DE FRANCE',
        codeRegion: '117',
      },
    ];
    component.modalRef = new NgbActiveModal();
    fixture.detectChanges();
  });

  it('closePopup validity', () => {
    spyOn(component.modalRef, 'close');
    component.closePopup();
    fixture.detectChanges();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.controls.organismes).toBeTruthy();
    expect(component.formGroup.controls.destinataire).toBeTruthy();
    expect(component.formGroup.controls.designation).toBeTruthy();
    expect(component.formGroup.controls.imprimante).toBeTruthy();
  });

  it('onChangeOrganisme validity', () => {
    component.onChangeOrganisme([
      { title: '116', selected: true },
      { title: '117', selected: true },
    ]);
    fixture.detectChanges();

    expect(component.organismesSelected).toEqual(['116', '117']);
  });

  it('should create destinataire correctly', () => {
    const destinataire = component.formGroup.controls['destinataire'];
    const designation = component.formGroup.controls['designation'];
    const organismes = component.formGroup.controls['organismes'];
    destinataire.setValue('DEST');
    designation.setValue('DEST');
    const formState = organismes.getRawValue();
    for (const elem in formState) {
      for (const opt in formState[elem]) {
        formState[elem][opt] = true;
      }
    }
    organismes.patchValue(formState);
    component.organismesSelected = ['116', '117'];
    const mockResponse = {
      data: {
        createDestinataires: [
          {
            code: 'DEST',
            codeOrg: '116',
            libelle: 'DEST',
            refPri: '',
          },
          {
            code: 'DEST',
            codeOrg: '117',
            libelle: 'DEST',
            refPri: '',
          },
        ],
      },
    };
    const createsDTO = [];
    createsDTO.push(new Destinataire('DEST', '116', 'DEST', ''));
    createsDTO.push(new Destinataire('DEST', '117', 'DEST', ''));
    mockApiAdelaideService.createDestinataires.and.returnValue(of(mockResponse));

    component.passBack();
    fixture.detectChanges();

    expect(mockApiAdelaideService.createDestinataires).toHaveBeenCalledWith(createsDTO);
    expect(component.createDestinatairesNumber).toEqual(2);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: '2 destinataires ont été ajoutées avec succès.',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should create destinataire with destinataire existed correctly', () => {
    const destinataire = component.formGroup.controls['destinataire'];
    const designation = component.formGroup.controls['designation'];
    const organismes = component.formGroup.controls['organismes'];
    destinataire.setValue('DEST');
    designation.setValue('DEST');
    const formState = organismes.getRawValue();
    for (const elem in formState) {
      for (const opt in formState[elem]) {
        formState[elem][opt] = true;
      }
    }
    organismes.patchValue(formState);
    component.organismesSelected = ['116', '117'];
    const mockResponse = {
      data: {
        createDestinataires: [
          {
            code: 'DEST',
            codeOrg: '116',
            libelle: 'DEST',
            refPri: '',
          },
        ],
      },
    };
    const createsDTO = [];
    createsDTO.push(new Destinataire('DEST', '116', 'DEST', ''));
    createsDTO.push(new Destinataire('DEST', '117', 'DEST', ''));
    mockApiAdelaideService.createDestinataires.and.returnValue(of(mockResponse));

    component.passBack();
    fixture.detectChanges();

    expect(mockApiAdelaideService.createDestinataires).toHaveBeenCalledWith(createsDTO);
    expect(component.createDestinatairesNumber).toEqual(1);
    expect(createsDTO.length != mockResponse.data.createDestinataires.length).toBeTrue();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Le destinataire a été ajoutée avec succès.  Les destinataires existants ne sont pas modifiés.',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle error when creating destinataire fails', () => {
    const destinataire = component.formGroup.controls['destinataire'];
    const designation = component.formGroup.controls['designation'];
    const organismes = component.formGroup.controls['organismes'];
    destinataire.setValue('DEST');
    designation.setValue('DEST');
    const formState = organismes.getRawValue();
    for (const elem in formState) {
      for (const opt in formState[elem]) {
        formState[elem][opt] = true;
      }
    }
    organismes.patchValue(formState);
    component.organismesSelected = ['116', '117'];
    const error = { graphQLErrors: [{ message: 'Erreur de création' }] };
    mockApiAdelaideService.createDestinataires.and.returnValue(throwError(error));

    component.passBack();
    fixture.detectChanges();

    expect(mockApiAdelaideService.createDestinataires).toHaveBeenCalled();
    expect(component.errorPass).toEqual('Erreur de création');
  });

  it('should handle error when validate organisme', () => {
    const destinataire = component.formGroup.controls['destinataire'];
    const designation = component.formGroup.controls['designation'];
    const organismes = component.formGroup.controls['organismes'];
    component.passBack();
    fixture.detectChanges();

    expect(component.formGroup.valid).toBeFalsy();
    expect(mockApiAdelaideService.createDestinataires).not.toHaveBeenCalled();
    expect(organismes.errors.message).toEqual(component.errorOrganismes);
    expect(destinataire.errors.message).toEqual(component.errorDestinataire);
    expect(designation.errors.message).toEqual(component.errorDesignation);
  });

  it('test validation du champ designation', () => {
    const designation = component.formGroup.controls['designation'];
    // test les caracères autorisés : ['-', '_', ' ', '.']
    designation.setValue('DEST_1234- .');
    expect(designation.valid).toBeTruthy();
    designation.setValue('DEST_1234- .:');
    expect(designation.valid).toBeFalsy();
    designation.setValue('DEST_1234- .:()èçà');
    expect(designation.valid).toBeFalsy();
  });
});
