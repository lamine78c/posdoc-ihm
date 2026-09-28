import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FOUR, ONE, SIX, ZERO } from '@app/shared/utils/Constants';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ListeDeroulanteService } from '../../services/liste-deroulante.service';
import { ListeDeroulanteHierarchiseeFormComponent } from './liste-deroulante-hierarchisee-form/liste-deroulante-hierarchisee-form.component';
import { nodeTreeSelected } from './model/liste-deroulante-hierarchisee.interface';
import { StringUtil } from '@app/shared/utils/StringUtil';

@Component({
  selector: 'app-liste-deroulante-hierarchisee',
  templateUrl: './liste-deroulante-hierarchisee.component.html',
  styleUrls: ['./liste-deroulante-hierarchisee.component.scss'],
  standalone: false,
})
export class ListeDeroulanteHierarchiseeComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dropdownRef', { static: false, read: NgbDropdown }) dropdown: NgbDropdown;
  @ViewChild('containerRef') containerRef: ElementRef;
  @ViewChild('scrollableContent') scrollableContent: ElementRef<HTMLElement>;
  @ViewChildren(ListeDeroulanteHierarchiseeFormComponent) childForms: QueryList<ListeDeroulanteHierarchiseeFormComponent>;

  /**
   * Group du formulaire réactif contenant l'ensemble des valeurs
   * Format :
   * group({
   *   'Groupe 1': group({
   *     'Option 1':
   *   })
   * })
   */
  @Input() form: FormGroup;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Texte affiché dans l'input lorsqu'aucune valeur n'est sélectionnée
   */
  @Input() defaultText = '%';
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() formIndex: string;
  /**
   * Désactive le formulaire si true
   * Optionnel, peut être laissé à vide pour activer le formulaire
   */
  @Input() disabled = false;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = FOUR;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = SIX;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Affichage du boutton RAZ
   */
  @Input() isWithRAZ = true;
  /**
   * Affichage des deux bouttons 'Valider' et 'RAZ'
   */
  @Input() isWithValidAndRAZBtn = true;
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical = false;
  /**
   * Transforme le comportement des parents en mode radio (un seul parent sélectionnable à la fois)
   */
  @Input() isLikeRadioBouton = false;

  array = Array;

  //Envoyer les champs selectionnés au composant parent
  @Output() changeEvent = new EventEmitter<any>();

  // Form pour le bouton select all
  formSelectAll: FormGroup = new FormGroup({});
  subscriptions: Subscription[] = [];
  // Contenu à afficher dans la select en fonction des choix
  // État du formulaire avant édition
  formState;
  // Permet de savoir si l'utilisateur à sauvegarder lorsque la dropdown se ferme
  hasSaved = false;
  // Dernière clé parent sélectionnée en mode radio
  lastSelectedParent: string | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly listeDeroulanteService = inject(ListeDeroulanteService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    if (!this.isLikeRadioBouton) {
      this.onInitFormSelectAll();
    }
    // initialisation du filtre
    this.changeEvent.emit([]);

    // générer un formIndex unique s'il manque
    if (!this.formIndex) {
      this.formIndex = StringUtil.uniqueKey();
    }
  }

  // Formulaire pour le select all
  private onInitFormSelectAll() {
    this.formSelectAll = this.fb.group({
      selectAll: false,
    });
    this.onChangeSelectAll();
    // Sauvegarde la valeur initiale du formulaire
    this.formState = this.formSelectAll.getRawValue();
  }

  // event valueChanges pour formSelectAll
  private onChangeSelectAll() {
    this.subscriptions.push(
      this.formSelectAll.valueChanges.subscribe(() => {
        // Met à jour les valeurs lorsque 'Tout sélectionner / Tout désélectionner' est coché
        this.listeDeroulanteService.selectAll(this.formSelectAll, this.form, true);
      })
    );
  }

  // appelé à chaque modification suivante des inputs.
  ngOnChanges() {
    // event valueChanges pour form
    this.onChangeForm();
    // Sauvegarde la valeur initiale du formulaire
    this.formState = this.form.getRawValue();
    // Sauvegarde le parent sélectionné en mode radio
    if (this.isLikeRadioBouton && !this.lastSelectedParent) {
      this.lastSelectedParent = this.getSelectedParent();
    }
  }

  private onChangeForm() {
    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        const listOfSelectedElements = [].concat(
          ...Object.values(this.form.controls).map(e => Object.keys((e as FormGroup).controls).filter(c => (e as FormGroup).controls[c].value))
        );
        const maxSize: number = [].concat(...Object.values(this.form.controls).map(e => Object.keys((e as FormGroup).controls))).length;
        if (!this.isLikeRadioBouton) {
          this.formSelectAll.patchValue(
            { selectAll: maxSize && listOfSelectedElements.length === maxSize },
            {
              emitEvent: false,
              onlySelf: true,
            }
          );
        }
      })
    );
  }

  // En mode radio, recupère le node de racine sélectionné
  private getSelectedParent() {
    for (const [keyParent, value] of Object.entries(this.form.controls)) {
      const formGroup = value as FormGroup;
      for (const key in formGroup.controls) {
        if (formGroup.controls[key].value) {
          return keyParent;
        }
      }
    }
    return null;
  }

  selectAll(isAllUnselect: boolean): void {
    if (!this.isWithValidAndRAZBtn) {
      let formControlSelectedList = [];
      !isAllUnselect &&
        (formControlSelectedList = Object.values(this.form.controls)
          .map(e => Object.keys(e.value))
          .flatMap(e => Object.values(e))
          .map(e => ({ title: e, selected: true })));
      this.changeEvent.emit(formControlSelectedList);
    }
  }

  /**
   * Méthode appelée lorsqu'un parent ou un enfant est sélectionné
   */
  setNewSelectedElementOrChildElements(data: nodeTreeSelected): void {
    if (this.isLikeRadioBouton) {
      if (this.lastSelectedParent && data.parentKey !== this.lastSelectedParent) {
        this.childForms.forEach(childForm => {
          if (childForm.key === this.lastSelectedParent) {
            // désélectionne lastSelectedParent
            childForm.resetParentCheckbox(false);
          }
        });
      }
      this.lastSelectedParent = data.parentKey;
    }
    !this.isWithValidAndRAZBtn && this.valider(data);
  }

  valider(data?): void {
    this.hasSaved = true;
    this.formState = this.form.getRawValue();
    if (this.isWithValidAndRAZBtn) {
      this.form.setValue(this.formState);
      this.dropdown.close();
    }
    let selectedList = this.getSelectedFormControls();
    if (!this.isWithValidAndRAZBtn) {
      if (!this.isLikeRadioBouton) {
        selectedList = this.toggleSelectedElements(selectedList, data);
      } else {
        // mode radio
        selectedList = this.toggleSelectedElementsEnModeRadio(data);
      }
    }
    this.changeEvent.emit(selectedList);
  }

  // récupère tous les éléments sélectionnés
  private getSelectedFormControls(): { title: string; selected: boolean }[] {
    const selectedList: { title: string; selected: boolean }[] = [];
    const formGroups = Object.values(this.form.controls) as FormGroup[];
    for (const group of formGroups) {
      for (const key in group.controls) {
        if (group.controls[key].value) {
          selectedList.push({ title: key, selected: true });
        }
      }
    }
    return selectedList;
  }

  private toggleSelectedElementsEnModeRadio(data) {
    if (data.isParent) {
      return this.toggleSelectedNodeModeRadio(data);
    } else {
      return this.toggleSelectedChildModeRadio(data);
    }
  }

  // action pour le clic sur un node parent en mode radio
  private toggleSelectedNodeModeRadio(data) {
    const childElements = [];
    let selectedList: { title: string; selected: boolean }[] = [];
    this.childForms.forEach((childForm: ListeDeroulanteHierarchiseeFormComponent) => {
      // cherche la branche avec le key
      if (childForm.key === data.parentKey) {
        let isAllTrue = true;
        for (const key in childForm.form.controls) {
          childElements.push(key);
          // si element non sélectionné
          if (!childForm.form.controls[key].value) {
            isAllTrue = false;
          }
        }
        // ajoute sélection dans la liste
        if (isAllTrue) {
          selectedList = [];
        } else {
          selectedList = [...new Set(childElements.map(key => ({ title: key, selected: true })))];
        }
      }
    });
    return selectedList;
  }

  // action pour le clic sur un node enfant en mode radio
  private toggleSelectedChildModeRadio(data) {
    const selectedList: { title: string; selected: boolean }[] = [];
    this.childForms.forEach((childForm: ListeDeroulanteHierarchiseeFormComponent) => {
      // cherche la branche avec le key
      if (childForm.key === data.parentKey) {
        for (const key in childForm.form.controls) {
          // ajoute sélection dans la liste
          if (
            (key !== data.selectedElement && childForm.form.controls[key].value) ||
            (key === data.selectedElement && !childForm.form.controls[key].value)
          ) {
            selectedList.push({ title: key, selected: true });
          }
        }
      }
    });
    return selectedList;
  }

  private toggleSelectedElements(
    currentList: { title: string; selected: boolean }[],
    data: nodeTreeSelected
  ): { title: string; selected: boolean }[] {
    const input = this.getChild(data);
    // normalize
    const normalize = (str: string) =>
      str
        .replace(/\[[^]]*]/g, '') // remove all [substring]
        .replace(/\s/g, '') // remove all whitespace characters (spaces, tabs, newlines)
        .trim();
    // toggle liste
    const newList = [...currentList];
    const selectedElements = [];
    const toggle = (element: string) => {
      const norm = normalize(element);
      const index = newList.findIndex(item => normalize(item.title) === norm);
      // toggle
      if (index !== -ONE) {
        selectedElements.push(norm);
        if (!data.isParent) {
          // supprime de la liste
          newList.splice(index, ONE);
        }
      } else {
        // ajoute dans la liste
        newList.push({ title: norm, selected: true });
      }
    };

    input.forEach(toggle);

    if (data.isParent) {
      return this.toggleSelectedElementsNode(selectedElements, newList, input);
    }

    return newList;
  }

  // récupère les node enfants à partir un node
  private getChild(data: nodeTreeSelected): string[] {
    if (data.isParent) {
      const list = [data.selectedElement];
      const group = this.form.controls[data.selectedElement];
      if (group instanceof FormGroup) {
        Object.keys(group.controls).forEach(key => {
          list.push(key);
        });
      }
      return [...new Set(list)];
    }
    return [data.selectedElement];
  }

  // pour le node parent, il faut revoir les éléments non sélectionnés
  private toggleSelectedElementsNode(
    selectedElements: string[],
    newList: { title: string; selected: boolean }[],
    input: string[]
  ): { title: string; selected: boolean }[] {
    selectedElements.forEach(item => {
      const index = newList.findIndex(newItem => newItem.title === item);
      // toggle sélection de node
      if (index !== -ONE) {
        if (selectedElements.length === input.length) {
          newList.splice(index, ONE);
        }
      } else {
        newList.push({ title: item, selected: true });
      }
    });
    return newList;
  }

  /**
   * Bouton pour vider la dropdown sans la fermer
   */
  vider(): void {
    this.changeEvent.emit([]);
  }

  /**
   * Appelé lorsque la dropdown est ouverte/fermée
   */
  openChange(isOpened: boolean): void {
    // Si on ferme la dropdown et que l'utilisateur n'a pas sauvegardé
    if (isOpened && !this.hasSaved) {
      this.form.patchValue({ selectAll: this.formState }, { emitEvent: false });
      this.form.markAllAsTouched();
    } else {
      // Sinon remet la valeur du boolean à false pour la prochaine ouverture
      this.hasSaved = false;
    }
    if (isOpened) {
      // Redéplie les groupes portant une sélection, l'utilisateur ayant pu les replier
      this.childForms?.forEach(childForm => childForm.expandIfPartiallyChecked());
      // Le menu vient tout juste d'être affiché : on attend qu'il soit positionné pour mesurer les éléments
      setTimeout(() => this.scrollToFirstCheckedElement());
    }
  }

  /**
   * Positionne le scroll de la liste sur le premier élément coché afin qu'il soit
   * visible dès l'ouverture, même s'il se trouve en bas d'une longue liste.
   */
  private scrollToFirstCheckedElement(): void {
    const container = this.scrollableContent?.nativeElement;
    if (!container) {
      return;
    }
    // Une case partiellement sélectionnée (semi-checked) n'est pas :checked,
    // on ignore également les éléments non rendus (groupes repliés)
    const firstChecked = Array.from(container.querySelectorAll<HTMLInputElement>('input.form-check-input:checked')).find(
      checkbox => checkbox.getClientRects().length
    );
    if (!firstChecked) {
      return;
    }
    // On se cale sur la ligne entière (case + libellé) plutôt que sur la case seule
    const row = firstChecked.closest<HTMLElement>('.form-check') ?? firstChecked;
    const containerBounds = container.getBoundingClientRect();
    const rowBounds = row.getBoundingClientRect();
    const isAlreadyVisible = rowBounds.top >= containerBounds.top && rowBounds.bottom <= containerBounds.bottom;
    if (isAlreadyVisible) {
      return;
    }
    // Centre la ligne cochée dans la zone visible (le navigateur borne la valeur)
    container.scrollTop += rowBounds.top - containerBounds.top - (container.clientHeight - rowBounds.height) / 2;
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
    const listOfSelectedElements: string[] = this.getSelectedElements();

    if (listOfSelectedElements.length === ONE) {
      return listOfSelectedElements[ZERO];
    } else if (listOfSelectedElements.length > ONE) {
      return listOfSelectedElements.length + ' sélectionnés';
    } else {
      return this.defaultText;
    }
  }

  /**
   * Récupère la liste des éléments sélectionnés dans tout le formulaire
   */
  private getSelectedElements(): string[] {
    const selectedElements: string[] = [];
    try {
      return selectedElements.concat(
        ...Object.values(this.form.controls).map(element => {
          if (element instanceof FormGroup) {
            return Object.keys(element.controls).filter(control => element.controls[control].value);
          }
          return selectedElements;
        })
      );
    } catch (error) {
      return selectedElements;
    }
  }
}
