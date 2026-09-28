import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInvalidationEtapeComponent } from './modal-invalidation-etape.component';
import { ApiInvalidationEtapeService } from '../../service/api-invalidation-etape.service';
import { LoginService } from '@acoss/prisme-angular-intranet';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MenuData } from '../../models/occurrence-etape-interfaces';
import { of } from 'rxjs';

describe('ModalInvalidationEtapeComponent', () => {
  let component: ModalInvalidationEtapeComponent;
  let fixture: ComponentFixture<ModalInvalidationEtapeComponent>;
  let apiInvalidationEtapeService: jasmine.SpyObj<ApiInvalidationEtapeService>;
  let loginServiceMock: jasmine.SpyObj<LoginService>;
  let noteServiceMock: jasmine.SpyObj<NotesService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    // Créer un mock du service
    apiInvalidationEtapeService = jasmine.createSpyObj('ApiInvalidationEtapeService', ['invalideGenEtpEtLiens']);
    loginServiceMock = jasmine.createSpyObj('LoginService', ['getIdentifiantUtilisateur']);
    noteServiceMock = jasmine.createSpyObj('NotesService', ['show']);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ModalInvalidationEtapeComponent],
      providers: [
        { provide: ApiInvalidationEtapeService, useValue: apiInvalidationEtapeService },
        { provide: LoginService, useValue: loginServiceMock },
        { provide: NotesService, useValue: noteServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        NgbActiveModal,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInvalidationEtapeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate correctly', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { invalideGenEtpEtLiens: {} } } = {
      data: {
        invalideGenEtpEtLiens: {
          erreur: null,
        },
      },
    };

    // définir la propriété menuData avant d'appeler la méthode
    component.menuData = {} as MenuData;

    // Configurer le mock pour retourner la réponse valide
    apiInvalidationEtapeService.invalideGenEtpEtLiens.and.returnValue(of(mockResponse as any));

    // Appeler la méthode pour invalider le step
    component.invalideGenEtpEtLiens();
  });
});
