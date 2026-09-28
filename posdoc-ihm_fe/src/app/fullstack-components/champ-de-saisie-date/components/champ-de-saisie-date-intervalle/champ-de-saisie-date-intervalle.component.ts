import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ChampDeSaisieDateService } from '../../services/champ-de-saisie-date.service';

@Component({
  selector: 'app-champ-de-saisie-date-intervalle',
  templateUrl: './champ-de-saisie-date-intervalle.component.html',
  standalone: false,
})
export class ChampDeSaisieDateIntervalleComponent implements OnInit {
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Control du formulaire réactif pour la valeur "du"
   */
  @Input() formFrom: FormControl;
  /**
   * Control du formulaire réactif pour la valeur "au"
   */
  @Input() formTo: FormControl;
  /**
   * Date maximale pour le form from
   */
  @Input() fromMaxDate: NgbDateStruct;
  /**
   * Date minimale pour le form from
   */
  @Input() fromMinDate: NgbDateStruct;
  /**
   * Read only pour le form from
   */
  @Input() fromReadOnly: boolean;
  /**
   * isError pour le form from
   */
  @Input() fromIsError: boolean;
  /**
   * Date maximale pour le form to
   */
  @Input() toMaxDate: NgbDateStruct;
  /**
   * Date minimale pour le form to
   */
  @Input() toMinDate: NgbDateStruct;
  /**
   * Read only pour le form to
   */
  @Input() toReadOnly: boolean;
  /**
   * isError pour le form to
   */
  @Input() toIsError: boolean;

  initialToMinDate: NgbDateStruct;
  initialFromMaxDate: NgbDateStruct;

  form: FormGroup;
  isToDateIsBiggerThanFromDate: boolean;

  private readonly calendar = inject(NgbCalendar);

  constructor(private champDeSaisieDateService: ChampDeSaisieDateService) {}

  ngOnInit(): void {
    this.checkIfToDateIsBiggerThanFromDate();

    // Sauvegarde l'état des valeurs initiales, si elles existes, pas de bornes automatiques
    this.initialToMinDate = this.toMinDate;
    this.initialFromMaxDate = this.fromMaxDate;
    this.setCalendarsLimits();
  }

  fromDateSelected() {
    this.checkIfToDateIsBiggerThanFromDate();
    this.setCalendarsLimits();
  }

  toDateSelected() {
    this.checkIfToDateIsBiggerThanFromDate();
    this.setCalendarsLimits();
  }

  checkIfToDateIsBiggerThanFromDate(): void {
    this.isToDateIsBiggerThanFromDate = this.champDeSaisieDateService.checkIfToDateIsBiggerThanFromDate(this.formFrom.value, this.formTo.value);
  }

  /**
   * Ajout des bornes limites aux calendriers à partir de la saisie utilisateur
   * - La date "to" ne peut pas être antérieur à la date "from"
   * - La date "from" ne peut pas être supérieur à la date "to"
   */
  setCalendarsLimits(): void {
    if (!this.initialToMinDate) {
      this.toMinDate = this.formFrom.value;
    }

    if (!this.initialFromMaxDate) {
      this.fromMaxDate = this.formTo.value;
    }
  }

  isTodayDisplayedForToField() {
    const today = this.calendar.getToday();
    return today.before(this.toMaxDate) || today.equals(this.toMaxDate);
  }

  isTodayDisplayedForFromField() {
    const today = this.calendar.getToday();
    return today.after(this.fromMaxDate) || today.equals(this.fromMaxDate);
  }
}
