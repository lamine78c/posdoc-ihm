import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-single-liste-hierarchise-form',
  templateUrl: './single-liste-hierarchise-form.component.html',
  styleUrls: ['./single-liste-hierarchise-form.component.scss'],
  standalone: false,
})
export class SingleListeHierarchiseFormComponent implements OnInit {
  @ViewChild(NgbCollapse) collapse: NgbCollapse;
  @Input() form: FormGroup;
  @Input() key: string;
  @Input() parentIndex: number;
  @Input() selectedElement: string;
  @Output() selectedElementEvent = new EventEmitter<string>();

  isDisabled = false;
  isCollapsed = true;
  array = Array;

  ngOnInit(): void {
    const ONE = 1;
    let totalControl = 0,
      nameControl;
    // Annuler la collapse si le formControl n'a pas de children
    for (const prop in this.form.controls) {
      totalControl++;
      nameControl = prop;
    }
    if (totalControl == ONE && this.key.endsWith('null')) {
      this.isDisabled = true;
      this.key = nameControl;
    }
  }

  isSelected(element: string): boolean {
    return element == this.selectedElement;
  }

  sendSelectedElement(selectedElement: any): void {
    this.selectedElementEvent.emit(selectedElement);
  }

  /**
   * Déplie le groupe contenant l'élément sélectionné, sans quoi celui-ci resterait masqué.
   * Appelé à chaque ouverture de la liste, l'utilisateur ayant pu replier le groupe entre-temps.
   * Sans objet pour un groupe sans enfant (isDisabled), dont le contenu ferait doublon.
   */
  expandIfContainsSelectedElement(): void {
    if (!this.isCollapsed || this.isDisabled) {
      return;
    }
    if (!Object.keys(this.form.controls).some(control => this.isSelected(control))) {
      return;
    }
    // Dépliage immédiat plutôt qu'animé : la liste s'ouvre au même instant et sa position
    // de scroll est calculée juste après, sur une hauteur qui doit déjà être définitive
    this.collapse.animation = false;
    this.collapse.collapsed = false;
    this.collapse.animation = true;
    // Maintient la synchronisation du binding [(ngbCollapse)] et de l'icône +/-
    this.isCollapsed = false;
  }
}
