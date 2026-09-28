import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApiAdelaideActionService } from '@app/services/api-adelaide-action.service';
import { GridApi } from 'ag-grid-community';
import { of } from 'rxjs';
import { ActionComponent } from './action.component';
import { SearchHistoryByQuery } from './model/search-history-by-query';

describe('ActionComponent', () => {
  let component: ActionComponent;
  let fixture: ComponentFixture<ActionComponent>;
  let apiAdelaideService: jasmine.SpyObj<ApiAdelaideActionService>;

  beforeEach(waitForAsync(() => {
    const apiSpy = jasmine.createSpyObj('ApiAdelaideActionService', ['searchHistoryByQuery']);
    TestBed.configureTestingModule({
      declarations: [ActionComponent],
      providers: [{ provide: ApiAdelaideActionService, useValue: apiSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(ActionComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      setFilterModel: jasmine.createSpy('setFilterModel'),
      onFilterChanged: jasmine.createSpy('onFilterChanged'),
      refreshHeader: jasmine.createSpy('refreshHeader'),
      resetColumnState: jasmine.createSpy('resetColumnState'),
    } as unknown as GridApi;
    apiAdelaideService = TestBed.inject(ApiAdelaideActionService) as jasmine.SpyObj<ApiAdelaideActionService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate rowData on successful API call', () => {
    const mockEvent: SearchHistoryByQuery = {
      dtdeb: '2024-10-06',
      dtfin: '2024-10-06',
      user: 'AC123',
    };
    const mockResponse = {
      data: {
        findHistoryByQuery: [
          {
            id: 'test',
            station: 'test',
            utilisateur: 'test',
            insertionDate: '2022-12-12',
            actionUtilisateur: 'test',
            condition: 'test',
            entite: 'test',
            entree: 'test',
            sortie: 'test',
          },
        ],
      },
    };
    apiAdelaideService.searchHistoryByQuery.and.returnValue(of(mockResponse as any));
    component.lister(mockEvent);
    expect(component.rowData.length).toBe(1);
  });
});
