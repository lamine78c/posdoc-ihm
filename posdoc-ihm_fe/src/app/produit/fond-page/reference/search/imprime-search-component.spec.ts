import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { of } from 'rxjs';
import { ImprimeSearchComponent } from './imprime-search-component';

describe('ImprimeSearchComponent', () => {
  let component: ImprimeSearchComponent;
  let fixture: ComponentFixture<ImprimeSearchComponent>;
  let mockApiAdelaideFichierService: jasmine.SpyObj<ApiAdelaideFichierService>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;

  beforeEach(waitForAsync(() => {
    const apiAdelaideFichierServiceSpy = jasmine.createSpyObj('ApiAdelaideFichierService', ['getEnvAppRefImpEnGroup']);
    const filterSharedDataServiceSpy = jasmine.createSpyObj('FilterSharedDataService', ['getData']);

    TestBed.configureTestingModule({
      declarations: [ImprimeSearchComponent],
      providers: [
        UntypedFormBuilder,
        { provide: ApiAdelaideFichierService, useValue: apiAdelaideFichierServiceSpy },
        { provide: FilterSharedDataService, useValue: filterSharedDataServiceSpy },
      ],
    }).compileComponents();

    mockApiAdelaideFichierService = TestBed.inject(ApiAdelaideFichierService) as jasmine.SpyObj<ApiAdelaideFichierService>;
    mockFilterSharedDataService = TestBed.inject(FilterSharedDataService) as jasmine.SpyObj<FilterSharedDataService>;
  }));

  beforeEach(() => {
    const mockResponse = {
      data: {
        getFichiersSearchElements: [
          {
            codeEnv: 'P',
            codeApp: 'SNV2',
            codeCom: 'AD04',
            codeFich: 'L00',
            codeProd: 'AZ00',
            refImprime: '212GX',
            libFichier: 'TEST',
            codeOrg: '780',
            codeAdr: null,
            refFormat: 'az',
            typeFormat: 'A',
            page: 5,
            codeClient: 'DEV',
            typeMultif: '-',
            typeSupport: '-',
            typeSig: '',
            refSupport: '',
            eclatement: 0,
            codeDocument: '',
          },
        ],
      },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideFichierService.getEnvAppRefImpEnGroup.and.returnValue(of(mockResponse));
    mockFilterSharedDataService.getData.and.returnValue(of(false));
    fixture = TestBed.createComponent(ImprimeSearchComponent);
    component = fixture.componentInstance;
    component.synchroniseReferenceList = {
      isListOfReferenceEmpty: true,
      environnementsUpdated: ['P', 'T'],
      newReference: 'testB',
    };
    fixture.detectChanges();
  });

  it('should create and init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.controls.environnement).toBeTruthy();
    expect(component.formGroup.controls.application).toBeTruthy();
    expect(component.formGroup.controls.reference).toBeTruthy();
    expect(mockApiAdelaideFichierService.getEnvAppRefImpEnGroup).toHaveBeenCalled();
    expect(component.searchList.length).toBeGreaterThan(0);
    expect(component.isSearchDisabled).toBeFalsy();
  });

  it('should init form application and form reference correctly when change selected environnement', () => {
    component.searchList = [
      { codeEnv: 'P', codeApp: 'MAS', refImp: 'test' },
      { codeEnv: 'P', codeApp: 'SNV2', refImp: 'test' },
      { codeEnv: 'P', codeApp: 'SNV2', refImp: 'test2' },
    ];
    component.selectedApplicationCodeLast = 'SNV2';
    component.selectedReferenceCodeLast = 'test';
    component.onChangeEnvironnement([{ title: 'P' }, { title: 'T' }]);
    fixture.detectChanges();
    expect(component.selectedEnvironnementCodeList).toEqual(['P', 'T']);
    expect(component.applications).toEqual([
      { value: 'MAS', text: 'MAS' },
      { value: 'SNV2', text: 'SNV2' },
    ]);
    expect(component.selectedApplicationCode).toEqual('SNV2');
    expect(component.references).toEqual([
      { value: 'test', text: 'test' },
      { value: 'test2', text: 'test2' },
    ]);
    expect(component.selectedReferenceCode).toEqual('test');
  });

  it('should init form reference correctly when change selected application', () => {
    component.searchList = [{ codeEnv: 'P', codeApp: 'SNV2', refImp: 'test' }];
    component.selectedReferenceCodeLast = 'test';
    component.selectedEnvironnementCodeList = ['P', 'T'];
    component.onChangeApplication('SNV2');
    fixture.detectChanges();
    expect(component.selectedApplicationCode).toEqual('SNV2');
    expect(component.selectedApplicationCodeLast).toEqual('SNV2');
    expect(component.references).toEqual([{ value: 'test', text: 'test' }]);
    expect(component.selectedReferenceCode).toEqual('test');
  });

  it('should change selected value correctly when change reference', () => {
    component.onChangeReference('test');
    fixture.detectChanges();
    expect(component.selectedReferenceCode).toEqual('test');
    expect(component.selectedReferenceCodeLast).toEqual('test');
  });

  it('should valid search correctly', () => {
    component.selectedEnvironnementCodeList = ['P', 'T'];
    component.selectedReferenceCode = 'ref';
    component.selectedApplicationCode = 'SNV2';
    const isValid = component.isSearchValid();
    fixture.detectChanges();
    expect(isValid).toBeTruthy();
  });

  it('should execute ngOnChanges correctly', () => {
    component.searchList = [];
    component.selectedApplicationCode = 'SNV2';
    const changes = {
      synchroniseReferenceList: new SimpleChange(
        undefined,
        {
          isListOfReferenceEmpty: true,
          environnementsUpdated: ['P'],
          newReference: '212GX',
        },
        false
      ),
    };
    component.ngOnChanges(changes);
    fixture.detectChanges();
    expect(component.searchList.length).toEqual(2);
    expect(component.selectedReferenceCode).toEqual(undefined);
  });

  it('should execute getApplicationsControls correctly', () => {
    component.selectedApplicationCode = 'SNV2';
    const formControl = component.getApplicationsControls();
    fixture.detectChanges();
    expect(formControl.value).toEqual('SNV2');
  });

  it('should execute getReferencesControls correctly', () => {
    component.selectedReferenceCode = 'ref';
    const formControl = component.getReferencesControls();
    fixture.detectChanges();
    expect(formControl.value).toEqual('ref');
  });

  it('should execute lister correctly', () => {
    spyOn(component.applyImprimesEvent, 'emit');
    component.selectedEnvironnementCodeList = ['P'];
    component.selectedApplicationCode = 'SNV2';
    component.selectedReferenceCode = 'ref';
    component.lister({});
    fixture.detectChanges();
    expect(component.applyImprimesEvent.emit).toHaveBeenCalledWith({
      codesEnv: ['P'],
      codesApp: ['SNV2'],
      refsImp: ['ref'],
    });
  });
});
