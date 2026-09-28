import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { ValueFormatterParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauFormattersComparatorsService {
  constructor(private datePipe: DatePipe) {}

  /**
   * Si une valeur existe, retourne cette valeur avec deux digits
   * Sinon retourne un -
   */
  customValueFormatter(data, minimumFractionDigits: number, level?: number): string {
    // Affichage en fonction d'un niveau d'imbrication (tableau dépliable)
    if (!!level && data.node.level < level) {
      return '';
    }

    if (data.value === null || data.value === undefined) {
      return '-';
    }

    const format = new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: minimumFractionDigits,
    });
    return format.format(Number(data.value));
  }

  /**
   * Si la valeur existe, retourne une date en string au format dd/MM/yyyy
   * Sinon retourne un -
   */
  customDateFormatter(data, level?: number): string {
    // Affichage en fonction d'un niveau d'imbrication (tableau dépliable)
    if (!!level && data.node.level < level) {
      return ' ';
    }

    if (data.value === null || data.value === undefined) {
      return '-';
    }

    return this.datePipe.transform(data.value, 'dd/MM/yyyy');
  }

  /**
   * Compare les dates pour les trier correctement
   */
  compareDates(filterLocalDateAtMidnight, cellValue): number {
    const date = new Date(cellValue);
    date.setHours(0, 0, 0, 0);

    if (filterLocalDateAtMidnight.getTime() === date.getTime()) {
      return 0;
    }
    if (date < filterLocalDateAtMidnight) {
      return -1;
    }
    if (date > filterLocalDateAtMidnight) {
      return 1;
    }
  }

  /**
   * Compare des mois suivant leur écriture littérale
   */
  compareLiteralDates(monthA: string, monthB: string): number {
    const monthsWeight = new Map([
      ['janvier', 1],
      ['février', 2],
      ['mars', 3],
      ['avril', 4],
      ['mai', 5],
      ['juin', 6],
      ['juillet', 7],
      ['août', 8],
      ['septembre', 9],
      ['octobre', 10],
      ['novembre', 11],
      ['décembre', 12],
    ]);

    // Récupère le poids du mois
    const monthAWeight = monthsWeight.get(monthA.toLocaleLowerCase());
    const monthBWeight = monthsWeight.get(monthB.toLocaleLowerCase());

    if (monthAWeight === monthBWeight) {
      return 0;
    }
    if (monthAWeight < monthBWeight) {
      return -1;
    }
    if (monthAWeight > monthBWeight) {
      return 1;
    }
  }

  /**
   * Pour les tableaux dépliables
   * Affiche la valeur dans les colonnes maitres en fonction d'un niveau et pour le bon champs
   */
  displayOnlyForLevel(data: ValueFormatterParams, level: number): string {
    if (data.node.level === level && data.colDef.field === data.node.field) {
      if (data.colDef.field.includes('date')) {
        return this.customDateFormatter(data, level);
      }

      return data.value;
    }

    return ' ';
  }
}
