import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchPliByQuery } from './model/search-pli';
import { ApiAdelaideSuiviAuPliService } from './service/api-adelaide-suivi-au-pli.service';
import { SuiviAuPliComponent } from './suivi-au-pli.component';
import { DatePipe } from '@angular/common';
import { GridApi } from 'ag-grid-community';

class MockDatePipe {
  transform(value: any, ...args: any[]): any {
    return 'Mocked Date';
  }
}

describe('SuiviAuPliComponent', () => {
  let component: SuiviAuPliComponent;
  let fixture: ComponentFixture<SuiviAuPliComponent>;
  let apiAdelaideSuiviAuPliService: jasmine.SpyObj<ApiAdelaideSuiviAuPliService>;
  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiAdelaideSuiviAuPliService', ['getAllSelectConfig', 'searchPliByQuery']);
    await TestBed.configureTestingModule({
      declarations: [SuiviAuPliComponent],
      providers: [
        {provide: ApiAdelaideSuiviAuPliService, useValue: apiSpy },
        {provide: DatePipe, useClass: MockDatePipe }],
    }).compileComponents();
    fixture = TestBed.createComponent(SuiviAuPliComponent);
    component = fixture.componentInstance;
    component.gridApi = {
          applyTransaction: jasmine.createSpy(),
          redrawRows: jasmine.createSpy(),
          setFilterModel: jasmine.createSpy('setFilterModel'),
          onFilterChanged: jasmine.createSpy('onFilterChanged'),
          refreshHeader: jasmine.createSpy('refreshHeader'),
          resetColumnState: jasmine.createSpy('resetColumnState'),
        } as unknown as GridApi;
    apiAdelaideSuiviAuPliService = TestBed.inject(ApiAdelaideSuiviAuPliService) as jasmine.SpyObj<ApiAdelaideSuiviAuPliService>;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should populate rowData on successful API call', () => {
    const mockEvent: SearchPliByQuery = {
      dtdeb: '2024-10-06',
      dtfin: '2024-10-06',
      numpli: '8',
      isCnav: false,
    };
    const mockResponse = {
      data: {
        searchPliByQuery: [
          {
            genpro: 'p_438_snv2_231205-00_00_pds4_l00_ma',
            numpli: '864023359746927',
            idtpli: '427 000000323201848',
            adres1: 'WINDSOR QUEEN ELIZABERTH LL             ',
            adres2: 'CHURCH MARRIARGE 02 11 2016 MID         ',
            adres3: 'WINDSOR QUEEN ELIZAB                    ',
            adres4: '14 BENEDICT STREET                      ',
            adres5: 'MIDDLESBROUGH ENGLAND UNIT              ',
            adres6: 'ROYAUME UNI                             ',
            adres7: null,
          },
        ],
      },
    };
    apiAdelaideSuiviAuPliService.searchPliByQuery.and.returnValue(of(mockResponse as any));
    component.lister(mockEvent);
    expect(component.rowData.length).toBe(1);
  });
});
