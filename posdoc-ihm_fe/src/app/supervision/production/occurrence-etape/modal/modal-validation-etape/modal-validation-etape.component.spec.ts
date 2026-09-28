import { LoginService } from '@acoss/prisme-angular-intranet';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { MenuData } from '../../models/occurrence-etape-interfaces';
import { ApiValidationEtapeService } from '../../service/api-validation-etape.service';

import { ModalValidationEtapeComponent } from './modal-validation-etape.component';

describe('ModalValidationEtapeComponent', () => {
  let component: ModalValidationEtapeComponent;
  let fixture: ComponentFixture<ModalValidationEtapeComponent>;
  let apiValidationEtapeService: jasmine.SpyObj<ApiValidationEtapeService>;
  let loginServiceMock: jasmine.SpyObj<LoginService>;
  let noteServiceMock: jasmine.SpyObj<NotesService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    // Créer un mock du service
    apiValidationEtapeService = jasmine.createSpyObj('ApiValidationEtapeService', ['valideEtape']);
    loginServiceMock = jasmine.createSpyObj('LoginService', ['getIdentifiantUtilisateur']);
    noteServiceMock = jasmine.createSpyObj('NotesService', ['show']);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ModalValidationEtapeComponent],
      providers: [
        // Fournir le mock du service
        { provide: ApiValidationEtapeService, useValue: apiValidationEtapeService },
        { provide: LoginService, useValue: loginServiceMock },
        { provide: NotesService, useValue: noteServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        NgbActiveModal,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalValidationEtapeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Vérifier que le composant est créé avec succès
    expect(component).toBeTruthy();
  });

  it('should valider correctly', () => {
    // // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { valideGenEtp: {} } } = {
      data: {
        valideGenEtp: {
          erreur: null,
        },
      },
    };

    // définir la propriété menuData avant d'appeler la méthode
    component.menuData = {} as MenuData;

    // // Configurer le mock pour retourner la réponse valide
    apiValidationEtapeService.valideEtape.and.returnValue(of(mockResponse as any));

    // Appeler la méthode pour valider le step
    component.valideStep();
  });
});
