import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { DetailsComponent } from './details.component';
import { PermissionService } from '@app/services/permission/permission.service';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  // Fonction pour créer des paramètres mock à chaque test
  const createMockParams = () => ({
    data: {
      libelle: 'Test Label',
      type: 'C',
      typeFusion: 'T',
      referenceDistributionProduit: 'CMD001',
      codeServeur: 'SRV001',
      userId: 'user123',
      fileImpression: 'file001',
      logicielDistribution: 'Q',
      referenceDistributionProduitRecap: 'RECAP001',
      password: 'pass123',
      informationUtilisateur: 'info test',
      miseSousPli: true,
      fileBloquee: false,
      destinataire: true
    },
    node: {
      parent: {
        __objectId: 'edit123',
        formErrors: new Map(),
        updated: false
      }
    },
    rowIdEdit: 'edit123',
    newRowAdded: false,
    serveurs: new BehaviorSubject([
      { value: 'SRV001', text: 'Serveur 1' },
      { value: 'SRV002', text: 'Serveur 2' }
    ]),
    commandes: new BehaviorSubject([
      { value: 'CMD001', text: 'Commande 1', logiciel: 'Q' },
      { value: 'CMD002', text: 'Commande 2', logiciel: 'F' }
    ]),
    api: {
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener')
    }
  });

  beforeEach(async () => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);

    await TestBed.configureTestingModule({
      declarations: [DetailsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: PermissionService, useValue: permissionServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;

    mockPermissionService.hasPermission.and.returnValue(true);
  });

  afterEach(() => {
    if (component && component.params && component.params.api && component.displayErrorsFn) {
      component.params.api.removeEventListener('rowDataUpdated', component.displayErrorsFn);
    }
    if (component && component.subscriptions) {
      component.subscriptions.forEach(sub => sub.unsubscribe());
      component.subscriptions = [];
    }
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const mockParams = createMockParams();
    component.agInit(mockParams);
  });

  it('should initialize component with default options', () => {
    // Initialiser le composant avant de tester les options par défaut
    const mockParams = createMockParams();
    component.agInit(mockParams);

    expect(component.optionsType).toEqual([
      { value: 'C', text: 'Centralisé' },
      { value: 'D', text: 'Décentralisé' }
    ]);
    expect(component.optionsTypeFision).toEqual([
      { value: '-', text: '- - Pas de fusion' },
      { value: 'T', text: 'T - Fusion totale' },
      { value: 'I', text: 'I - Fusion par imprimé' },
      { value: 'S', text: 'S - Fusion par support' }
    ]);
    expect(component.optionsLogiciel).toEqual([
      { value: 'Q', text: 'Qmaster' },
      { value: 'F', text: 'Ftp' },
      { value: 'C', text: 'Copie (cp)' },
      { value: 'B', text: 'Batch' },
      { value: 'X', text: 'Hors Adelaïde' }
    ]);
  });

  it('should initialize form correctly when agInit is called in editing mode', () => {
    const mockParams = createMockParams();
    component.agInit(mockParams);

    expect(component.form).toBeDefined();
    expect(component.isEditing).toBe(true);
    expect(component.form.get('designation')?.value).toBe('Test Label');
    expect(component.form.get('type')?.value).toBe('C');
    expect(component.form.get('logiciel')?.value).toBe('Q');
    expect(component.params.api.addEventListener).toHaveBeenCalledWith('rowDataUpdated', jasmine.any(Function));
  });

  it('should initialize form correctly when not in editing mode', () => {
    const mockParams = createMockParams();
    mockParams.rowIdEdit = 'different123';

    component.agInit(mockParams);

    expect(component.isEditing).toBe(false);
    expect(component.form.get('designation')?.disabled).toBe(true);
    expect(component.form.get('type')?.disabled).toBe(true);
  });

  it('should filter commands based on selected software in onChangeLogiciel', () => {
    const mockParams = createMockParams();
    component.agInit(mockParams);

    component.onChangeLogiciel('Q');
    expect(component.optionsCommande).toEqual(['CMD001']);

    component.onChangeLogiciel('F');
    expect(component.optionsCommande).toEqual(['CMD002']);
  });

  it('should validate required fields correctly', () => {
    const mockParams = createMockParams();
    component.agInit(mockParams);

    component.form.get('designation')?.setValue('');
    component.form.get('type')?.setValue('');
    component.form.get('commandeProduit')?.setValue('');

    expect(component.form.get('designation')?.invalid).toBe(true);
    expect(component.form.get('type')?.invalid).toBe(true);
    expect(component.form.get('commandeProduit')?.invalid).toBe(true);

    component.form.get('designation')?.setValue('Valid Label');
    component.form.get('type')?.setValue('C');
    component.form.get('commandeProduit')?.setValue('CMD001');

    expect(component.form.get('designation')?.valid).toBe(true);
    expect(component.form.get('type')?.valid).toBe(true);
    expect(component.form.get('commandeProduit')?.valid).toBe(true);
  });

  it('should validate field length correctly', () => {
    const mockParams = createMockParams();
    component.agInit(mockParams);

    const longString = 'a'.repeat(51);
    component.form.get('designation')?.setValue(longString);
    expect(component.form.get('designation')?.invalid).toBe(true);

    component.form.get('designation')?.setValue('Valid Label');
    expect(component.form.get('designation')?.valid).toBe(true);

    component.form.get('utilisateur')?.setValue('verylongusername');
    expect(component.form.get('utilisateur')?.invalid).toBe(true);

    component.form.get('utilisateur')?.setValue('user123');
    expect(component.form.get('utilisateur')?.valid).toBe(true);
  });

  it('should handle form value changes and update data when editing', (done) => {
    const mockParams = createMockParams();
    component.agInit(mockParams);

    component.form.get('designation')?.setValue('New Label');
    component.form.get('type')?.setValue('D');

    setTimeout(() => {
      expect(mockParams.data.libelle).toBe('New Label');
      expect(mockParams.data.type).toBe('D');
      expect(mockParams.node.parent.updated).toBe(true);
      done();
    }, 400);
  });

  it('should handle permission checks correctly for field disabling', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    const mockParams = createMockParams();
    component.agInit(mockParams);

    expect(component.form.get('designation')?.disabled).toBe(true);
    expect(component.form.get('type')?.disabled).toBe(true);

    mockPermissionService.hasPermission.and.returnValue(true);
    const newParams = createMockParams();
    newParams.newRowAdded = true;

    const newFixture = TestBed.createComponent(DetailsComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.agInit(newParams);

    expect(newComponent.form.get('designation')?.disabled).toBe(false);
    expect(newComponent.form.get('type')?.disabled).toBe(false);

    newFixture.destroy();
  });

  it('should handle component lifecycle and cleanup correctly', () => {
    const mockParams = createMockParams();
    component.agInit(mockParams);

    expect(component.params.api.addEventListener).toHaveBeenCalled();

    const refreshResult = component.refresh(mockParams);
    expect(refreshResult).toBe(false);

    const textResult = component.getTectByValue('C', component.optionsType);
    expect(textResult).toBe('Centralisé');

    spyOn(component.form, 'markAllAsTouched');
    component.displayErrors();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();

    component.ngOnDestroy();
    expect(component.params.api.removeEventListener).toHaveBeenCalledWith('rowDataUpdated', jasmine.any(Function));
  });
});
