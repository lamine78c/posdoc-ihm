import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { of } from 'rxjs';

import { SearchGestionOccurrenceApplicationComponent } from './search-gestion-occurrence-application.component';

describe('SearchGestionOccurrenceApplicationComponent', () => {
  let component: SearchGestionOccurrenceApplicationComponent;
  let fixture: ComponentFixture<SearchGestionOccurrenceApplicationComponent>;
  let apiAdelaideOccurenceApplicationServiceSpy: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;

  beforeEach(async () => {
    // Créer un mock du service
    apiAdelaideOccurenceApplicationServiceSpy = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['getDistinctEnvOrgAppFromGenapp']);

    await TestBed.configureTestingModule({
      declarations: [SearchGestionOccurrenceApplicationComponent],
      providers: [
        FormBuilder,
        {
          provide: ApiAdelaideOccurenceApplicationService,
          useValue: apiAdelaideOccurenceApplicationServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchGestionOccurrenceApplicationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate resultats on successful API call', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getDistinctEnvOrgAppFromGenapp: any[] } } = {
      data: {
        getDistinctEnvOrgAppFromGenapp: [
          {
            codenv: 'T',
            codorg: '00L',
            codapp: 'MAS',
          },
        ],
      },
    };
    apiAdelaideOccurenceApplicationServiceSpy.getDistinctEnvOrgAppFromGenapp.and.returnValue(of(mockResponse as any));
    // Appeler la méthode
    component.getDistinctEnvOrgAppFromGenapp();
    // Vérifier que le résultat contient des données
    expect(component.searchData.length).toBeGreaterThan(0);
  });
});
