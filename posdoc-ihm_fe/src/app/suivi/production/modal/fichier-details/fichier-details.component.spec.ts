import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewContainerRef } from '@angular/core';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FichierDetailsComponent } from './fichier-details.component';
import { GeneralitesFichierComponent } from './onglets/generalites-fichier/generalites-fichier.component';
import { ProduitsFichierComponent } from './onglets/produits-fichier/produits-fichier.component';
import { NoticesFichierComponent } from './onglets/notices-fichier/notices-fichier.component';
import { FacturationFichierComponent } from './onglets/facturation-fichier/facturation-fichier.component';
import { DocumentsDematerialisesFichierComponent } from './onglets/documents-dematerialises-fichier/documents-dematerialises-fichier.component';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { of } from 'rxjs';

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

describe('FichierDetailsComponent', () => {
  let component: FichierDetailsComponent;
  let fixture: ComponentFixture<FichierDetailsComponent>;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let apiParametreService: jasmine.SpyObj<ApiAdelaideParametreService>;
  const tabs = [
    {
      label: 'Généralités',
      component: GeneralitesFichierComponent,
      perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
    },
    {
      label: 'Produits',
      component: ProduitsFichierComponent,
      perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
    },
    {
      label: 'Notices',
      component: NoticesFichierComponent,
      perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
    },
    {
      label: 'Facturation',
      component: FacturationFichierComponent,
      perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
    },
    {
      label: 'Documents dématérialisés',
      component: DocumentsDematerialisesFichierComponent,
      perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
    },
  ];

  const mockValueDocDemat = {
    data: {
      getValueDocDematerialises: 'PNR',
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    permissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    apiParametreService = jasmine.createSpyObj('ApiAdelaideParametreService', ['getValueDocDematerialises']);
    TestBed.configureTestingModule({
      declarations: [FichierDetailsComponent],
      imports: [NgbNavModule],
      providers: [
        NgbActiveModal,
        { provide: PermissionService, useValue: permissionService },
        { provide: ViewContainerRef, useClass: MockViewContainerRef },
        { provide: ApiAdelaideParametreService, useValue: apiParametreService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FichierDetailsComponent);
    component = fixture.componentInstance;
    component.tabs = [];
    component.params = {
      codenv: 'P',
      codorg: '750',
      codapp: 'MAS',
      percod: '251011-00',
      codcom: 'RRDE',
      codfic: 'L00',
      numcom: '00',
    };
    apiParametreService.getValueDocDematerialises.and.returnValue(of(mockValueDocDemat));
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
    component.loadComponent('Généralités');

    expect(component.dynamicComponentContainer.clear).toHaveBeenCalled();
    expect(component.dynamicComponentContainer.createComponent).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should set the params property of the loaded component', () => {
    component.tabs = tabs;
    const componentRefMock = {
      instance: {},
    };
    spyOn(component.dynamicComponentContainer, 'createComponent').and.returnValue(componentRefMock as any);
    component.loadComponent('Produits');

    expect((componentRefMock.instance as any).params).toEqual(component.params);
  });
});
