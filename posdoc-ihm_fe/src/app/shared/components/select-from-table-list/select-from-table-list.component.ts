import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

type TableAlignment = 'before' | 'after';

@Component({
  selector: 'app-select-from-table-list',
  templateUrl: './select-from-table-list.component.html',
  styleUrls: ['./select-from-table-list.component.scss'],
  standalone: false,
})
export class SelectFromTableListComponent implements OnInit, OnChanges {
  @HostListener('document:contextmenu', ['$event'])
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !targetElement.closest(!!this.tableSelectClass ? `.${this.tableSelectClass}` : '.table-select')) {
      this.closeSelect();
    }
  }
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() index: number;
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
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
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
  /**
   * l'input rempli tout l'espace disponible
   */
  @Input() fillInput = false;
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];

  @Input() displayError = true;
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical = false;

  @Input() options: { value: string | number; columns: { label: string; value: string | number }[]; disabled?: boolean }[];

  @Input() isDisabled = false;

  @Input() tableAlignment: TableAlignment = 'after';

  @Input() tableSelectClass: string;

  @Input() isMultipleSelect = false;
  /**
   * Le traitement souhaité en cas de selectionner un item
   */
  @Output() changeEvent = new EventEmitter<string>();

  array = Array;
  displayTable = { display: 'none', 'margin-top': '0.5rem' };

  selectedValues: (string | number)[] = [];

  selectAllChecked = false;

  @HostListener('window:resize')
  adjustPosition(): void {
    const element = document.querySelector('.table-selector') as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        element.style.right = '0';
        element.style.left = 'auto';
      } else if (rect.left < 0) {
        element.style.left = '0';
        element.style.right = 'auto';
      }

      if (rect.bottom > viewportHeight) {
        element.style.bottom = '100%';
        element.style.top = 'auto';
      } else {
        element.style.top = '100%';
        element.style.bottom = 'auto';
      }
    }
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe().subscribe(value => {
      if (this.isMultipleSelect) {
        if (value instanceof Array) {
          this.selectedValues = value;
        } else {
          this.selectedValues = [value];
          this.form.setValue(this.selectedValues);
        }
        this.selectAllChecked = this.isSelectedAllChecked();
      } else if (value instanceof Array) {
        this.selectRow(value[0]);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.isMultipleSelect) {
      this.syncForMultipleSelectWithOptions();
    }
  }

  syncForMultipleSelectWithOptions() {
    const values = [...new Set(this.options.map(opt => opt.value))];
    this.selectedValues = this.selectedValues.filter(value => values.includes(value));
    this.selectAllChecked = this.isSelectedAllChecked();
    this.form.setValue(this.selectedValues);
  }

  openCloseSelect(): void {
    if (this.displayTable.display === 'none') {
      this.displayTable.display = 'block';
      setTimeout(() => this.adjustPosition(), 0);
    } else if (!this.isMultipleSelect) {
      this.closeSelect();
    }
    this.form.markAsTouched();
  }

  closeSelect(): void {
    this.displayTable.display = 'none';
  }

  getSelectedElement(): string | number {
    const formValue = this.form.getRawValue();
    if (this.isMultipleSelect && formValue instanceof Array && formValue.length > 1) {
      return `${[...new Set(formValue)].length} sélectionnés`;
    } else {
      return formValue instanceof Array ? formValue[0] : formValue;
    }
  }

  getHeaderColumns(): string[] {
    const [fistOption] = this.options ?? [];
    return fistOption?.columns.map(c => c.label);
  }

  stopPropagation(event): void {
    event.stopPropagation();
  }

  selectRow(value: string | number): void {
    if (!this.isMultipleSelect) {
      this.form.setValue(value);
    } else {
      // Inverser l'état de la case à cocher lorsqu'on clique sur la ligne
      if (this.isChecked(value)) {
        const index = this.selectedValues.indexOf(value);
        this.selectedValues.splice(index, 1);
      } else {
        this.selectedValues.push(value);
      }
      this.form.setValue([...this.selectedValues]);
      this.selectAllChecked = this.isSelectedAllChecked();
    }
  }

  isTouchedAndEmpty(): boolean {
    return this.form.touched && !this.getSelectedElement() && this.displayError && !this.form.valid;
  }

  getClassName() {
    return this.tableSelectClass;
  }

  selectAll(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedValues = [...new Set(this.options.map(option => option.value))];
    } else {
      this.selectedValues = [];
    }
    this.form.setValue(this.selectedValues);
  }

  addToSelected(event: any, value: string | number) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedValues.push(value);
    } else {
      const index = this.selectedValues.indexOf(value);
      this.selectedValues.splice(index, 1);
    }
    this.form.setValue(this.selectedValues);
  }

  isChecked(value: string | number): boolean {
    return this.selectedValues.indexOf(value) > -1;
  }

  isSelectedAllChecked() {
    if (this.options.length > 0) {
      return this.options.every(option => this.selectedValues.includes(option.value));
    }
    return false;
  }
}
