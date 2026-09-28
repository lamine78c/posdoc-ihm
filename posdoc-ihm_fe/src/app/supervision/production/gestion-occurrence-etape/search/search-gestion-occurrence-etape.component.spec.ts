import { of, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { SearchGestionOccurrenceEtapeComponent } from '@app/supervision/production/gestion-occurrence-etape/search/search-gestion-occurrence-etape.component';
import { TestBed } from '@angular/core/testing';
import { GestionOccurrenceEtapeModalComponent } from '@app/supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';

describe('SearchGestionOccurrenceEtapeComponent', () => {
  let component: SearchGestionOccurrenceEtapeComponent;
  let apiGestionOccurrenceEtapeService: jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let noteService: jasmine.SpyObj<NotesService>;
  let sessionDataSearchService: jasmine.SpyObj<SessionDataSearchService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiGestionOccurrenceEtapeService', ['getOccurrenceEtapeData']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    const noteServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const sessionDataSearchServiceSpy = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession', 'initDataSearchFromSession']);

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        DatePipe,
        SearchGestionOccurrenceEtapeComponent,
        { provide: ApiGestionOccurrenceEtapeService, useValue: apiServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: NotesService, useValue: noteServiceSpy },
        { provide: SessionDataSearchService, useValue: sessionDataSearchServiceSpy },
      ],
    });

    component = TestBed.inject(SearchGestionOccurrenceEtapeComponent);
    apiGestionOccurrenceEtapeService = TestBed.inject(ApiGestionOccurrenceEtapeService) as jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    noteService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    sessionDataSearchService = TestBed.inject(SessionDataSearchService) as jasmine.SpyObj<SessionDataSearchService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchOccurrenceEtape and open modal on successful API response', () => {
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
    const modalRefSpy = jasmine.createSpyObj('modalRef', ['componentInstance']);

    apiGestionOccurrenceEtapeService.getOccurrenceEtapeData.and.returnValue(of(mockResponse as any));
    modalService.open.and.returnValue(modalRefSpy);

    component.searchOccurrenceEtape();

    expect(apiGestionOccurrenceEtapeService.getOccurrenceEtapeData).toHaveBeenCalled();
    expect(modalService.open).toHaveBeenCalledWith(GestionOccurrenceEtapeModalComponent);
    expect(modalRefSpy.componentInstance.searchOccurrenceEtapeData).toEqual(mockResponse.data.searchOccurrenceEtape);
  });

  it('should log an error when the API call fails', () => {
    const mockError = {
      errors: [
        {
          message: 'API error',
        },
      ],
    };

    apiGestionOccurrenceEtapeService.getOccurrenceEtapeData.and.returnValue(throwError(mockError));

    component.searchOccurrenceEtape();

    expect(apiGestionOccurrenceEtapeService.getOccurrenceEtapeData).toHaveBeenCalled();
    expect(noteService.show).toHaveBeenCalledWith({
      title: 'Une erreur est survenue',
      classname: 'note-erreur',
      body: 'API error',
      category: ToastCategoryEnum.ERROR,
    });
  });

  it('should log an error when modalRef is undefined', () => {
    const mockResponse = {
      data: {
        searchOccurrenceEtape: [],
      },
    };
    apiGestionOccurrenceEtapeService.getOccurrenceEtapeData.and.returnValue(of(mockResponse as any));
    modalService.open.and.returnValue(undefined);

    component.searchOccurrenceEtape();

    expect(noteService.show).toHaveBeenCalledWith({
      title: 'Une erreur est survenue',
      classname: 'note-erreur',
      body: `Échec de l'ouverture de la fenêtre modale ou modalRef est indéfini`,
      category: ToastCategoryEnum.ERROR,
    });
  });
});
