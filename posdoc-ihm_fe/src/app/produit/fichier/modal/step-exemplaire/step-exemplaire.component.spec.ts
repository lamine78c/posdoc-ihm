import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { StepExemplaireComponent } from './step-exemplaire.component';

describe('StepExemplaireComponent', () => {
  let component: StepExemplaireComponent;
  let fixture: ComponentFixture<StepExemplaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepExemplaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepExemplaireComponent);
    component = fixture.componentInstance;
    component.ressource = [
      {
        codeEnvironnement: 'P',
        codeOrganisme: '116',
        codeApplication: 'SNV2',
        codeGamme: 'FT',
        codeSite: 'CIRSO',
        codeRessource: 'GED-TXT',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '116',
        codeApplication: 'SNV2',
        codeGamme: 'PF',
        codeSite: 'CIRSO',
        codeRessource: 'GED-PDF',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'DM',
        codeSite: 'CIRSO',
        codeRessource: 'TEST',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'FT',
        codeSite: 'CIRSO',
        codeRessource: 'GED-TXT',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '117',
        codeApplication: 'SNV2',
        codeGamme: 'PF',
        codeSite: 'CIRSO',
        codeRessource: 'GED-PDF',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '999',
        codeApplication: 'SNV2',
        codeGamme: 'DM',
        codeSite: 'CIRTIL',
        codeRessource: 'GED-HUI',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '999',
        codeApplication: 'SNV2',
        codeGamme: 'DM',
        codeSite: 'CIRTIL',
        codeRessource: 'GED-SAE',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'P',
        codeOrganisme: '999',
        codeApplication: 'SNV2',
        codeGamme: 'DM',
        codeSite: 'CIRSO',
        codeRessource: 'GED-HUI',
        codeServeur: null,
      },
      {
        codeEnvironnement: 'R',
        codeOrganisme: '999',
        codeApplication: 'SNV2',
        codeGamme: 'DM',
        codeSite: 'CIRTIL',
        codeRessource: 'GED-SAE',
        codeServeur: null,
      },
    ];
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit validity', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.ressourcesByEnv[0].env).toEqual('P');
    expect(component.ressourcesByEnv[0].exem.length).toBe(6);
    expect(component.ressourcesByEnv[1].env).toEqual('R');
    expect(component.ressourcesByEnv[1].exem.length).toBe(1);
  });

  it('boxClick validity', () => {
    const data = {
      codeEnvironnement: 'P',
      codeGamme: 'DM',
      codeSite: 'CIRSO',
      codeRessource: 'TEST',
    };
    component.boxClick(true, data);
    fixture.detectChanges();
    expect(component.ressource.filter(e => e.value).length).toBe(1);
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
});
