import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ListeDeroulanteHierarchiseeFormComponent } from './liste-deroulante-hierarchisee-form/liste-deroulante-hierarchisee-form.component';
import { ListeDeroulanteHierarchiseeComponent } from './liste-deroulante-hierarchisee.component';

describe('ListeDeroulanteHierarchiseeComponent', () => {
  const ROW_COUNT = 20;
  const ROW_HEIGHT_PX = 50;
  const CONTAINER_WIDTH_PX = 200;
  const CONTAINER_HEIGHT_PX = 100;

  let component: ListeDeroulanteHierarchiseeComponent;
  let fixture: ComponentFixture<ListeDeroulanteHierarchiseeComponent>;
  let fb: FormBuilder;
  let scrollableContent: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeDeroulanteHierarchiseeComponent, ListeDeroulanteHierarchiseeFormComponent],
      imports: [CommonModule, ReactiveFormsModule, NgbModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeDeroulanteHierarchiseeComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
    component.form = fb.group({});
    fixture.detectChanges();
  });

  afterEach(() => scrollableContent?.remove());

  /**
   * Construit une liste scrollable réelle : ROW_COUNT lignes à case à cocher dont une seule cochée,
   * dans un conteneur ne pouvant en afficher que deux à la fois.
   */
  function givenScrollableContent(checkedIndex: number, isCheckedRowRendered = true): HTMLElement {
    scrollableContent = document.createElement('div');
    scrollableContent.style.cssText = `position: absolute; top: 0; left: 0; width: ${CONTAINER_WIDTH_PX}px; height: ${CONTAINER_HEIGHT_PX}px; overflow: auto;`;
    for (let index = 0; index < ROW_COUNT; index++) {
      const row = document.createElement('div');
      row.classList.add('form-check');
      // marges/paddings neutralisés pour que la géométrie ne dépende pas des styles Bootstrap globaux
      row.style.cssText = `height: ${ROW_HEIGHT_PX}px; margin: 0; padding: 0;`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('form-check-input');
      checkbox.checked = index === checkedIndex;
      if (index === checkedIndex && !isCheckedRowRendered) {
        row.style.display = 'none';
      }
      checkbox.style.margin = '0';
      row.appendChild(checkbox);
      scrollableContent.appendChild(row);
    }
    document.body.appendChild(scrollableContent);
    component.scrollableContent = new ElementRef(scrollableContent);
    return scrollableContent;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should center the first checked element in the view when the dropdown opens', fakeAsync(() => {
    const container = givenScrollableContent(14);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(14 * ROW_HEIGHT_PX - (CONTAINER_HEIGHT_PX - ROW_HEIGHT_PX) / 2);
  }));

  it('should not scroll when the checked element is already visible', fakeAsync(() => {
    const container = givenScrollableContent(1);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should ignore a checked element that is not rendered', fakeAsync(() => {
    const container = givenScrollableContent(14, false);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should not scroll when nothing is checked', fakeAsync(() => {
    const container = givenScrollableContent(-1);

    component.openChange(true);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should not scroll when the dropdown closes', fakeAsync(() => {
    const container = givenScrollableContent(14);

    component.openChange(false);
    tick();

    expect(container.scrollTop).toBe(0);
  }));

  it('should expand a group holding a checked element when the dropdown opens', fakeAsync(() => {
    component.form = fb.group({ '117': fb.group({ '117': [true], '118': [false] }) });
    fixture.detectChanges();
    const group = component.childForms.first;
    expect(group.isCollapsed).toBeTrue();

    component.openChange(true);
    tick();

    expect(group.isCollapsed).toBeFalse();
  }));

  it('should not expand a group without checked element when the dropdown opens', fakeAsync(() => {
    component.form = fb.group({ '117': fb.group({ '117': [false], '118': [false] }) });
    fixture.detectChanges();

    component.openChange(true);
    tick();

    expect(component.childForms.first.isCollapsed).toBeTrue();
  }));

  it('should display the default text while nothing is selected', () => {
    expect(component.getElementToDisplay()).toBe(component.defaultText);
  });

  it('should display the selected element and then their count', () => {
    component.form = fb.group({ '117-null': fb.group({ '117': [true] }), '118-null': fb.group({ '118': [false] }) });
    expect(component.getElementToDisplay()).toBe('117');

    component.form.get('118-null').get('118').setValue(true);

    expect(component.getElementToDisplay()).toBe('2 sélectionnés');
  });
});
