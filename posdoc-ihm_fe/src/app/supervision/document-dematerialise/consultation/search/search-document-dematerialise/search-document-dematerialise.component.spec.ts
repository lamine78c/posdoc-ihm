import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { ApiAdelaideDocumentDematerialiseService } from '@app/services/api-adelaide-docments-dematerialise.service';
import { of } from 'rxjs';
import { SearchDocumentDematerialiseComponent } from './search-document-dematerialise.component';

describe('SearchDocumentDematerialiseComponent', () => {
  let component: SearchDocumentDematerialiseComponent;
  let fixture: ComponentFixture<SearchDocumentDematerialiseComponent>;
  let mockApiDocService: jasmine.SpyObj<ApiAdelaideDocumentDematerialiseService>;
  const mockResponse = {
    data: {
      getDistinctOrgAppComFromGendoc: [
        {
          codorg: '117',
          codapp: 'pnr',
          codcom: 'com1',
        },
        {
          codorg: '110',
          codapp: 'pnr',
          codcom: 'com2',
        },
        {
          codorg: '110',
          codapp: 'snv2',
          codcom: 'com3',
        },
      ],
      findComDocLibFicInFichier: [
        {
          codcom: 'com1',
          coddoc: 'doc1',
          libfic: 'lib1',
        },
        {
          codcom: 'com2',
          coddoc: 'doc2',
          libfic: 'lib2',
        },
      ],
      allOrganismes: [
        { code: '117', libelle: 'Organisme 117', codeRegion: '117' },
        { code: '110', libelle: 'Organisme 110', codeRegion: '' },
      ],
    },
  };
  beforeEach(async () => {
    mockApiDocService = jasmine.createSpyObj('ApiAdelaideDocumentDematerialiseService', ['getDocumentDematerialiseSearchConfig']);

    await TestBed.configureTestingModule({
      declarations: [SearchDocumentDematerialiseComponent],
      providers: [DatePipe, { provide: ApiAdelaideDocumentDematerialiseService, useValue: mockApiDocService }],
    }).compileComponents();

    mockApiDocService.getDocumentDematerialiseSearchConfig.and.returnValue(of(mockResponse) as any);
    fixture = TestBed.createComponent(SearchDocumentDematerialiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lister validity', () => {
    spyOn(component.applyEvent, 'emit');
    component.formDat.value = { year: '2025', month: '11', day: '11' };
    component.formDoc.value = 'd';
    component.formTyp.value = 't';
    component.formSta.value = 's';
    component.formApp.value = 'a';
    component.formCom.value = 'z';
    component.lister();
    expect(component.applyEvent.emit).toHaveBeenCalledWith({
      date: '2025-11-11',
      codorgs: null,
      coddoc: 'd',
      typact: 't',
      docsta: 's',
      codapp: 'a',
      codcom: 'z',
    });
  });

  it('ngOnInit validity', () => {
    component.ngOnInit();
    expect(component.optionsSta.length).toBe(3);
    expect(component.optionsTyp.length).toBe(4);
    expect(component.optionsDoc.length).toEqual(3);
    expect(component.optionsApp.length).toEqual(2);
    expect(component.optionsCom.length).toEqual(3);
    expect(component.allApp.length).toEqual(2);
    expect(component.allCom.length).toEqual(3);
    expect(component.allDoc.length).toEqual(2);
  });

  it('onChangeFormValue validity', () => {
    component.ngOnInit();
    component.formOrg.setValue({ '117': { '117': true }, '110-null': { '110': false } });
    component.onChangeOrganisme([{ title: '117' }]);
    expect(component.optionsApp).toEqual(['pnr']);
    component.formApp.setValue('pnr');
    expect(component.optionsCom).toEqual(['com1']);
    component.formCom.setValue('com1');
    expect(component.optionsDoc).toEqual([
      {
        value: '',
        columns: [
          { label: 'Document', value: '' },
          { label: 'Désignation', value: '' },
        ],
      },
      {
        value: 'doc1',
        columns: [
          { label: 'Document', value: 'doc1' },
          { label: 'Désignation', value: 'lib1' },
        ],
      },
    ]);
  });
});
