import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { SingleListeHierarchiseFormComponent } from './app-single-liste-hierarchise-form';

describe('SingleListeHierarchiseFormComponent', () => {
  let component: SingleListeHierarchiseFormComponent;
  let fixture: ComponentFixture<SingleListeHierarchiseFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleListeHierarchiseFormComponent],
      imports: [NgbCollapseModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleListeHierarchiseFormComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
  });

  /**
   * Initialise le composant avec un groupe et l'élément sélectionné donnés.
   * Un code région peut être identique à un code organisme qu'elle contient (ex : 117).
   */
  function initComponent(group: FormGroup, key: string, selectedElement?: string): void {
    component.form = group;
    component.key = key;
    component.selectedElement = selectedElement;
    fixture.detectChanges();
  }

  it('should create', () => {
    initComponent(fb.group({ '117': [false] }), '117');
    expect(component).toBeTruthy();
  });

  it('should not collapse a group without children', () => {
    initComponent(fb.group({ '110': [false] }), '110-null');

    expect(component.isDisabled).toBeTrue();
    expect(component.key).toBe('110');
  });

  it('should start collapsed', () => {
    initComponent(fb.group({ '117': [false], '118': [true] }), '117', '118');

    expect(component.isCollapsed).toBeTrue();
  });

  it('should expand the group containing the selected element without animating', () => {
    initComponent(fb.group({ '117': [false], '118': [true] }), '117', '118');

    component.expandIfContainsSelectedElement();
    const collapseElement: HTMLElement = fixture.nativeElement.querySelector('.collapse-container');

    expect(component.isCollapsed).toBeFalse();
    // déplié immédiatement : classe 'show' posée, sans transition 'collapsing' en cours
    expect(collapseElement.classList.contains('show')).toBeTrue();
    expect(collapseElement.classList.contains('collapsing')).toBeFalse();
    // l'animation est rétablie pour les dépliages/repliages manuels
    expect(component.collapse.animation).toBeTrue();
  });

  it('should expand the group when the selected element shares its code with the region', () => {
    initComponent(fb.group({ '117': [true], '118': [false] }), '117', '117');

    component.expandIfContainsSelectedElement();

    expect(component.isCollapsed).toBeFalse();
  });

  it('should keep the group collapsed when it does not contain the selected element', () => {
    initComponent(fb.group({ '117': [false], '118': [false] }), '117', '110');

    component.expandIfContainsSelectedElement();

    expect(component.isCollapsed).toBeTrue();
  });

  it('should keep a group without children collapsed even when it is the selected element', () => {
    initComponent(fb.group({ '110': [true] }), '110-null', '110');

    component.expandIfContainsSelectedElement();

    expect(component.isCollapsed).toBeTrue();
  });

  it('should expand the group when the selected element is set afterwards', () => {
    initComponent(fb.group({ '117': [false], '118': [false] }), '117');

    fixture.componentRef.setInput('selectedElement', '118');
    fixture.detectChanges();
    component.expandIfContainsSelectedElement();

    expect(component.isCollapsed).toBeFalse();
  });

  it('should emit the selected element', () => {
    initComponent(fb.group({ '117': [false] }), '117');
    spyOn(component.selectedElementEvent, 'emit');

    component.sendSelectedElement('117');

    expect(component.selectedElementEvent.emit).toHaveBeenCalledWith('117');
  });
});
