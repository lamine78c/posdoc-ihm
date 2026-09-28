import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { StringUtil } from '@app/shared/utils/StringUtil';

@Component({
  selector: 'app-multi-select-section',
  templateUrl: './multi-select-section.component.html',
  styleUrls: ['./multi-select-section.component.scss'],
  standalone: false,
})
export class MultiSelectSectionComponent implements OnInit {
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormGroup;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() formIndex: number;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];
  /**
   * Désactive le formulaire si true
   * Optionnel, peut être laissé à vide pour activer le formulaire
   */
  @Input() disabled = false;
  /**
   * Envoyer les champs selectionnés au composant parent
   */
  @Output() changeEvent = new EventEmitter<any>();
  /**
   * État du formulaire avant édition
   */
  formState: any;

  array = Array;

  @Input() isRessourceCustomSort = false;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    // Sauvegarde la valeur initiale du formulaire
    this.formState = this.form.getRawValue();
    this.onChangeEvent();
  }

  onChangeEvent() {
    this.form.valueChanges.subscribe(() => {
      this.formState = this.form.getRawValue();
      let selectedElem: any = [];
      for (const elem in this.formState) {
        if (this.formState[elem]) {
          let fichier: { title: string; selected: boolean } = { title: elem, selected: true };
          selectedElem.push(fichier);
        }
      }
      this.changeEvent.emit(selectedElem);
    });
  }

  sendSelectedElementOrElements(selectedItem: any): void {
    let selectedElements: any[] = Object.keys(this.form.controls)
      .filter(e => this.form.controls[e].value)
      .map(e => ({ title: e, selected: true }));
    if (selectedElements.some(e => e.title === selectedItem.key)) {
      selectedElements = [...selectedElements.filter(e => e.title !== selectedItem.key)];
    } else {
      selectedElements.push({ title: selectedItem.key, selected: true });
    }
    this.changeEvent.emit(selectedElements);
  }

  get customSort(): ((a: KeyValue<string, AbstractControl>, b: KeyValue<string, AbstractControl>) => number) | undefined {
    if (!this.isRessourceCustomSort) {
      return undefined;
    }

    return (a, b) => StringUtil.compareKeys(a.key, b.key);
  }
}
