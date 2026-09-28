import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ONE, TIRET, TWO } from './Constants';

export class DateUtil {
  static getNgbDateFromString(dateString: string): NgbDate {
    if (dateString) {
      const d = new Date(dateString);
      return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }
  }

  static getCurentDate(): { year: number; month: number; day: number } {
    const currentDate = new Date();
    // Les mois sont indexés à 0, nous ajoutons donc 1.
    const MONTH_OFFSET = 1;
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + MONTH_OFFSET,
      day: currentDate.getDate(),
    };
  }

  static formatDateToDDMMYYYYHHMMSS(dateString: string): string {
    if (dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
  }

  static formatDateToStringDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(TWO, '0');
    const month = String(date.getMonth() + ONE).padStart(TWO, '0');
    const year = date.getFullYear();
    return day + TIRET + month + TIRET + year;
  }

  static formatDateToDDMMYYYY(dateString: string): string {
    if (dateString) {
      return this.formatDateToDDMMYYYYHHMMSS(dateString).split(' ')[0];
    }
  }

  static comparePeriodes(date1: Date, date2: Date): boolean {
    const dayDiff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    return dayDiff <= 30;
  }

  static getDateFromPeriode(periode: string): Date {
    const year = parseInt('20' + periode.substring(0, 2));
    const month = parseInt(periode.substring(2, 4));
    const day = parseInt(periode.substring(4, 6));
    return new Date(year, month - 1, day);
  }

  static formatDate(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  static transformNgbDateToString(date: NgbDateStruct) {
    return date ? date.year + '-' + ('0' + date.month).slice(-TWO) + '-' + ('0' + date.day).slice(-TWO) : null;
  }
}
