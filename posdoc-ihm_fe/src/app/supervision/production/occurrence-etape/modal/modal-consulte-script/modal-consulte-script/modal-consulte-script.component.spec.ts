import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { MenuData } from '../../../models/occurrence-etape-interfaces';
import { ApiConsulteScriptEtapeService } from '../../../service/api-consulte-script-etape.service';

import { ModalConsulteScriptComponent } from './modal-consulte-script.component';

describe('ModalConsulteScriptComponent', () => {
  let component: ModalConsulteScriptComponent;
  let fixture: ComponentFixture<ModalConsulteScriptComponent>;
  let apiConsulteScriptEtapeService: jasmine.SpyObj<ApiConsulteScriptEtapeService>;

  beforeEach(async () => {
    // Créer un mock du service
    apiConsulteScriptEtapeService = jasmine.createSpyObj('ApiConsulteScriptEtapeService', ['consulteScriptEtape']);

    await TestBed.configureTestingModule({
      declarations: [ModalConsulteScriptComponent],
      providers: [
        // Fournir le mock du service
        { provide: ApiConsulteScriptEtapeService, useValue: apiConsulteScriptEtapeService },
        NgbActiveModal,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConsulteScriptComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return result correctly', () => {
    // // Mock de la réponse de l'API
    const mockResponse: { data: { consulteScriptEtape: {} } } = {
      data: {
        consulteScriptEtape: {
          result: 'test',
          error: null,
        },
      },
    };

    // définir la propriété menuData avant d'appeler la méthode
    component.menuData = {} as MenuData;

    // // Configurer le mock pour retourner la réponse
    apiConsulteScriptEtapeService.consulteScriptEtape.and.returnValue(of(mockResponse as any));

    // Appeler la méthode
    component.getScript();
  });
});
