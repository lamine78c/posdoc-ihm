import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccueilMessagesComponent } from './accueil-messages.component';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { ApiAdelaideOrganismeService } from '@app/services/api-adelaide-organisme.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { ContenuForAccueilInterface } from '@app/models/contenu-for-accueil';
import { Organisme } from '@app/models/organisme';
import { LoginService } from '@acoss/prisme-angular-intranet';
import { ApiAdelaideRegionService } from '@app/services/api-adelaide-region.service';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';

describe('AccueilMessagesComponent', () => {
  let component: AccueilMessagesComponent;
  let fixture: ComponentFixture<AccueilMessagesComponent>;
  let apiContenuServiceSpy: jasmine.SpyObj<ApiAdelaideContenuService>;
  let apiOrganismeServiceSpy: jasmine.SpyObj<ApiAdelaideOrganismeService>;
  let apiRegionServiceSpy: jasmine.SpyObj<ApiAdelaideRegionService>;

  beforeEach(async () => {
    apiContenuServiceSpy = jasmine.createSpyObj('ApiAdelaideContenuService', ['getContenusForAccueil']);
    apiOrganismeServiceSpy = jasmine.createSpyObj('ApiAdelaideOrganismeService', ['getCodesOrganismesByRegions']);
    apiRegionServiceSpy = jasmine.createSpyObj('ApiAdelaideRegionService', ['getAllRegions']);

    const loginServiceMock = {
      getInfos: jasmine.createSpy('getInfos').and.returnValue({
        infosUtilisateurFront: {
          access: [],
        },
      }),
    };

    await TestBed.configureTestingModule({
      declarations: [AccueilMessagesComponent],
      providers: [
        Apollo,
        { provide: ApiAdelaideContenuService, useValue: apiContenuServiceSpy },
        { provide: ApiAdelaideOrganismeService, useValue: apiOrganismeServiceSpy },
        { provide: ApiAdelaideRegionService, useValue: apiRegionServiceSpy },
        { provide: LoginService, useValue: loginServiceMock },
      ],
    }).compileComponents();

    const mockContenusForAccueilResponse = {
      data: {
        getContenusForAccueil: [
          {
            titre: 'Test',
            message: `
              <p>
                <strong style=\"color: red;\">
                  <u>Ceci est un message très important !!!</u>
                </strong>
              </p>
            `,
            regions: ['reg1', 'reg2'],
            sanitizedMessage: null,
          },
        ],
      },
    };
    apiContenuServiceSpy.getContenusForAccueil.and.returnValue(of(mockContenusForAccueilResponse as ApolloQueryResult<ContenuForAccueilInterface>));

    const mockCodesOrganismesByRegions = {
      data: {
        getCodesOrganismesByRegions: ['117', '437', '977'],
      },
    };
    apiOrganismeServiceSpy.getCodesOrganismesByRegions.and.returnValue(of(mockCodesOrganismesByRegions as ApolloQueryResult<Organisme>));

    const mockAllRegions = {
      data: {
        getAllRegions: [{ code: '117', libelle: 'Region 117', isNotAuthorisedToBeDeleted: false }],
      },
    };
    apiRegionServiceSpy.getAllRegions.and.returnValue(of(mockAllRegions as any));

    fixture = TestBed.createComponent(AccueilMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cards on API call', () => {
    component.messages$.subscribe(messages => {
      expect(messages.length).toEqual(1);
      expect(messages[0].sanitizedMessage).toBeTruthy();
    });
  });
});
