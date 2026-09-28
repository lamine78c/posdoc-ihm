import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { PopupCtreateContenuComponent } from './popup-ctreate-contenu.component';
import CustomValidators from '@app/shared/utils/CustomValidators';

describe('PopupCtreateContenuComponent', () => {
  let component: PopupCtreateContenuComponent;
  let fixture: ComponentFixture<PopupCtreateContenuComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let mockCalendar: jasmine.SpyObj<NgbCalendar>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    mockCalendar = jasmine.createSpyObj('NgbCalendar', ['getToday', 'getNext']);

    await TestBed.configureTestingModule({
      declarations: [PopupCtreateContenuComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgbActiveModal, useValue: mockActiveModal },
        { provide: NgbCalendar, useValue: mockCalendar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PopupCtreateContenuComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
  });

  describe('Initialisation du composant', () => {
    it('devrait créer le composant avec les valeurs par défaut', () => {
      expect(component).toBeTruthy();
      expect(component.titre).toBe('');
      expect(component.message).toBe('');
      expect(component.regions).toEqual([]);
      expect(component.listRegion).toEqual([]);
      expect(component.labelWidth).toBe('9.929rem');
    });

    it('devrait initialiser le composant avec des données fournies via les inputs', () => {
      component.titre = 'Titre de test';
      component.message = 'Message de test';
      component.regions = ['092', '109'];
      component.listRegion = ['092', '109', '116', '117'];

      expect(component.titre).toBe('Titre de test');
      expect(component.message).toBe('Message de test');
      expect(component.regions).toEqual(['092', '109']);
      expect(component.listRegion).toEqual(['092', '109', '116', '117']);
    });
  });

  describe('ngOnInit - Création de contenu (nouveau)', () => {
    beforeEach(() => {
      const today = new NgbDate(2023, 9, 15);
      const nextMonth = new NgbDate(2023, 10, 15);
      mockCalendar.getToday.and.returnValue(today);
      mockCalendar.getNext.and.returnValue(nextMonth);
    });

    it('devrait initialiser le formulaire avec les dates par défaut pour une création', () => {
      component.listRegion = ['092', '109', '116'];
      component.ngOnInit();

      expect(mockCalendar.getToday).toHaveBeenCalled();
      expect(mockCalendar.getNext).toHaveBeenCalledWith(jasmine.any(NgbDate), 'm');
      expect(component.form).toBeDefined();
      expect(component.form.get('titre')?.value).toBe('');
      expect(component.form.get('message')?.value).toBe('');
      expect(component.form.get('dateActivation')?.value).toEqual(new NgbDate(2023, 9, 15));
      expect(component.form.get('dateExpiration')?.value).toEqual(new NgbDate(2023, 10, 15));
    });

    it('devrait créer les contrôles de région avec les valeurs appropriées', () => {
      component.listRegion = ['092', '109', '116'];
      component.regions = ['092', '116'];
      component.ngOnInit();

      const regionsGroup = component.form.get('regions');
      expect(regionsGroup?.get('092')?.value).toBe(true);
      expect(regionsGroup?.get('109')?.value).toBe('');
      expect(regionsGroup?.get('116')?.value).toBe(true);
    });

    it('devrait créer un formulaire avec les validateurs appropriés', () => {
      spyOn(CustomValidators, 'required').and.returnValue(() => null);
      spyOn(CustomValidators, 'lenghtMaxValidation').and.returnValue(() => null);
      component.listRegion = ['092'];
      component.ngOnInit();

      expect(CustomValidators.required).toHaveBeenCalledTimes(4); // titre, message, dateActivation, dateExpiration
      expect(CustomValidators.lenghtMaxValidation).toHaveBeenCalledTimes(1); // titre
      expect(component.form.get('titre')?.hasError).toBeDefined();
      expect(component.form.get('message')?.hasError).toBeDefined();
      expect(component.form.get('dateActivation')?.hasError).toBeDefined();
      expect(component.form.get('dateExpiration')?.hasError).toBeDefined();
    });
  });

  describe('ngOnInit - Modification de contenu (existant)', () => {
    it('devrait initialiser le formulaire avec les dates existantes pour une modification', () => {
      component.dateActivation = '2023-08-01T00:00:00.000Z';
      component.dateExpiration = '2023-09-01T00:00:00.000Z';
      component.titre = 'Titre existant';
      component.message = 'Message existant';
      component.listRegion = ['092', '109'];
      component.regions = ['092'];

      component.ngOnInit();

      expect(mockCalendar.getToday).not.toHaveBeenCalled();
      expect(component.form.get('titre')?.value).toBe('Titre existant');
      expect(component.form.get('message')?.value).toBe('Message existant');
      expect(component.form.get('dateActivation')?.value).toEqual(new NgbDate(2023, 8, 1));
      expect(component.form.get('dateExpiration')?.value).toEqual(new NgbDate(2023, 9, 1));
    });

    it('devrait gérer correctement les dates avec différents formats', () => {
      component.dateActivation = new Date('2023-12-25').toISOString();
      component.dateExpiration = new Date('2024-01-25').toISOString();
      component.listRegion = ['092'];

      component.ngOnInit();

      const dateActivation = component.form.get('dateActivation')?.value as NgbDate;
      const dateExpiration = component.form.get('dateExpiration')?.value as NgbDate;

      expect(dateActivation.year).toBe(2023);
      expect(dateActivation.month).toBe(12);
      expect(dateActivation.day).toBe(25);
      expect(dateExpiration.year).toBe(2024);
      expect(dateExpiration.month).toBe(1);
      expect(dateExpiration.day).toBe(25);
    });
  });

  describe('Gestion des régions', () => {
    it('devrait gérer une liste vide de régions', () => {
      component.listRegion = [];
      component.regions = [];
      component.ngOnInit();

      const regionsGroup = component.form.get('regions') as FormGroup;
      expect(Object.keys(regionsGroup?.controls || {}).length).toBe(0);
    });

    it('devrait gérer une grande liste de régions', () => {
      const largeRegionList = Array.from({length: 50}, (_, i) => `${(i + 90).toString().padStart(3, '0')}`);
      const selectedRegions = ['095', '105', '115'];

      component.listRegion = largeRegionList;
      component.regions = selectedRegions;
      component.ngOnInit();

      const regionsGroup = component.form.get('regions') as FormGroup;
      expect(Object.keys(regionsGroup?.controls || {}).length).toBe(50);
      expect(regionsGroup?.get('095')?.value).toBe(true);
      expect(regionsGroup?.get('105')?.value).toBe(true);
      expect(regionsGroup?.get('115')?.value).toBe(true);
      expect(regionsGroup?.get('100')?.value).toBe('');
    });

    it('devrait gérer des codes de régions avec différents formats', () => {
      component.listRegion = ['092', '109', '116', '117'];
      component.regions = ['092', '117'];
      component.ngOnInit();

      const regionsGroup = component.form.get('regions') as FormGroup;
      expect(regionsGroup?.get('092')?.value).toBe(true);
      expect(regionsGroup?.get('109')?.value).toBe('');
      expect(regionsGroup?.get('116')?.value).toBe('');
      expect(regionsGroup?.get('117')?.value).toBe(true);
    });
  });

  describe('Méthode save()', () => {
    beforeEach(() => {
      const today = new NgbDate(2023, 9, 15);
      const nextMonth = new NgbDate(2023, 10, 15);
      mockCalendar.getToday.and.returnValue(today);
      mockCalendar.getNext.and.returnValue(nextMonth);
      component.listRegion = ['092', '109'];
      component.ngOnInit();
    });

    it('devrait sauvegarder les données du formulaire et fermer la modal', () => {
      component.form.patchValue({
        titre: 'Nouveau titre',
        message: 'Nouveau message',
        dateActivation: new NgbDate(2023, 9, 20),
        dateExpiration: new NgbDate(2023, 10, 20)
      });
      component.form.get('regions.092')?.patchValue(true);

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith(jasmine.objectContaining({
        titre: 'Nouveau titre',
        message: 'Nouveau message',
        dateActivation: jasmine.any(Date),
        dateExpiration: jasmine.any(Date),
        regions: jasmine.any(Object)
      }));
    });

    it('devrait convertir correctement les dates NgbDate en Date JavaScript', () => {
      component.form.patchValue({
        titre: 'Test',
        message: 'Test message',
        dateActivation: new NgbDate(2023, 12, 25),
        dateExpiration: new NgbDate(2024, 1, 15)
      });

      component.save();

      const savedData = mockActiveModal.close.calls.mostRecent().args[0];
      expect(savedData.dateActivation).toEqual(new Date(2023, 11, 25)); // Month is 0-indexed
      expect(savedData.dateExpiration).toEqual(new Date(2024, 0, 15));
    });

    it('devrait inclure toutes les données des régions dans la sauvegarde', () => {
      component.form.get('regions.092')?.patchValue(true);
      component.form.get('regions.109')?.patchValue(false);

      component.save();

      const savedData = mockActiveModal.close.calls.mostRecent().args[0];
      expect(savedData.regions['092']).toBe(true);
      expect(savedData.regions['109']).toBe(false);
    });

    it('devrait gérer la sauvegarde avec des champs vides', () => {
      // Le formulaire est déjà initialisé avec des valeurs vides
      component.save();

      expect(mockActiveModal.close).toHaveBeenCalled();
      const savedData = mockActiveModal.close.calls.mostRecent().args[0];
      expect(savedData.titre).toBe('');
      expect(savedData.message).toBe('');
    });
  });

  describe('Gestion des cas limites et erreurs', () => {
    it('devrait gérer les dates invalides gracieusement', () => {
      component.dateActivation = 'date-invalide';
      component.dateExpiration = 'date-invalide';
      component.listRegion = ['092'];

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('devrait gérer les valeurs null pour les dates', () => {
      component.dateActivation = null;
      component.dateExpiration = null;
      component.listRegion = ['092'];

      const today = new NgbDate(2023, 9, 15);
      const nextMonth = new NgbDate(2023, 10, 15);
      mockCalendar.getToday.and.returnValue(today);
      mockCalendar.getNext.and.returnValue(nextMonth);

      component.ngOnInit();

      expect(component.form.get('dateActivation')?.value).toEqual(today);
      expect(component.form.get('dateExpiration')?.value).toEqual(nextMonth);
    });

    it('devrait gérer les valeurs undefined pour les inputs', () => {
      component.titre = undefined as any;
      component.message = undefined as any;
      component.regions = undefined as any;
      component.listRegion = [];

      const today = new NgbDate(2023, 9, 15);
      mockCalendar.getToday.and.returnValue(today);
      mockCalendar.getNext.and.returnValue(today);

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('devrait gérer la sauvegarde même si le formulaire est invalide', () => {
      component.listRegion = ['092'];
      component.ngOnInit();

      // Simuler des dates valides mais formulaire avec champs requis vides
      const today = new NgbDate(2023, 9, 15);
      const nextMonth = new NgbDate(2023, 10, 15);

      component.form.patchValue({
        titre: '',
        message: '',
        dateActivation: today,
        dateExpiration: nextMonth
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalled();
      const savedData = mockActiveModal.close.calls.mostRecent().args[0];
      expect(savedData.titre).toBe('');
      expect(savedData.message).toBe('');
      expect(savedData.dateActivation).toEqual(new Date(2023, 8, 15)); // Month is 0-indexed
      expect(savedData.dateExpiration).toEqual(new Date(2023, 9, 15));
    });

    it('devrait gérer la sauvegarde avec des dates null/undefined', () => {
      component.listRegion = ['092'];
      component.ngOnInit();

      // Forcer les dates à null pour tester la robustesse
      component.form.patchValue({
        titre: 'Test titre',
        message: 'Test message',
        dateActivation: null,
        dateExpiration: null
      });

      // Cette action devrait lever une erreur ou être gérée gracieusement
      expect(() => component.save()).toThrowError();
    });
  });

  describe('Tests d\'intégration des propriétés', () => {
    it('devrait maintenir la cohérence entre les inputs et le formulaire', () => {
      component.titre = 'Titre initial';
      component.message = 'Message initial';
      component.regions = ['092'];
      component.listRegion = ['092', '109'];
      component.dateActivation = '2023-08-15T00:00:00.000Z';
      component.dateExpiration = '2023-09-15T00:00:00.000Z';

      component.ngOnInit();

      expect(component.form.get('titre')?.value).toBe('Titre initial');
      expect(component.form.get('message')?.value).toBe('Message initial');
      expect(component.form.get('regions.092')?.value).toBe(true);
      expect(component.form.get('regions.109')?.value).toBe('');

      // Modifier le formulaire
      component.form.patchValue({
        titre: 'Titre modifié',
        message: 'Message modifié'
      });

      component.save();

      const savedData = mockActiveModal.close.calls.mostRecent().args[0];
      expect(savedData.titre).toBe('Titre modifié');
      expect(savedData.message).toBe('Message modifié');
    });

    it('devrait gérer correctement les changements dynamiques des régions', () => {
      // Test avec mise à jour dynamique des régions
      component.listRegion = ['092'];
      component.regions = [];
      component.ngOnInit();

      // Simuler un changement de régions après initialisation
      component.listRegion = ['092', '109', '116'];
      component.regions = ['109'];

      // Réinitialiser le formulaire
      component.ngOnInit();

      const regionsGroup = component.form.get('regions') as FormGroup;
      expect(regionsGroup?.get('092')?.value).toBe('');
      expect(regionsGroup?.get('109')?.value).toBe(true);
      expect(regionsGroup?.get('116')?.value).toBe('');
    });
  });

  describe('Performance et optimisation', () => {
    it('devrait gérer efficacement un grand nombre de régions', () => {
      // Test simplifié pour éviter les problèmes de performance dans l'environnement de test
      component.listRegion = Array.from({length: 100}, (_, i) => `${(i + 1).toString().padStart(3, '0')}`);
      component.regions = Array.from({length: 10}, (_, i) => `${(i * 10 + 1).toString().padStart(3, '0')}`);

      component.ngOnInit();

      // Vérifier que le formulaire est bien créé avec toutes les régions
      expect(component.form.get('regions')).toBeDefined();
      const regionsGroup = component.form.get('regions') as FormGroup;
      expect(Object.keys(regionsGroup?.controls || {}).length).toBe(100);
    });

    it('devrait créer le FormGroup une seule fois lors de ngOnInit', () => {
      spyOn(component['fb'], 'group').and.callThrough();

      component.listRegion = ['092', '109'];
      component.ngOnInit();

      // fb.group devrait être appelé exactement 2 fois : une pour le form principal, une pour les régions
      expect(component['fb'].group).toHaveBeenCalledTimes(2);
    });
  });
});
