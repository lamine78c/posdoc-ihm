import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ListeDeroulanteHierarchiseeFormComponent } from './liste-deroulante-hierarchisee-form.component';

describe('ListeDeroulanteHierarchiseeFormComponent', () => {
  let component: ListeDeroulanteHierarchiseeFormComponent;
  let fb: FormBuilder;
  let fixture: ComponentFixture<ListeDeroulanteHierarchiseeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeDeroulanteHierarchiseeFormComponent],
      imports: [ReactiveFormsModule, NgbModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeDeroulanteHierarchiseeFormComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
  });

  /**
   * Initialise le composant avec le groupe et la clé donnés.
   * Clé par défaut '117' : un code région peut être identique à un code organisme qu'elle contient.
   */
  function initComponent(controls: { [key: string]: boolean }, key = '117'): void {
    component.form = fb.group(controls);
    component.key = key;
    fixture.detectChanges();
  }

  it('should create', () => {
    initComponent({ '117': false });

    expect(component).toBeTruthy();
  });

  it('should start collapsed', () => {
    initComponent({ '117': true, '118': false });

    expect(component.isCollapsed).toBeTrue();
  });

  it('should expand a partially checked group without animating', () => {
    initComponent({ '117': true, '118': false });

    component.expandIfPartiallyChecked();
    const collapseElement: HTMLElement = fixture.nativeElement.querySelector('.collapse-container');

    expect(component.isCollapsed).toBeFalse();
    // déplié immédiatement : classe 'show' posée, sans transition 'collapsing' en cours
    expect(collapseElement.classList.contains('show')).toBeTrue();
    expect(collapseElement.classList.contains('collapsing')).toBeFalse();
    // l'animation est rétablie pour les dépliages/repliages manuels
    expect(component.collapse.animation).toBeTrue();
  });

  it('should expand a group checked after its initialization', () => {
    initComponent({ '117': false, '118': false });

    component.form.get('118').setValue(true);
    component.expandIfPartiallyChecked();

    expect(component.isCollapsed).toBeFalse();
  });

  it('should keep a fully checked group collapsed', () => {
    initComponent({ '117': true, '118': true });

    component.expandIfPartiallyChecked();

    expect(component.isCollapsed).toBeTrue();
    expect(component.groupForm.get('selectAll').value).toBeTrue();
  });

  it('should keep an unchecked group collapsed', () => {
    initComponent({ '117': false, '118': false });

    component.expandIfPartiallyChecked();

    expect(component.isCollapsed).toBeTrue();
  });

  it('should keep a checked group without children collapsed', () => {
    initComponent({ '110': true }, '110-null');

    component.expandIfPartiallyChecked();

    expect(component.isDisabled).toBeTrue();
    expect(component.key).toBe('110');
    expect(component.isCollapsed).toBeTrue();
  });

  it('should unsubscribe on destroy', () => {
    initComponent({ '117': false });
    const subscriptions = component.subscriptions;

    fixture.destroy();

    expect(subscriptions.every(subscription => subscription.closed)).toBeTrue();
  });
});
