import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  ApiMassificationsService,
} from '@app/services/api-adelaide/supervision/production/details/api-massifications.service';
import { MenuData } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

import { DetailsMassificationOccurrenceEtapeComponent } from './details-massification-occurrence-etape.component';
import {
  TableauDetailsMassificationOccurrenceEtapeService,
} from '../service/tableau-details-massification-occurrence-etape.service';
import {
  TableauConfigurationBuilderService,
} from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DetailsMassificationOccurrenceEtapeComponent', () => {
  let component: DetailsMassificationOccurrenceEtapeComponent;
  let fixture: ComponentFixture<DetailsMassificationOccurrenceEtapeComponent>;
  let apiMassificationsService: jasmine.SpyObj<ApiMassificationsService>;
  let tableauService: jasmine.SpyObj<TableauDetailsMassificationOccurrenceEtapeService>;
  let tableauConfig: jasmine.SpyObj<TableauConfigurationBuilderService>;

  const mockResponse = {
    data: {
      findDetailsMassificationForOccurrenceEtape: [
        {
          codenv: 'T',
          codorg: '117',
          codapp: 'SNV2',
          percod: '241115-00',
          codcom: 'COM1',
          codfic: 'L00',
          refimp: 'F',
          libfic: 'FFF',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    apiMassificationsService = jasmine.createSpyObj('ApiMassificationsService', ['getDetailsMassificationOccurrenceEtape']);
    tableauService = jasmine.createSpyObj('TableauDetailsMassificationOccurrenceEtapeService', ['getColumnDefs']);
    tableauConfig = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);

    TestBed.configureTestingModule({
      declarations: [DetailsMassificationOccurrenceEtapeComponent],
      providers: [
        { provide: ApiMassificationsService, useValue: apiMassificationsService },
        { provide: TableauDetailsMassificationOccurrenceEtapeService, useValue: tableauService },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfig },
        Apollo,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    apiMassificationsService.getDetailsMassificationOccurrenceEtape.and.returnValue(of(mockResponse));
    tableauConfig.createGridConfiguration.and.returnValue({});
    tableauService.getColumnDefs.and.returnValue([]);
    fixture = TestBed.createComponent(DetailsMassificationOccurrenceEtapeComponent);
    component = fixture.componentInstance;
    component.paramData = {
      codenv: 'a',
      codorg: 'a',
      codapp: 'a',
      percod: 'a',
      codcom: 'a',
      numcom: 'a',
      codfic: 'a',
    } as MenuData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(tableauConfig.createGridConfiguration).toHaveBeenCalled();
    expect(tableauService.getColumnDefs).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(apiMassificationsService.getDetailsMassificationOccurrenceEtape).toHaveBeenCalledWith(component.paramData);
  });
});
