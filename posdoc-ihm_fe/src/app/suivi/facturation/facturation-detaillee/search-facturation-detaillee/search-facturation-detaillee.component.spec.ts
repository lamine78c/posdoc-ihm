import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFacturationDetailleeComponent } from './search-facturation-detaillee.component';
import { ApiFacturationDetailleeService } from '@app/services/api-adelaide/suivi/api-facturation-detaillee.service';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DistinctEnvOrgAppSiteClientTarifInterface, FacturationDetailleeOptionsInterface } from '@app/models/suivi/facturation-detaillee-interface';
import { ApolloQueryResult } from '@apollo/client/core';

describe('SearchFacturationDetailleeComponent', () => {
  let component: SearchFacturationDetailleeComponent;
  let fixture: ComponentFixture<SearchFacturationDetailleeComponent>;
  let apiFacturationDetailleeService: jasmine.SpyObj<ApiFacturationDetailleeService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiFacturationDetailleeService', ['getDistinctEnvOrgAppSiteClientTarif']);
    apiSpy.getDistinctEnvOrgAppSiteClientTarif.and.returnValue(
      of({
        data: {} as FacturationDetailleeOptionsInterface,
        loading: false,
        networkStatus: 7,
        stale: false,
      } as ApolloQueryResult<FacturationDetailleeOptionsInterface>)
    );

    await TestBed.configureTestingModule({
      declarations: [SearchFacturationDetailleeComponent],
      providers: [{ provide: ApiFacturationDetailleeService, useValue: apiSpy }, FormBuilder, DatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFacturationDetailleeComponent);
    component = fixture.componentInstance;
    apiFacturationDetailleeService = TestBed.inject(ApiFacturationDetailleeService) as jasmine.SpyObj<ApiFacturationDetailleeService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form options correctly', () => {
    const mockResponse: ApolloQueryResult<DistinctEnvOrgAppSiteClientTarifInterface> = {
      data: {
        findCodeEnv: [{ code: 'ENV1' }, { code: 'ENV2' }],
        findCodeApp: [{ code: 'APP1' }, { code: 'APP2' }],
        allSitesCNP: [{ code: 'SITE1' }, { code: 'SITE2' }],
        allClients: [{ code: 'CLIENT1' }, { code: 'CLIENT2' }],
        findTyptarFromGentar: [{ typtar: 'TARIF1' }, { typtar: 'TARIF2' }],
        allOrganismes: [
          { code: 'ORG1', libelle: 'LIB1', codeRegion: 'REG1', codeSite: 'SITE1' },
          { code: 'ORG2', libelle: 'LIB2', codeRegion: 'REG2', codeSite: 'SITE2' },
        ],
        findCodeOrganismesByTypeR: [{ code: 'ORG_TYPE1' }, { code: 'ORG_TYPE2' }],
      },
      // Indicate that the data is fully loaded and the network request was successful
      loading: false,
      networkStatus: 7,
    };

    apiFacturationDetailleeService.getDistinctEnvOrgAppSiteClientTarif.and.returnValue(of(mockResponse as any));

    component.setFormOptions();

    expect(component.optionsEnv).toEqual(['ENV1', 'ENV2']);
    expect(component.optionsApp).toEqual(['APP1', 'APP2']);
    expect(component.optionsSite).toEqual(['SITE1', 'SITE2']);
    expect(component.allClients).toEqual(['CLIENT1', 'CLIENT2']);
    expect(component.allTarifs).toEqual(['TARIF1', 'TARIF2']);
    expect(component.allOrgReg).toEqual([
      { code: 'ORG1', libelle: 'LIB1', codeRegion: 'REG1', codeSite: 'SITE1' },
      { code: 'ORG2', libelle: 'LIB2', codeRegion: 'REG2', codeSite: 'SITE2' },
    ]);
    expect(component.allOrganismesByTypeR).toEqual([{ code: 'ORG_TYPE1' }, { code: 'ORG_TYPE2' }]);
  });

  it('should handle empty response correctly', () => {
    const mockResponse: ApolloQueryResult<DistinctEnvOrgAppSiteClientTarifInterface> = {
      data: {
        findCodeEnv: [],
        findCodeApp: [],
        allSitesCNP: [],
        allClients: [],
        findTyptarFromGentar: [],
        allOrganismes: [],
        findCodeOrganismesByTypeR: [],
      },
      // Indicate that the data is fully loaded and the network request was successful
      loading: false,
      networkStatus: 7,
    };

    apiFacturationDetailleeService.getDistinctEnvOrgAppSiteClientTarif.and.returnValue(of(mockResponse as any));

    component.setFormOptions();

    expect(component.optionsEnv).toEqual([]);
    expect(component.optionsApp).toEqual([]);
    expect(component.optionsSite).toEqual([]);
    expect(component.allClients).toEqual([]);
    expect(component.allTarifs).toEqual([]);
    expect(component.allOrgReg).toEqual([]);
    expect(component.allOrganismesByTypeR).toEqual([]);
  });

  it('should handle null response correctly', () => {
    apiFacturationDetailleeService.getDistinctEnvOrgAppSiteClientTarif.and.returnValue(of(null));

    component.setFormOptions();

    expect(component.optionsEnv).toEqual([]);
    expect(component.optionsApp).toEqual([]);
    expect(component.optionsSite).toEqual([]);
    expect(component.allClients).toEqual([]);
    expect(component.allTarifs).toEqual([]);
    expect(component.allOrgReg).toEqual([]);
    expect(component.allOrganismesByTypeR).toEqual([]);
  });
});
