import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NgbCollapseModule, NgbDropdownModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { SingleListeHierarchiseFormComponent } from './single-liste-hierarchise-form/app-single-liste-hierarchise-form';
import { SingleSelectHierarchiseListComponent } from './single-select-hierarchise-list.component';

describe('SingleSelectHierarchiseListComponent', () => {
  const ITEM_COUNT = 20;
  const ITEM_HEIGHT_PX = 50;
  const CONTAINER_HEIGHT_PX = 100;
  const CONTAINER_WIDTH_PX = 200;

  let component: SingleSelectHierarchiseListComponent;
  let fixture: ComponentFixture<SingleSelectHierarchiseListComponent>;
  let fb: FormBuilder;
  let scrollableContent: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleSelectHierarchiseListComponent, SingleListeHierarchiseFormComponent],
      imports: [CommonModule, NgbCollapseModule, NgbDropdownModule, NgbPopoverModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleSelectHierarchiseListComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
    component.form = fb.group({
      '110-null': fb.group({ '110': [false] }),
      '117-null': fb.group({ '117': [false] }),
    });
    fixture.detectChanges();
  });

  afterEach(() => scrollableContent?.remove());

  /**
   * Construit une liste scrollable réelle : ITEM_COUNT éléments dont un seul sélectionné,
   * dans un conteneur ne pouvant en afficher que deux à la fois.
   */
  function givenScrollableContent(selectedIndex: number, isSelectedRendered = true): HTMLElement {
    scrollableContent = document.createElement('div');
    scrollableContent.style.cssText = `position: absolute; top: 0; left: 0; width: ${CONTAINER_WIDTH_PX}px; height: ${CONTAINER_HEIGHT_PX}px; overflow: auto;`;
    for (let index = 0; index < ITEM_COUNT; index++) {
      const item = document.createElement('div');
      item.style.height = `${ITEM_HEIGHT_PX}px`;
      if (index === selectedIndex) {
        item.classList.add('selected-color');
        item.style.display = isSelectedRendered ? 'block' : 'none';
      }
      scrollableContent.appendChild(item);
    }
    document.body.appendChild(scrollableContent);
    component.scrollableContent = new ElementRef(scrollableContent);
    return scrollableContent;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should center the selected element in the view when the dropdown opens', fakeAsync(() => {
    const container = givenScrollableContent(14);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(14 * ITEM_HEIGHT_PX - (CONTAINER_HEIGHT_PX - ITEM_HEIGHT_PX) / 2);
  }));

  it('should not scroll when the selected element is already visible', fakeAsync(() => {
    const container = givenScrollableContent(1);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should ignore a selected element that is not rendered', fakeAsync(() => {
    const container = givenScrollableContent(14, false);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should not scroll when no element is selected', fakeAsync(() => {
    const container = givenScrollableContent(-1);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should expand the group holding the selection when the dropdown opens', fakeAsync(() => {
    component.form = fb.group({ '117': fb.group({ '117': [false], '118': [true] }) });
    fixture.detectChanges();
    const group = component.childForms.first;
    expect(group.isCollapsed).toBeTrue();

    component.openChange(true);
    tick();

    expect(group.isCollapsed).toBeFalse();
  }));

  it('should not expand a group without selection when the dropdown opens', fakeAsync(() => {
    component.form = fb.group({ '117': fb.group({ '117': [false], '118': [false] }) });
    fixture.detectChanges();

    component.openChange(true);
    tick();

    expect(component.childForms.first.isCollapsed).toBeTrue();
  }));

  it('should mark the form as touched when the dropdown closes', () => {
    component.openChange(false);

    expect(component.form.touched).toBeTrue();
  });

  it('should display the default text while nothing is selected', () => {
    expect(component.getElementToDisplay()).toBe(component.defaultText);
    expect(component.isTouchedAndEmpty()).toBeFalse();
  });

  it('should emit the selected element and close the dropdown', () => {
    spyOn(component.dropdown, 'close');
    spyOn(component.changeEvent, 'emit');

    component.setSelectedElement(' 117 ');

    expect(component.dropdown.close).toHaveBeenCalled();
    expect(component.changeEvent.emit).toHaveBeenCalledWith('117');
    expect(component.getElementToDisplay()).toBe(' 117 ');
  });
});
