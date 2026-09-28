import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepGeneraliteComponent } from './step-generalite.component';
import { FormBuilder } from '@angular/forms';

describe('StepGeneraliteComponent', () => {
  let component: StepGeneraliteComponent;
  let fixture: ComponentFixture<StepGeneraliteComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepGeneraliteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepGeneraliteComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.dataDefinition = {
      application: 'SNV2',
      environnement: {
        I: false,
        P: true,
        R: true,
        T: false,
      },
      organisme: {
        '116': {
          '116': true,
        },
        '117': {
          '117': true,
        },
      },
      commande: 'ADEH',
      fichier: 'LD',
    };
    component.form = fb.group({
      designation: [''],
      codeProduit: [''],
      refFormat: [''],
      typeFormat: [''],
      fondPage: [''],
      codeClient: [''],
      signature: [''],
      codeDocument: [''],
      typeSupport: [''],
      page: [''],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getEnvironnement validity', () => {
    const result = component.getEnvironnement();
    fixture.detectChanges();
    expect(result).toEqual('P, R');
  });

  it('getOrganisme validity', () => {
    let result = component.getOrganisme();
    fixture.detectChanges();
    expect(result).toEqual('116, 117');

    component.dataDefinition.organisme = {
      '116': {
        '116': true,
      },
      '117': {
        '117': true,
        '771': true,
        '772': true,
        '773': true,
      },
    };
    result = component.getOrganisme();
    expect(result).toEqual('5 organismes sélectionnés');
  });

  it('should send event', () => {
    spyOn(component.editOrganismeClientClick, 'emit');
    component.onEditOrganismeClient();
    expect(component.editOrganismeClientClick.emit).toHaveBeenCalled();
  });
});
