import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { of } from 'rxjs';
import { ActionUtilisateurComponent } from './action-utilisateur.component';
import { SearchActionUtilisateurByQuery } from './model/search-action-utilisateur-by-query';
import { ApiAdelaideActionUtilisateurService } from './service/api-adelaide-action-utilisateur.service';
import { GridApi } from 'ag-grid-community';

describe('ActionUtilisateurComponent', () => {
  let component: ActionUtilisateurComponent;
  let fixture: ComponentFixture<ActionUtilisateurComponent>;
  let apiAdelaideService: jasmine.SpyObj<ApiAdelaideActionUtilisateurService>;

  beforeEach(waitForAsync(() => {
    const apiSpy = jasmine.createSpyObj('ApiAdelaideActionUtilisateurService', ['searchActionUtilisateurByQuery']);
    TestBed.configureTestingModule({
      declarations: [ActionUtilisateurComponent],
      providers: [{ provide: ApiAdelaideActionUtilisateurService, useValue: apiSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(ActionUtilisateurComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      setFilterModel: jasmine.createSpy('setFilterModel'),
      onFilterChanged: jasmine.createSpy('onFilterChanged'),
      refreshHeader: jasmine.createSpy('refreshHeader'),
      resetColumnState: jasmine.createSpy('resetColumnState'),
    } as unknown as GridApi;
    apiAdelaideService = TestBed.inject(ApiAdelaideActionUtilisateurService) as jasmine.SpyObj<ApiAdelaideActionUtilisateurService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate rowData on successful API call', () => {
    const mockEvent: SearchActionUtilisateurByQuery = {
      dtdeb: '2024-10-06',
      dtfin: '2024-10-06',
    };
    const mockResponse = {
      data: {
        findUtiLogByQuery: [
          {
            codulo: 'test',
            codsta: 'test',
            codusr: 'test',
            formid: 'test',
            datulo: 'test',
            action: 'test',
            params: null,
            result: false,
            versio: 'test',
            erreur: null,
          },
        ],
      },
    };
    apiAdelaideService.searchActionUtilisateurByQuery.and.returnValue(of(mockResponse as any));
    component.lister(mockEvent);
    expect(component.rowData.length).toBe(1);
  });
});
