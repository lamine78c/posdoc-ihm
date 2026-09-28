import { Injectable } from '@angular/core';
import { FormattedValue } from '../models/tableau.models';

@Injectable({
  providedIn: 'root',
})
export class NumericalAmountService {
  /**
   * Autorise uniquement la saisie de valeur numérique et d'une virgule
   */
  allowNumericalAmount(event): boolean {
    const hasComma = event.target.value.includes(',');
    const charCode = event.which ? event.which : event.keyCode;
    // Only Numbers 0-9, 44 => virgule
    if ((charCode < 48 || charCode > 57) && (charCode !== 44 || hasComma)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  /**
   * Formate le nombre à la saisie
   */
  formatNumericalAmount(value, input): FormattedValue {
    if (!value) {
      return value;
    }

    // Récupère la position actuelle du curseur
    const pos = input?.selectionStart;
    // Récupère la longueur de la valeur actuelle
    const length = value.length;
    // Supprime tous les espaces dans la valeur et remplace les . par des ,
    const tmpValue = value.toString().split(' ').join('').replace('.', ',');

    // Cas où le nombre contient une ,
    if (tmpValue.includes(',')) {
      const parts = tmpValue.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      value = parts.join(',');
    } else {
      // Cas sans ,
      value = tmpValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // Récupère la longueur de la nouvelle valeur
    const newLength = value.length;

    return { value: value, cursorPos: pos + newLength - length };
  }

  /**
   * Supprime les espaces et remplace les , par des . pour avoir un nombre
   */
  cleanFormatToSave(value: string): string {
    return value.replace(/\s/g, '').replace(',', '.');
  }
}
