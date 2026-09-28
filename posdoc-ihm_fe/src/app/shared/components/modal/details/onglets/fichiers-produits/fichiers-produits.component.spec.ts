import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FichiersProduitsComponent } from './fichiers-produits.component';
import { ApiFichiersProduitsService } from '@app/services/api-adelaide/supervision/production/details/api-fichiers-produits.service';
import { of } from 'rxjs';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';

describe('FichiersProduitsComponent', () => {
  let component: FichiersProduitsComponent;
  let fixture: ComponentFixture<FichiersProduitsComponent>;
  let apiFichiersProduitsServiceSpy: jasmine.SpyObj<ApiFichiersProduitsService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiFichiersProduitsService', ['getDetailsFichiersProduits']);

    await TestBed.configureTestingModule({
      declarations: [FichiersProduitsComponent],
      providers: [{ provide: ApiFichiersProduitsService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FichiersProduitsComponent);
    component = fixture.componentInstance;
    apiFichiersProduitsServiceSpy = TestBed.inject(ApiFichiersProduitsService) as jasmine.SpyObj<ApiFichiersProduitsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve details fichiers produits and update the component state', () => {
    const mockResponse = {
      data: {
        getDetailsFichiersProduits: [
          {
            codcom: 'C001',
            codfic: 'F001',
            numcom: 'N001',
            refimp: 'R001',
            codprd: 'P001',
            libFichier: 'LibFichier1',
            pagFic: 'PAG001',
            codgam: 'GAM001',
            codsit: 'SIT001',
            codres: 'RES001',
            coddes: 'DES001',
            nbrexe: 10,
          },
          {
            codcom: 'C002',
            codfic: 'F002',
            numcom: 'N002',
            refimp: 'R002',
            codprd: 'P002',
            libFichier: 'LibFichier2',
            pagFic: 'PAG002',
            codgam: 'GAM002',
            codsit: 'SIT002',
            codres: 'RES002',
            coddes: 'DES002',
            nbrexe: 20,
          },
        ],
      },
    };

    component.paramData = {} as OngletsParamDataModel;
    apiFichiersProduitsServiceSpy.getDetailsFichiersProduits.and.returnValue(of(mockResponse as any));

    component.getDetailsFichiersProduits();

    expect(apiFichiersProduitsServiceSpy.getDetailsFichiersProduits).toHaveBeenCalledWith(component.paramData);
    expect(component.detailFichiersProduits).toEqual((mockResponse as any).data.getDetailsFichiersProduits);
    expect(component.totalCmdFic).toBe(2);
  });

  it('should handle empty response from API', () => {
    const mockResponse = {
      data: {
        getDetailsFichiersProduits: [],
      },
    };

    component.paramData = {} as OngletsParamDataModel;
    apiFichiersProduitsServiceSpy.getDetailsFichiersProduits.and.returnValue(of(mockResponse as any));

    component.getDetailsFichiersProduits();

    expect(apiFichiersProduitsServiceSpy.getDetailsFichiersProduits).toHaveBeenCalledWith(component.paramData);
    expect(component.totalCmdFic).toBe(0);
  });
});
