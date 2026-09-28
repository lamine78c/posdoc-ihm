import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchActionUtilisateurComponent } from './search-action-utilisateur.component';
import { ApiAdelaideActionUtilisateurService } from '../../service/api-adelaide-action-utilisateur.service';
import { ApiAdelaideDateService } from '@app/services/api-adelaide-date.service';
import { FormBuilder } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import {
  FindDistinctActionUtilogResultInterface,
  FindDistinctEntityUtilogResultInterface,
  FindDistinctUserUtilogResultInterface,
} from '../../model/search-action-utilisateur-by-query';
import { ApolloQueryResult } from 'apollo-client';

describe('SearchActionUtilisateurComponent', () => {
  let component: SearchActionUtilisateurComponent;
  let fixture: ComponentFixture<SearchActionUtilisateurComponent>;
  let apiAdelaideActionUtilisateurServiceSpy: jasmine.SpyObj<ApiAdelaideActionUtilisateurService>;
  let apiAdelaideDateServiceSpy: jasmine.SpyObj<ApiAdelaideDateService>;

  beforeEach(async () => {
    apiAdelaideActionUtilisateurServiceSpy = jasmine.createSpyObj('ApiAdelaideActionUtilisateurService', [
      'getDistinctAction',
      'getDistinctUser',
      'getDistinctEntity',
    ]);
    apiAdelaideDateServiceSpy = jasmine.createSpyObj('ApiAdelaideDateService', ['transformDateToString']);
    await TestBed.configureTestingModule({
      declarations: [SearchActionUtilisateurComponent],
      providers: [
        FormBuilder,
        Apollo,
        { provide: ApiAdelaideActionUtilisateurService, useValue: apiAdelaideActionUtilisateurServiceSpy },
        { provide: ApiAdelaideDateService, useValue: apiAdelaideDateServiceSpy },
      ],
    }).compileComponents();

    // Define the mock response
    const mockResponseFindDistinctActionUtilogResult = {
      data: {
        findDistinctActionUtilog: ['act1', 'act2'],
      },
      loading: false,
      networkStatus: 7,
      stale: false,
    };
    apiAdelaideActionUtilisateurServiceSpy.getDistinctAction.and.returnValue(
      of<ApolloQueryResult<FindDistinctActionUtilogResultInterface>>(mockResponseFindDistinctActionUtilogResult)
    );
    const mockResponseFindDistinctEntityUtilogResult = {
      data: {
        findDistinctFormIdUtilog: ['act1', 'act2'],
      },
      loading: false,
      networkStatus: 7,
      stale: false,
    };
    apiAdelaideActionUtilisateurServiceSpy.getDistinctEntity.and.returnValue(
      of<ApolloQueryResult<FindDistinctEntityUtilogResultInterface>>(mockResponseFindDistinctEntityUtilogResult)
    );
    const mockResponseFindDistinctUserUtilogResult = {
      data: {
        findDistinctUserUtilog: ['usr1', 'usr2'],
      },
      loading: false,
      networkStatus: 7,
      stale: false,
    };
    apiAdelaideActionUtilisateurServiceSpy.getDistinctUser.and.returnValue(
      of<ApolloQueryResult<FindDistinctUserUtilogResultInterface>>(mockResponseFindDistinctUserUtilogResult)
    );

    fixture = TestBed.createComponent(SearchActionUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.controls['fromDate']).toBeTruthy();
    expect(component.form.controls['toDate']).toBeTruthy();
    expect(component.form.controls['user']).toBeTruthy();
    expect(component.form.controls['action']).toBeTruthy();
    expect(component.form.controls['entity']).toBeTruthy();
    expect(component.form.controls['result']).toBeTruthy();
  });

  it('should call getAllDistinctUser on init', () => {
    spyOn(component, 'getAllDistinctUser').and.callThrough();
    component.ngOnInit();
    expect(component.getAllDistinctUser).toHaveBeenCalled();
  });

  it('should call getAllDistinctEntity on init', () => {
    spyOn(component, 'getAllDistinctEntity').and.callThrough();
    component.ngOnInit();
    expect(component.getAllDistinctEntity).toHaveBeenCalled();
  });

  it('should call getAllDistinctAction on init', () => {
    spyOn(component, 'getAllDistinctAction').and.callThrough();
    component.ngOnInit();
    expect(component.getAllDistinctAction).toHaveBeenCalled();
  });
});
