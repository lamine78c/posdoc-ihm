import { LoginService } from '@acoss/prisme-angular-intranet';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { of } from 'rxjs';

import { GestionOccurrenceApplicationComponent } from './gestion-occurrence-application.component';

describe('GestionOccurrenceApplicationComponent', () => {
  let component: GestionOccurrenceApplicationComponent;
  let fixture: ComponentFixture<GestionOccurrenceApplicationComponent>;
  let apiAdelaideOccurenceApplicationServiceSpy: jasmine.SpyObj<ApiAdelaideOccurenceApplicationService>;
  let fb: FormBuilder;

  beforeEach(async () => {
    // Créer un mock du service
    apiAdelaideOccurenceApplicationServiceSpy = jasmine.createSpyObj('ApiAdelaideOccurenceApplicationService', ['getOccurrenceApplication']);

    await TestBed.configureTestingModule({
      declarations: [GestionOccurrenceApplicationComponent],
      providers: [
        FormBuilder,
        {
          // Fournir le mock du service
          provide: ApiAdelaideOccurenceApplicationService,
          useValue: apiAdelaideOccurenceApplicationServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              fragment: 'abc',
            },
          },
        },
        {
          provide: LoginService,
          useValue: {
            config: {
              cleStockage: 'abc',
              utiliserLocalStorageToken: true,
            },
            accessTokenService: {},
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionOccurrenceApplicationComponent);
    component = fixture.componentInstance;

    fb = TestBed.inject(FormBuilder);
    component.form = fb.group({
      typeRefection: [''],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate resultats on successful API call', () => {
    // Mock de la réponse de l'API avec des données valides
    const mockResponse: { data: { getOccurrenceApplication: any[] } } = {
      data: {
        getOccurrenceApplication: [
          {
            appsta: 'T',
            appinf: 'INFO',
            dapplc: '2023-01-01T00:00:00',
            dappld: '2023-01-01T00:00:00',
            dapplt: '2023-01-01T00:00:01',
            dappls: '',
            typref: 'I',
          },
        ],
      },
    };
    apiAdelaideOccurenceApplicationServiceSpy.getOccurrenceApplication.and.returnValue(of(mockResponse as any));
    component.searchGestionOccurrenceApplication = {
      codEnv: 'T',
      codOrg: 'OOL',
      codApp: 'MAS',
      perCod: '230323-00',
    };
    // Appeler la méthode
    component.search();
    // Vérifier que le résultat contient des données
    expect(component.resultat.length).toBeGreaterThan(0);
  });
});
