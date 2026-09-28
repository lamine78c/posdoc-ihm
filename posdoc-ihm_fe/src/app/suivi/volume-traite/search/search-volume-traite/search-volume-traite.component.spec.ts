import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ApiAdelaideDateService } from '@app/services/api-adelaide-date.service';
import { ApiAdelaideVolumeTraiteService } from '@app/services/api-adelaide-volume-traite.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

import { SearchVolumeTraiteComponent } from './search-volume-traite.component';

describe('SearchVolumeTraiteComponent', () => {
  let component: SearchVolumeTraiteComponent;
  let fixture: ComponentFixture<SearchVolumeTraiteComponent>;
  let apiAdelaideVolumeTraiteServiceSpy: jasmine.SpyObj<ApiAdelaideVolumeTraiteService>;
  let apiAdelaideDateServiceSpy: jasmine.SpyObj<ApiAdelaideDateService>;

  beforeEach(() => {
    apiAdelaideVolumeTraiteServiceSpy = jasmine.createSpyObj('ApiAdelaideVolumeTraiteService', ['getEnvsOrgsSelectionFromGenETP']);
    apiAdelaideDateServiceSpy = jasmine.createSpyObj('ApiAdelaideDateService', ['transformDateToString']);
    TestBed.configureTestingModule({
      declarations: [SearchVolumeTraiteComponent],
      providers: [
        FormBuilder,
        Apollo,
        DatePipe,
        { provide: ApiAdelaideVolumeTraiteService, useValue: apiAdelaideVolumeTraiteServiceSpy },
        { provide: ApiAdelaideDateService, useValue: apiAdelaideDateServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchVolumeTraiteComponent);
    component = fixture.componentInstance;

    const mockResponse = {
      data: {
        getDistinctEnvsFromGenEtp: ['P'],
        getDistinctOrgsFromGenEtp: ['00L', '00T', '117', '780'],
        allOrganismes: [{ code: 'str', libelle: 'str', codeRegion: 'str' }],
      },
    };

    apiAdelaideVolumeTraiteServiceSpy.getEnvsOrgsSelectionFromGenETP.and.returnValue(of(mockResponse as any));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
