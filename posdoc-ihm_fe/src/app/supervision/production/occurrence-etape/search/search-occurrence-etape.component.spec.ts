import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { ApolloTestingModule } from 'apollo-angular/testing'; // Import this module
import { of } from 'rxjs';
import { SearchOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/search/search-occurrence-etape.component';
import { ApolloQueryResult } from '@apollo/client';
import { OccurrenceEtapeSearchDataInterface } from '@app/models/supervision/video-step-interface';
import { Apollo, APOLLO_FLAGS, APOLLO_OPTIONS } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';

describe('SearchOccurrenceEtapeComponent', () => {
  let component: SearchOccurrenceEtapeComponent;
  let fixture: ComponentFixture<SearchOccurrenceEtapeComponent>;
  let apiService: jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiGestionOccurrenceEtapeService', ['getOccurrenceEtapeSearchData', 'getOccurrenceEtapePercodSearchData']);

    // Mock data for history.state with paramData initialized
    const mockHistoryState = {
      data: {
        paramData: {
          codOrg: 'org1',
          perCod: '2021-01',
          codEnv: 'env1',
          codApp: 'app1',
        },
      },
    };

    // Mock the history.state to simulate navigation state with paramData
    spyOnProperty(window, 'history').and.returnValue({
      state: mockHistoryState,
    });

    // Define the mock response
    const mockResponse = {
      data: {
        allOrganismes: [],
        getOccurrenceEtapeSearchData: [
          {
            codenv: 'env1',
            codapp: 'app1',
            codorg: 'org1',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
      stale: false,
    };

    apiService.getOccurrenceEtapeSearchData.and.returnValue(of<ApolloQueryResult<OccurrenceEtapeSearchDataInterface>>(mockResponse));

    TestBed.configureTestingModule({
      declarations: [SearchOccurrenceEtapeComponent],
      imports: [
        ApolloTestingModule, // Import the ApolloTestingModule
      ],
      providers: [{ provide: ApiGestionOccurrenceEtapeService, useValue: apiService }, FormBuilder, Apollo],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchOccurrenceEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.controls['environnement']).toBeTruthy();
    expect(component.form.controls['organisme']).toBeTruthy();
    expect(component.form.controls['application']).toBeTruthy();
    expect(component.form.controls['periode']).toBeTruthy();
  });

  it('should call getEnvsFromGenEtp on init', () => {
    spyOn(component, 'getEnvsFromGenEtp').and.callThrough();
    component.ngOnInit();
    expect(component.getEnvsFromGenEtp).toHaveBeenCalled();
  });
});
