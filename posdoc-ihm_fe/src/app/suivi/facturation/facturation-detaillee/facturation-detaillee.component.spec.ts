import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacturationDetailleeComponent } from './facturation-detaillee.component';
import { ApiFacturationDetailleeService } from '@app/services/api-adelaide/suivi/api-facturation-detaillee.service';
import { of } from 'rxjs';
import { GridApi } from 'ag-grid-community';

describe('FacturationDetailleeComponent', () => {
  let component: FacturationDetailleeComponent;
  let fixture: ComponentFixture<FacturationDetailleeComponent>;
  let apiFacturationDetailleeService: jasmine.SpyObj<ApiFacturationDetailleeService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiFacturationDetailleeService', ['searchFacturationDetaillee']);

    await TestBed.configureTestingModule({
      declarations: [FacturationDetailleeComponent],
      providers: [{ provide: ApiFacturationDetailleeService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FacturationDetailleeComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      setFilterModel: jasmine.createSpy('setFilterModel'),
      onFilterChanged: jasmine.createSpy('onFilterChanged'),
      refreshHeader: jasmine.createSpy('refreshHeader'),
      resetColumnState: jasmine.createSpy('resetColumnState'),
      setGridOption: jasmine.createSpy('setGridOption'),
    } as unknown as GridApi;
    apiFacturationDetailleeService = TestBed.inject(ApiFacturationDetailleeService) as jasmine.SpyObj<ApiFacturationDetailleeService>;
  });

  it('should call searchFacturationDetaillee and transform data', () => {
    const mockEvent = {};
    const mockResponse = {
      data: {
        searchFacturationDetaillee: {
          facturationDetailleeWithAllColumns: [
            {
              codorg: '117',
              codapp: 'SNV2',
              codcom: 'AD04',
              codfic: 'L00',
              dfiexp: '2024-12-25T00:00:00',
              codsit: 'CIRTIL',
              codreg: '117',
              codcli: 'UR117',
              totalPages: 220,
              totalPlis: 209,
              coutTotal: 0,
              tarifs: [
                { codeTar: 'LET', plis: 88, cout: 0 },
                { codeTar: 'DD', plis: 121, cout: 0 },
              ],
            },
            {
              codorg: '117',
              codapp: 'SNV2',
              codcom: 'AD04',
              codfic: 'L00',
              dfiexp: '2025-01-01T00:00:00',
              codsit: 'CIRSO',
              codreg: '117',
              codcli: 'UR117',
              totalPages: 21,
              totalPlis: 85,
              coutTotal: 48.45,
              tarifs: [{ codeTar: 'LET', plis: 85, cout: 48.45 }],
            },
          ],
          message: '',
        },
      },
    };

    const expectedTransformedData = [
      {
        codorg: '117',
        codapp: 'SNV2',
        codcom: 'AD04',
        codfic: 'L00',
        dfiexp: '2024-12-25T00:00:00',
        codsit: 'CIRTIL',
        codreg: '117',
        codcli: 'UR117',
        totalPages: 220,
        totalPlis: 209,
        coutTotal: 0,
        coutLET: 0,
        plisLET: 88,
        coutDD: 0,
        plisDD: 121,
      },
      {
        codorg: '117',
        codapp: 'SNV2',
        codcom: 'AD04',
        codfic: 'L00',
        dfiexp: '2025-01-01T00:00:00',
        codsit: 'CIRSO',
        codreg: '117',
        codcli: 'UR117',
        totalPages: 21,
        totalPlis: 85,
        coutTotal: 48.45,
        coutLET: 48.45,
        plisLET: 85,
      },
    ];

    apiFacturationDetailleeService.searchFacturationDetaillee.and.returnValue(of(mockResponse as any));
    fixture.detectChanges();

    component.searchFacturationDetaillee(mockEvent);

    const actualTransformedData = component.facturationDetaillee.filter((item: any, index: number) => index < expectedTransformedData.length);

    expect(apiFacturationDetailleeService.searchFacturationDetaillee).toHaveBeenCalled();
    expect(actualTransformedData).toEqual(expectedTransformedData);
  });
});
