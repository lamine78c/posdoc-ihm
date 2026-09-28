import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ModalComponentComponent } from './modal-component.component';

describe('ModalComponentComponent', () => {
  let component: ModalComponentComponent;
  let fixture: ComponentFixture<ModalComponentComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideDistributionService>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let fb: FormBuilder;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideDistributionService', ['getAPIsForCompleteParametreEdition', 'createExemplaires']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);
    mockApiService.getAPIsForCompleteParametreEdition.and.returnValue(
      of({
        data: {
          findExemplaireOrganismeToComplete: [],
          allOrganismes: [
            {
              code: 't',
              codeRegion: 't',
            },
          ],
        },
        loading: false,
        networkStatus: 7,
      })
    );

    await TestBed.configureTestingModule({
      declarations: [ModalComponentComponent],
      providers: [{ provide: ApiAdelaideDistributionService, useValue: mockApiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponentComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.modalRef = mockModal;
    component.formGroup = fb.group({
      organismes: fb.group({
        '117': fb.group({ '117': [true] }),
      }),
      copiesNbre: 1,
    });
    component.selectedNodes = [
      {
        data: {
          codenv: 'p',
          codorg: '117',
          codapp: 'snv2',
          codcom: 'com',
          codfic: 'fic',
          codgam: 'gam',
          numexe: 1,
          codsit: 'sit',
          codres: 'res',
          coddes: 'des',
          exeact: true,
        },
      },
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create exemplaire correctly', () => {
    component.organismesSelected = ['117'];
    component.exemplaire = {
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
      numexe: 1,
      codsit: 't',
    };
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
            numexe: 1,
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
            numexe: 1,
            codsit: 't',
          },
        ],
      },
    };
    mockApiService.createExemplaires.and.returnValue(of(mockResponse as any));
    component.passBack();
  });

  it('onChangeOrganisme validity', () => {
    component.onChangeOrganisme([{ title: '117-117' }]);
    expect(component.organismesSelected).toEqual(['117']);
  });
});
