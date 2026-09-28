import { Injectable } from '@angular/core';
import { NextActiveTab } from '../models/onglets.models';

@Injectable({
  providedIn: 'root',
})
export class OngletsService {
  /**
   * Retourne le prochain onglet actif après une suppression
   */
  getNextActiveTab(active: number, index: number, nextActive: NextActiveTab, ongletsLength: number): NextActiveTab {
    let toReturn;

    if (active >= index) {
      const isLast = active === ongletsLength;
      // Dans le cas où il y aurai plusieurs suppression consécutive
      if (nextActive) {
        toReturn = { value: nextActive.value - 1, isLast: isLast };
      } else {
        toReturn = { value: active - 1, isLast: isLast };
      }
    }

    // Dans le cas où le premier onglet est supprimé
    if (toReturn?.value === -1) {
      toReturn.value = 0;
    }

    return toReturn;
  }
}
