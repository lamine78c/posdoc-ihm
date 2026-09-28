import { NO_ERRORS_SCHEMA, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ApiAdelaideHabilitationService } from '@app/services/api-adelaide-habilitation.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { HelpComponent } from './onglets/help/help.component';
import { PopupHelpComponent } from './popup-help.component';
import { Apollo } from 'apollo-angular';

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
describe('PopupHelpComponent', () => {
  let component: PopupHelpComponent;
  let fixture: ComponentFixture<PopupHelpComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideHabilitationService>;

  const tabs = [{ label: 'Aide', component: HelpComponent, perm: AUTH.ADMINISTRATION.CONTENU.AIDE.ID }];
  const pathComplet = 'path > menu > onglet';
  const mockResponse = {
    data: {
      getPathCompletByPath: pathComplet,
    },
    loading: false,
    networkStatus: 7,
  };

  const apolloMock = {
    watchQuery: jasmine.createSpy('watchQuery').and.returnValue({
      valueChanges: of({ data: {}, loading: false })
    }),
    query: jasmine.createSpy('query').and.returnValue(of({ data: {} })),
    mutate: jasmine.createSpy('mutate').and.returnValue(of({ data: {} })),
  };

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideHabilitationService', ['getPathCompletByPath']);

    TestBed.configureTestingModule({
      declarations: [PopupHelpComponent],
      imports: [NgbNavModule],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ApiAdelaideHabilitationService, useValue: mockApiAdelaideService },
        NgbActiveModal,
        { provide: ViewContainerRef, useClass: MockViewContainerRef },
        { provide: Apollo, useValue: apolloMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupHelpComponent);
    component = fixture.componentInstance;
    component.tabs = [];
    component.path = '/path/menu#onglet';
    mockApiAdelaideService.getPathCompletByPath.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the correct component based on the label', () => {
    component.tabs = tabs;
    component.dynamicComponentContainer = TestBed.inject(ViewContainerRef);
    spyOn(component.dynamicComponentContainer, 'clear');
    spyOn(component.dynamicComponentContainer, 'createComponent').and.callThrough();
    component.loadComponent('Aide');

    expect(component.dynamicComponentContainer.clear).toHaveBeenCalled();
    expect(component.dynamicComponentContainer.createComponent).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should load modal title from api service', () => {
    component.getModalTitle();
    fixture.detectChanges();
    expect(component.modalTitle).toEqual(pathComplet);
  });
});
