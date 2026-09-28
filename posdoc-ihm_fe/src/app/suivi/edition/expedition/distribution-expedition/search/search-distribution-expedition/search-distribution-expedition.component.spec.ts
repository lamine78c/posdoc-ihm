import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { ApiAdelaideReeditionProduitService } from '@app/services/api-adelaide-reedition-produit.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

import { SearchDistributionExpeditionComponent } from './search-distribution-expedition.component';

describe('SearchDistributionExpeditionComponent', () => {
  let component: SearchDistributionExpeditionComponent;
  let fixture: ComponentFixture<SearchDistributionExpeditionComponent>;
  let apiAdelaideParametreServiceSpy: jasmine.SpyObj<ApiAdelaideParametreService>;
  let apiAdelaideReeditionProduitServiceSpy: jasmine.SpyObj<ApiAdelaideReeditionProduitService>;

  beforeEach(async () => {
    apiAdelaideParametreServiceSpy = jasmine.createSpyObj('ApiAdelaideParametreService', ['getParamsForMasappMasgamMasuti']);
    apiAdelaideReeditionProduitServiceSpy = jasmine.createSpyObj('ApiAdelaideReeditionProduitService', ['getDistinctEnvOrgAppFromGenfic']);

    await TestBed.configureTestingModule({
      declarations: [SearchDistributionExpeditionComponent],
      providers: [
        FormBuilder,
        DatePipe,
        Apollo,
        { provide: ApiAdelaideParametreService, useValue: apiAdelaideParametreServiceSpy },
        { provide: ApiAdelaideReeditionProduitService, useValue: apiAdelaideReeditionProduitServiceSpy },
      ],
    }).compileComponents();

    const mockResponseParam = {
      data: { getParamsForMasappMasgamMasuti: [{ code: 'MASAPP', value: 'masapp' }] },
    };
    apiAdelaideParametreServiceSpy.getParamsForMasappMasgamMasuti.and.returnValue(of(mockResponseParam as any));

    const mockResponseEnvOrgApp = {
      data: {
        getDistinctEnvOrgAppFromGenfic: [{ codenv: 'e', codorg: 'o', codapp: 'a' }],
        allOrganismes: [{ code: 'e', libelle: 'o', codeRegion: 'a' }],
      },
    };
    apiAdelaideReeditionProduitServiceSpy.getDistinctEnvOrgAppFromGenfic.and.returnValue(of(mockResponseEnvOrgApp as any));

    fixture = TestBed.createComponent(SearchDistributionExpeditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
