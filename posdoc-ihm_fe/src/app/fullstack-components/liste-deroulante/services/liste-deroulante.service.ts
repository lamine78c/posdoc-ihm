import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ZERO } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class ListeDeroulanteService {
  /**
   * Met à jour les valeurs lorsque 'Tout sélectionner / Tout désélectionner' est coché
   */
  selectAll(formSelectAll: FormGroup, form: FormGroup, hasSubLevel: boolean): void {
    const value: boolean = formSelectAll.value.selectAll;

    // Dans le cas où il n'y a pas plusieurs niveaux dans le formulaire
    if (!hasSubLevel) {
      this.updateForm(form, value);
    } else {
      // cas où il y a plusieurs niveaux dans le formulaire
      Object.keys(form.value).forEach((key: string) => {
        this.updateForm(form.get(key) as FormGroup, value);
      });
    }
  }

  /**
   * Met à jour le formulaire avec la valeur passée en paramètre
   */
  private updateForm(form: FormGroup, value: boolean): void {
    Object.keys(form.value).forEach((key: string) => {
      // Uniquement si la valeur n'est pas déjà à jour
      if ((value && !form.get(key).value) || (!value && form.get(key).value)) {
        form.get(key).setValue(value);
      }
    });
  }

  /**
   * Met à jour la checkbox selectAll lorsque des valeurs sont sélectionnées
   */
  shouldSelectAll(formSelectAll: FormGroup, form: FormGroup): void {
    const isSelectAll = this.getEtatIsSelectAll(form);
    formSelectAll.patchValue({ selectAll: isSelectAll }, { emitEvent: false, onlySelf: true });
  }

  getEtatIsSelectAll(form: FormGroup) {
    let isSelectAll = false;
    let countValueTrue = ZERO;
    const values = Object.values(form.value);
    values.forEach((val: boolean) => val === true && countValueTrue++);
    if (values.length === countValueTrue) {
      isSelectAll = true; // tous les éléments sont true
    } else if (countValueTrue > ZERO) {
      isSelectAll = null; // il y a des true et des false
    }
    return isSelectAll;
  }

  /**
   * Met à jour le texte en fonction des valeurs actuelles du formulaire
   * Et met à jour la checkbox selectAll
   */
  updateContentToDisplay(formSelectAll: FormGroup, form: FormGroup, hasSubLevel: boolean, hasBlankOption: boolean = true): string {
    // Nombre d'éléments sélectionnables
    let maxElements = 0;
    let selected: string[] = [];

    // Dans le cas où il n'y a pas plusieurs niveaux dans le formulaire
    if (!hasSubLevel) {
      // Éléments sélectionnés
      selected = Object.keys(form.value).filter(key => {
        // Compte les éléments
        maxElements++;
        return form.value[key] === true;
      });
    } else {
      // cas où il y a plusieurs niveaux dans le formulaire

      // Itère sur le premier niveau
      Object.keys(form.value).forEach(key => {
        let selectedElements: string[] = [];

        // Itère sur le deuxième niveau et récupère les éléments
        selectedElements = selectedElements.concat(
          Object.keys(form.value[key]).filter(key2 => {
            // Compte les éléments
            maxElements++;
            return form.value[key][key2] === true;
          })
        );

        // Éléments sélectionnés
        selected = selected.concat(selectedElements);
      });
    }

    // Mise à jour de la checkbox selectAll
    if (maxElements > 0 && selected.length === maxElements) {
      formSelectAll.patchValue({ selectAll: true }, { emitEvent: false, onlySelf: true });
    } else {
      formSelectAll.patchValue({ selectAll: false }, { emitEvent: false, onlySelf: true });
    }

    // Renvoie le texte à afficher
    if (selected.length === 1) {
      return selected[0];
    } else if (selected.length > 1) {
      return selected.length + ' sélectionnés';
    } else if (selected.length === 0) {
      return hasBlankOption ? '%' : '';
    } else {
      return hasBlankOption ? '%' : '';
    }
  }
}
