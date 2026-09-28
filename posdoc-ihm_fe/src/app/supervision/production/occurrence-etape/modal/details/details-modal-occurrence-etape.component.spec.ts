import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PermissionService } from '@app/services/permission/permission.service';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Apollo } from 'apollo-angular';

import { DetailsModalOccurrenceEtapeComponent } from './details-modal-occurrence-etape.component';
import { DetailsEtapeOccurrenceEtapeComponent } from './onglets/etape/details-etape-occurrence-etape/details-etape-occurrence-etape.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockViewContainerRef {
  clear() {
    //nop
  }

  createComponent() {
    return {
      instance: {},
    };
  }
}

describe('DetailsModalOccurrenceEtapeComponent', () => {
  let component: DetailsModalOccurrenceEtapeComponent;
  let fixture: ComponentFixture<DetailsModalOccurrenceEtapeComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);

    TestBed.configureTestingModule({
      declarations: [DetailsModalOccurrenceEtapeComponent, DetailsEtapeOccurrenceEtapeComponent],
      imports: [NgbNavModule],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        NgbActiveModal,
        { provide: ViewContainerRef, useClass: MockViewContainerRef }, // Utiliser Mock ViewContainerRef
        Apollo,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsModalOccurrenceEtapeComponent);
    component = fixture.componentInstance;
    component.tabs = [];
    component.menuData = {
      position: { x: 111, y: 222 },
      statut: 'S',
      etat: 'IDT',
      script: '/test/abc.sh',
      etpfus: '-',
      idtfus: 0,
      clefus: null,
      codapp: 'MAS',
      codcom: 'MAS0',
      coddes: null,
      codenv: 'T',
      codfic: 'M0001',
      codgam: 'MM',
      codinf: 1,
      codorg: '00L',
      codres: null,
      codser: null,
      codsig: 'S05',
      codsit: null,
      create: '2024-10-29T15:19:00',
      debute: null,
      fabsim: true,
      idetap: 3251,
      invali: null,
      nbrexe: 0,
      numcom: '00',
      numexe: null,
      numpid: 0,
      percod: '241023-00',
      reedit: false,
      signal: 't_00l_mas_241023-00_00_mas0_m0001_*',
      stepno: 0,
      suspen: null,
      termin: '2024-11-18T11:31:59',
      valide: '2024-10-29T15:19:00',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the correct component based on the label', () => {
    component.tabs = [{ label: 'Etape', component: DetailsEtapeOccurrenceEtapeComponent, perm: 5202 }];

    // Définir paramData qui est utilisé dans loadComponent
    component.menuData = {
      position: { x: 111, y: 222 },
      statut: 'S',
      etat: 'IDT',
      script: '/test/abc.sh',
      etpfus: '-',
      idtfus: 0,
      clefus: null,
      codapp: 'MAS',
      codcom: 'MAS0',
      coddes: null,
      codenv: 'T',
      codfic: 'M0001',
      codgam: 'MM',
      codinf: 1,
      codorg: '00L',
      codres: null,
      codser: null,
      codsig: 'S05',
      codsit: null,
      create: '2024-10-29T15:19:00',
      debute: null,
      fabsim: true,
      idetap: 3251,
      invali: null,
      nbrexe: 0,
      numcom: '00',
      numexe: null,
      numpid: 0,
      percod: '241023-00',
      reedit: false,
      signal: 't_00l_mas_241023-00_00_mas0_m0001_*',
      stepno: 0,
      suspen: null,
      termin: '2024-11-18T11:31:59',
      valide: '2024-10-29T15:19:00',
    };

    // Injecter le mock ViewContainerRef
    component.dynamicComponentContainer = TestBed.inject(ViewContainerRef);

    spyOn(component.dynamicComponentContainer, 'clear');
    spyOn(component.dynamicComponentContainer, 'createComponent').and.callThrough();

    component.loadComponent('Etape');

    // Vérifier que le conteneur est vidé et que le composant est chargé
    expect(component.dynamicComponentContainer.clear).toHaveBeenCalled();
    expect(component.dynamicComponentContainer.createComponent).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should set the menuData property of the loaded component', () => {
    component.tabs = [{ label: 'Etape', component: DetailsEtapeOccurrenceEtapeComponent, perm: 5202 }];

    // Définir menuData au lieu de data selon la structure du composant
    component.menuData = {
      position: { x: 111, y: 222 },
      statut: 'S',
      etat: 'IDT',
      script: '/test/abc.sh',
      etpfus: '-',
      idtfus: 0,
      clefus: null,
      codapp: 'MAS',
      codcom: 'MAS0',
      coddes: null,
      codenv: 'T',
      codfic: 'M0001',
      codgam: 'MM',
      codinf: 1,
      codorg: '00L',
      codres: null,
      codser: null,
      codsig: 'S05',
      codsit: null,
      create: '2024-10-29T15:19:00',
      debute: null,
      fabsim: true,
      idetap: 3251,
      invali: null,
      nbrexe: 0,
      numcom: '00',
      numexe: null,
      numpid: 0,
      percod: '241023-00',
      reedit: false,
      signal: 't_00l_mas_241023-00_00_mas0_m0001_*',
      stepno: 0,
      suspen: null,
      termin: '2024-11-18T11:31:59',
      valide: '2024-10-29T15:19:00',
    };
    // Mock componentRef retourné par createComponent
    const componentRefMock = {
      instance: {},
    };
    spyOn(component.dynamicComponentContainer, 'createComponent').and.returnValue(componentRefMock as any);

    // Appeler loadComponent après avoir défini menuData
    component.loadComponent('Etape');

    // Vérifier que paramData est passé au composant chargé
    expect((componentRefMock.instance as any).paramData).toEqual(component.menuData);
  });
});
