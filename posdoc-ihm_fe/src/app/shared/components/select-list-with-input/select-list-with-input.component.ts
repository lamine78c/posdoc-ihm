import { Component, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-list-with-input',
  templateUrl: './select-list-with-input.component.html',
  styleUrls: ['./select-list-with-input.component.scss'],
  standalone: false,
})
export class SelectListWithInputComponent {
  @ViewChild('dropdownMenuRef', { static: false, read: NgbDropdownMenu }) dropdownMenu: NgbDropdownMenu;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() index: number;
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical: boolean = false;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 6;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * Transforme la saisie en majuscule
   */
  @Input() toUpperCase: boolean = false;

  @Input() isDisabled: boolean = false;

  @Input() options: string[];

  patchFormatedValue(event: any): void {
    const formatedValue = this.toUpperCase ? event.target.value.toUpperCase() : event.target.value;
    this.form.patchValue(formatedValue);
  }

  getFiltredData(data: string[]): string[] {
    if (!this.form.value) {
      return data;
    }
    return data.filter((e: string) => e?.toLowerCase().includes(this.form.value?.toLowerCase()));
  }

  /**
   * Toggle la dropdown
   */
  closeToggleDropdown(option: string): void {
    if (this.form.value?.toLowerCase() !== option.toLowerCase()) {
      this.form.setValue(option);
    }
    this.dropdownMenu.dropdown.close();
  }

  isTouchedAndEmpty(): boolean {
    return this.form.touched && !this.form.valid && !this.form.disabled && this.form.errors.isError;
  }
}
