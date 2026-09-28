import { TestBed } from '@angular/core/testing';
import { GestionOccurrenceEtapeModalComponent } from './gestion-occurrence-etape-modal.component';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { GestionOccurrenceEtapePayloadModel } from '@app/models/supervision/production/gestion-occurrence-etape-payload-model';
import { of, throwError } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { FormBuilder } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { LoginService } from '@acoss/prisme-angular-intranet';

describe('GestionOccurrenceEtapeModalComponent', () => {
  let component: GestionOccurrenceEtapeModalComponent;
  let apiGestionOccurrenceEtapeService: jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;
  let modalService: jasmine.SpyObj<NgbActiveModal>;
  let noteService: jasmine.SpyObj<NotesService>;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiGestionOccurrenceEtapeService', ['getOccurrenceEtapeData']);
    const modalServiceSpy = jasmine.createSpyObj('NgbActiveModal', ['open']);
    const noteServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const loginServiceSpy = jasmine.createSpyObj('LoginService', ['getIdentifiantUtilisateur']);

    TestBed.configureTestingModule({
      providers: [
        GestionOccurrenceEtapeModalComponent,
        FormBuilder,
        { provide: ApiGestionOccurrenceEtapeService, useValue: apiServiceSpy },
        { provide: NgbActiveModal, useValue: modalServiceSpy },
        { provide: NotesService, useValue: noteServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        provideRouter([]),
      ],
    });

    component = TestBed.inject(GestionOccurrenceEtapeModalComponent);
    apiGestionOccurrenceEtapeService = TestBed.inject(ApiGestionOccurrenceEtapeService) as jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;
    modalService = TestBed.inject(NgbActiveModal) as jasmine.SpyObj<NgbActiveModal>;
    noteService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    loginService = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchOccurrenceEtape and set searchOccurrenceEtapeResponse on success', () => {
    // Mock paramData
    component.paramData = {
      codEnv: 'T',
      codOrg: '737',
      codApp: 'SNV2',
      perCod: '230816-00',
    };

    const expectedPayload = new GestionOccurrenceEtapePayloadModel();
    expectedPayload.codenv = 'T';
    expectedPayload.codorg = '737';
    expectedPayload.codapp = 'SNV2';
    expectedPayload.percod = '230816-00';
    expectedPayload.codcom = null;
    expectedPayload.codfic = null;
    expectedPayload.codgam = null;
    expectedPayload.codsit = null;
    expectedPayload.codres = null;
    expectedPayload.codser = null;
    expectedPayload.typetp = null;
    expectedPayload.statut = null;
    expectedPayload.codver = null;
    expectedPayload.typdat = null;
    expectedPayload.datdeb = null;
    expectedPayload.datfin = null;

    const mockResponse = {
      data: {
        searchOccurrenceEtape: [
          {
            typetp: 'DEB',
            codenv: 'T',
            codorg: '737',
            codapp: 'SNV2',
            percod: '230816-00',
            codcom: '',
            numcom: '',
            codfic: '',
            codgam: null,
            numexe: null,
            codres: null,
            codsit: null,
            coddes: null,
            nbrexe: 0,
            codser: null,
            codsig: 'S01',
            signal: 't_737_snv2_230816-00_n',
            reedit: false,
            fabsim: false,
            statut: 'T',
            codinf: 0,
            create: '2023-08-18T11:21:06',
            valide: '2023-08-18T11:21:06',
            debute: '2023-08-18T11:21:06',
            termin: '2023-08-18T11:21:06',
            invali: null,
            suspen: null,
            histor: null,
            script: '/adldatas/tmp/t_737_snv2_230816-00/divers/s01.sh',
          },
        ],
      },
    };

    apiGestionOccurrenceEtapeService.getOccurrenceEtapeData.and.returnValue(of(mockResponse as any));

    component.searchOccurrenceEtape();

    expect(apiGestionOccurrenceEtapeService.getOccurrenceEtapeData).toHaveBeenCalledWith(expectedPayload);
    expect(component.searchOccurrenceEtapeResponse).toEqual(mockResponse.data.searchOccurrenceEtape);
  });

  it('should call noteService.show when the API call fails', () => {
    // Mock paramData
    component.paramData = {
      codEnv: 'T',
      codOrg: '737',
      codApp: 'SNV2',
      perCod: '230816-00',
    };

    const expectedPayload = new GestionOccurrenceEtapePayloadModel();
    expectedPayload.codenv = 'T';
    expectedPayload.codorg = '737';
    expectedPayload.codapp = 'SNV2';
    expectedPayload.percod = '230816-00';
    expectedPayload.codcom = null;
    expectedPayload.codfic = null;
    expectedPayload.codgam = null;
    expectedPayload.codsit = null;
    expectedPayload.codres = null;
    expectedPayload.codser = null;
    expectedPayload.typetp = null;
    expectedPayload.statut = null;
    expectedPayload.codver = null;
    expectedPayload.typdat = null;
    expectedPayload.datdeb = null;
    expectedPayload.datfin = null;

    const mockError = {
      errors: [
        {
          message: 'API error',
        },
      ],
    };

    apiGestionOccurrenceEtapeService.getOccurrenceEtapeData.and.returnValue(throwError(mockError));

    component.searchOccurrenceEtape();

    expect(apiGestionOccurrenceEtapeService.getOccurrenceEtapeData).toHaveBeenCalledWith(expectedPayload);
    expect(noteService.show).toHaveBeenCalledWith({
      title: 'Une erreur est survenue',
      classname: 'note-erreur',
      body: 'API error',
      category: ToastCategoryEnum.ERROR,
    });
  });
});
