import { Injectable } from '@angular/core';
import { Arborescence } from '../models/aborescence.models';

@Injectable({
  providedIn: 'root',
})
export class ArborescenceService {
  /**
   * Retourne une valeur en fonction du tree view pour la mise à jour d'un parent
   * Vérifie s'il faut envoyer true, false, ou null en fonction du status après une mise à jour
   */
  getValueForm(tree: Arborescence[]): boolean {
    const anyFalse: Arborescence[] = [];
    const anyTrue: Arborescence[] = [];

    tree.forEach((childrenTree: Arborescence) => {
      // La valeur pouvant être null, on vérifie bien qu'il s'agit d'un false
      if (childrenTree.value === false) {
        anyFalse.push(childrenTree);
      }

      if (childrenTree.value === true) {
        anyTrue.push(childrenTree);
      }
    });

    // Définit à true par défaut
    let value = true;
    // Si toutes les valeurs sont à true
    if (anyTrue.length === tree.length) {
      value = true;
    } else if (anyFalse.length === tree.length) {
      // Si toutes les valeurs sont à false
      value = false;
    }

    return value;
  }
}
