import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailsModalComponent } from './details-modal.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { GeneralitesComponent } from './onglets';
import { ViewContainerRef } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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

describe('DetailsModalComponent', () => {
  let component: DetailsModalComponent;
  let fixture: ComponentFixture<DetailsModalComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);

    TestBed.configureTestingModule({
      declarations: [DetailsModalComponent, GeneralitesComponent],
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
    fixture = TestBed.createComponent(DetailsModalComponent);
    component = fixture.componentInstance;
    component.tabs = [];
    component.paramData = {
      codEnv: 'D',
      codOrg: '315',
      codApp: 'SNV2',
      perCod: '230816-0G',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the correct component based on the label', () => {
    component.tabs = [{ label: 'Généralités', component: GeneralitesComponent, perm: 5201 }];

    // Définir paramData qui est utilisé dans loadComponent
    component.paramData = {
      codEnv: 'D',
      codOrg: '315',
      codApp: 'SNV2',
      perCod: '230816-0G',
    };

    // Injecter le mock ViewContainerRef
    component.dynamicComponentContainer = TestBed.inject(ViewContainerRef);

    spyOn(component.dynamicComponentContainer, 'clear');
    spyOn(component.dynamicComponentContainer, 'createComponent').and.callThrough();

    component.loadComponent('Généralités');

    // Vérifier que le conteneur est vidé et que le composant est chargé
    expect(component.dynamicComponentContainer.clear).toHaveBeenCalled();
    expect(component.dynamicComponentContainer.createComponent).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should set the paramData property of the loaded component', () => {
    component.tabs = [{ label: 'Généralités', component: GeneralitesComponent, perm: 5201 }];

    // Définir paramData au lieu de data selon la structure du composant
    component.paramData = {
      codEnv: 'D',
      codOrg: '315',
      codApp: 'SNV2',
      perCod: '230816-0G',
    };
    // Mock componentRef retourné par createComponent
    const componentRefMock = {
      instance: {},
    };
    spyOn(component.dynamicComponentContainer, 'createComponent').and.returnValue(componentRefMock as any);

    // Appeler loadComponent après avoir défini paramData
    component.loadComponent('Généralités');

    // Vérifier que paramData est passé au composant chargé
    expect((componentRefMock.instance as any).paramData).toEqual(component.paramData);
  });
});
