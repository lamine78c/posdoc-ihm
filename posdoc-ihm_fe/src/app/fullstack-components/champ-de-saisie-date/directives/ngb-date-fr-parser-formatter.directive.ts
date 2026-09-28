import { Directive } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[appNgbDateFrParserFormatter]',
  standalone: false,
})
export class NgbDateFrParserFormatterDirective extends NgbDateParserFormatter {
  isNumber(value: any): boolean {
    return !isNaN(this.toInteger(value));
  }

  toInteger(value: any): number {
    return parseInt(`${value}`, 10);
  }

  /**
   * Parse la valeur en entrée pour retourner un objet NgbDateStruct
   */
  parse(value: string): NgbDateStruct {
    // Vérifie qu'une valeur est passée en entré
    if (value) {
      // Supprime les espaces et découpe la date en fonction des /
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && this.isNumber(dateParts[0])) {
        // Si il n'y a qu'une valeur numérique dans la string découpée, alors considère qu'il s'agit d'une année
        return { year: this.toInteger(dateParts[0]), month: null, day: null };
      } else if (dateParts.length === 2 && this.isNumber(dateParts[0]) && this.isNumber(dateParts[1])) {
        // Si il n'y a que deux valeurs numériques dans la string découpée, alors considère qu'il s'agit d'une année et d'un mois
        return { year: this.toInteger(dateParts[1]), month: this.toInteger(dateParts[0]), day: null };
      } else if (dateParts.length === 3 && this.isNumber(dateParts[0]) && this.isNumber(dateParts[1]) && this.isNumber(dateParts[2])) {
        // Sinon, si il y a bien 3 valeurs numériques, retourne une date complète
        return { year: this.toInteger(dateParts[2]), month: this.toInteger(dateParts[1]), day: this.toInteger(dateParts[0]) };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    if (date) {
      return '' + this.adaptDateSegment(date.day) + '/' + this.adaptDateSegment(date.month) + '/' + date.year;
    }
    return '';
  }

  adaptDateSegment(value) {
    return value < 10 ? '0' + value : value;
  }
}
