import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiAdelaideActionService } from '@app/services/api-adelaide-action.service';
import { ONE } from '@app/shared/utils/Constants';
import { of } from 'rxjs';
import { DetailsActionUtilisateurComponent } from './details-action-utilisateur.component';
import { DateUtil } from '@app/shared/utils/DateUtil';

describe('DetailsActionUtilisateurComponent', () => {
  let component: DetailsActionUtilisateurComponent;
  let fixture: ComponentFixture<DetailsActionUtilisateurComponent>;
  let apiService: jasmine.SpyObj<ApiAdelaideActionService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiAdelaideActionService', ['searchHistoryByCodulo']);
    await TestBed.configureTestingModule({
      declarations: [DetailsActionUtilisateurComponent],
      providers: [{ provide: ApiAdelaideActionService, useValue: apiServiceSpy }, DateUtil],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsActionUtilisateurComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiAdelaideActionService) as jasmine.SpyObj<ApiAdelaideActionService>;
    component.codulo = 46590;
    component.title = 'test';
    component.rowData = {
      codulo: '46590',
      codsta: 'codsta',
      codusr: 'codusr',
      formid: 'formid',
      datulo: '2025-08-05T11:21:23.555444',
      action: 'action',
      params: 'params',
      result: true,
      versio: 'versio',
      erreur: null,
      ko: false,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate detail on successful API call', () => {
    const mockResponse = {
      data: {
        findHistoryByCodulo: [
          {
            id: 46590,
            station: '0:0:0:0:0:0:0:1',
            utilisateur: 'AC750G0090',
            insertionDate: '2025-08-05T11:21:23.555444',
            actionUtilisateur: 'INSERT',
            condition: 'c60_idpere=273',
            entite: 'Genlie',
            entree: null,
            sortie: 'c60_idpere=273, c60_idfils=272',
          },
        ],
      },
    };
    apiService.searchHistoryByCodulo.and.returnValue(of(mockResponse as any));
    component.getDetailByCodulo();
    expect(apiService.searchHistoryByCodulo).toHaveBeenCalledWith(component.codulo);
    expect(component.details.length).toBe(ONE);
  });
});
