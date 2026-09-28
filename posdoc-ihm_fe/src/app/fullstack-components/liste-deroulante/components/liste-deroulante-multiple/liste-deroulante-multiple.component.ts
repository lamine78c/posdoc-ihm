import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { ListeDeroulanteService } from '../../services/liste-deroulante.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { KeyValue } from '@angular/common';
import { StringUtil } from '@app/shared/utils/StringUtil';

@Component({
  selector: 'app-liste-deroulante-multiple',
  templateUrl: './liste-deroulante-multiple.component.html',
  styleUrls: ['./liste-deroulante-multiple.component.scss'],
  standalone: false,
})
export class ListeDeroulanteMultipleComponent implements OnInit, OnDestroy {
  isDisabled: boolean = false;

  @ViewChild('dropdownRef', { static: false, read: NgbDropdown }) dropdown: NgbDropdown;

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
  @Input() formIndex: string;
  /**
   * Texte affiché dans l'input lorsqu'aucune valeur n'est sélectionnée
   */
  @Input() defaultText: string = '%';
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
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 6;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;

  @Input() hasBlankOption: boolean = true;
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical: boolean = false;
  /**
   * Affichage du boutton RAZ
   */
  @Input() isWithRAZ: boolean = true;
  /**
   * Affichage des deux bouttons 'Valider' et 'RAZ'
   */
  @Input() isWithValidAndRAZBtn: boolean = true;

  //Envoyer les champs selectionnés au composant parent
  @Output() changeEvent = new EventEmitter<any>();

  @Input() isRessourceCustomSort: boolean = false;
  @Input() isFormatDDMMYYYYCustomSort: boolean = false;

  @Input() maxSelectCount = 0;

  @Input() labelClass = '';

  // Form pour le bouton select all
  formSelectAll: FormGroup = new FormGroup({});
  subscriptions: Subscription[] = [];
  // État du formulaire avant édition
  formState: any;
  // Permet de savoir si l'utilisateur à sauvegarder lorsque la dropdown se ferme
  hasSaved = false;

  array = Array;
  ressourcesOrderedList: string[] = [];

  constructor(
    private fb: FormBuilder,
    private listeDeroulanteService: ListeDeroulanteService,
    private filterSharedDataService: FilterSharedDataService
  ) {
    this.filterSharedDataService.getData().subscribe(isDisabled => (this.isDisabled = isDisabled));
  }

  ngOnInit(): void {
    // Formulaire pour le select all
    this.formSelectAll = this.fb.group({
      selectAll: false,
    });

    // Met à jour les valeurs lorsque 'Tout sélectionner / Tout désélectionner' est coché
    this.subscriptions.push(
      this.formSelectAll.valueChanges.subscribe(() => {
        this.listeDeroulanteService.selectAll(this.formSelectAll, this.form, false);
      })
    );

    // Met à jour le texte en fonction des valeurs nouvelles valeurs
    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        this.formState = this.form.getRawValue();
        if (!this.isWithValidAndRAZBtn) {
          let selectedElem: any = [];
          for (const elem in this.formState) {
            if (this.formState[elem]) {
              let fichier: { title: string; selected: boolean } = { title: elem, selected: true };
              selectedElem.push(fichier);
            }
          }
          this.dropdown.isOpen() && this.changeEvent.emit(selectedElem);
        }
      })
    );

    // Sauvegarde la valeur initiale du formulaire
    this.formState = this.form.getRawValue();

    // générer un formIndex unique s'il manque
    if (!this.formIndex) {
      this.formIndex = StringUtil.uniqueKey();
    }
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
    !this.isWithValidAndRAZBtn && this.changeEvent.emit(selectedElements);
  }

  ngOnChanges() {
    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        const listOfSelectedElements: string[] = Object.keys(this.form.controls).filter(c => this.form.controls[c].value);
        const maxSize: number = Object.keys(this.form.controls).length;
        this.formSelectAll.patchValue(
          { selectAll: maxSize && listOfSelectedElements.length === maxSize },
          {
            emitEvent: false,
            onlySelf: true,
          }
        );
      })
    );

    // Sauvegarde la valeur initiale du formulaire
    this.formState = this.form.getRawValue();
  }

  /**
   * Appelé lorsque la dropdown est ouverte/fermée
   */
  openChange(isOpened: boolean): void {
    // Si on ferme la dropdown et que l'utilisateur n'a pas sauvegardé
    if (!isOpened && !this.hasSaved) {
      // Remet le formulaire sans son état initial
      this.form.patchValue({ selectAll: this.formState }, { emitEvent: false });
      this.form.markAllAsTouched();
    } else {
      // Sinon remet la valeur du boolean à false pour la prochaine ouverture
      this.hasSaved = false;
    }
  }

  selectAll(isAllUnselect: boolean): void {
    if (this.isWithValidAndRAZBtn) return;
    let formControlSelectedList: any = [];
    !isAllUnselect && (formControlSelectedList = Object.keys(this.form.controls).map(e => ({ title: e, selected: true })));
    this.changeEvent.emit(formControlSelectedList);
  }

  /**
   * Bouton valider de la dropdown
   */
  valider(title: any): void {
    // Met à jour le boolean de sauvegarde permettant de savoir s'il faut restituer l'état du formulaire ou non à la fermeture
    this.hasSaved = true;
    // Sauvegarde le nouvel état
    this.formState = this.form.getRawValue();

    this.form.markAllAsTouched();

    // Ferme la dropdown
    this.dropdown.close();

    let selectedElem: any = [];
    for (const elem in this.formState) {
      if (this.formState[elem]) {
        let fichier: { title: string; selected: boolean } = { title: elem, selected: true };
        selectedElem.push(fichier);
      }
    }
    this.changeEvent.emit(selectedElem);
  }

  vider() {
    this.formSelectAll.patchValue({ selectAll: false }, { emitEvent: false, onlySelf: true });
    this.changeEvent.emit([]);
  }

  /**
   * Toggle la dropdown
   */
  toggleDropdown(): void {
    this.dropdown.toggle();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getElementToDisplay(): string {
    const listOfSelectedElements: string[] = this.form?.controls ? Object.keys(this.form.controls).filter(c => this.form.controls[c].value) : [];

    if (listOfSelectedElements.length === 1) {
      return listOfSelectedElements[0];
    } else if (listOfSelectedElements.length > 1) {
      return listOfSelectedElements.length + ' sélectionnés';
    } else {
      return this.defaultText;
    }
  }

  get customSort(): ((a: KeyValue<string, AbstractControl>, b: KeyValue<string, AbstractControl>) => number) | undefined {
    if (this.isRessourceCustomSort) {
      return (a, b) => StringUtil.compareKeys(a.key, b.key);
    } else if (this.isFormatDDMMYYYYCustomSort) {
      return (a, b) => StringUtil.compareKeysDateFR(a.key, b.key);
    }

    return undefined;
  }

  hideSelectAllCheckbox(): boolean {
    return this.maxSelectCount > 0 && Object.keys(this.form.controls).length > this.maxSelectCount;
  }
}
