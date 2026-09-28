import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StepDefinitionComponent } from './step-definition.component';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('StepDefinitionComponent', () => {
  let component: StepDefinitionComponent;
  let fixture: ComponentFixture<StepDefinitionComponent>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideCommandeService>;
  let fb: FormBuilder;
  const mockResponseAppsData = ['SNV2', 'MAS'];
  const mockResponseApps = {
    data: {
      getDistinctApplications: mockResponseAppsData,
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseOrgsData = ['117', '116'];
  const mockResponseOrgs = {
    data: {
      getDistinctOrg: mockResponseOrgsData,
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseEnvsData = ['P', 'D'];
  const mockResponseEnvs = {
    data: {
      getDistinctEnvsByApp: mockResponseEnvsData,
    },
    loading: false,
    networkStatus: 7,
  };
  const mockResponseCommsData = ['comm1', 'comm2'];
  const mockResponseComms = {
    data: {
      getDistinctCommByAppEnv: mockResponseCommsData,
    },
    loading: false,
    networkStatus: 7,
  };
  const allOrgReg: [{ code: string; codeRegion: string }] = [{ code: '117', codeRegion: '117' }];

  beforeEach(waitForAsync(() => {
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideCommandeService', [
      'getDistinctApplications',
      'getDistinctOrg',
      'getDistinctEnvsByApp',
      'getDistinctCommByAppEnv',
    ]);

    TestBed.configureTestingModule({
      declarations: [StepDefinitionComponent],
      providers: [FormBuilder, { provide: ApiAdelaideCommandeService, useValue: mockApiAdelaideService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockApiAdelaideService.getDistinctApplications.and.returnValue(of(mockResponseApps));
    mockApiAdelaideService.getDistinctOrg.and.returnValue(of(mockResponseOrgs));
    mockApiAdelaideService.getDistinctEnvsByApp.and.returnValue(of(mockResponseEnvs));
    mockApiAdelaideService.getDistinctCommByAppEnv.and.returnValue(of(mockResponseComms));

    fixture = TestBed.createComponent(StepDefinitionComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.allOrgReg = allOrgReg;
    component.form = fb.group({
      environnement: fb.group({
        P: [true],
        D: [true],
      }),
      organisme: fb.group({
        '117': fb.group({ '117': [true] }),
        '116': fb.group({ '116': [true] }),
      }),
      application: [''],
      commande: [''],
      fichier: [''],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init applicationOptions on ngOnInit', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.applicationOptions).toEqual(mockResponseAppsData);
  });

  it('should init form organisme when change form fichier value', done => {
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    spyOn(component.form.controls.organisme, 'reset');
    component.ngOnInit();
    fixture.detectChanges();

    component.form.controls.fichier.setValue('test');
    setTimeout(() => {
      expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
      done();
    }, 800);

    component.form.controls.fichier.setValue('');
    expect(component.form.controls.organisme.reset).toHaveBeenCalledWith(false, { emitEvent: false });
  });

  it('should init form organisme when change form commande value', done => {
    spyOn(SharedUtil, 'getOrgFormByOrgData');
    spyOn(component.form.controls.organisme, 'reset');
    component.form.controls.fichier.patchValue('test', { emitEvent: false });
    component.ngOnInit();
    fixture.detectChanges();

    component.form.controls.commande.setValue('');
    setTimeout(() => {
      expect(SharedUtil.getOrgFormByOrgData).toHaveBeenCalled();
      done();
    }, 800);

    component.form.controls.fichier.patchValue('', { emitEvent: false });
    component.form.controls.commande.setValue('test');
    expect(component.form.controls.organisme.reset).toHaveBeenCalledWith(false, { emitEvent: false });
  });

  it('changeApplication validity', () => {
    component.changeApplication([]);
    fixture.detectChanges();

    expect(Object.keys((component.form.controls.environnement as FormGroup).controls).length).toEqual(2);
    expect(component.commandeOptions).toEqual([]);
    expect(Object.keys((component.form.controls.organisme as FormGroup).controls).length).toEqual(0);
  });

  it('changeEnvironnement validity', () => {
    spyOn(component.commandeOptionsChange, 'emit');
    component.changeEnvironnement([{ title: 'P' }]);
    fixture.detectChanges();

    expect(component.commandeOptions).toEqual(mockResponseCommsData);
    expect(component.commandeOptionsChange.emit).toHaveBeenCalledWith(component.commandeOptions);
    expect(Object.keys((component.form.controls.organisme as FormGroup).controls).length).toEqual(0);
  });
});
