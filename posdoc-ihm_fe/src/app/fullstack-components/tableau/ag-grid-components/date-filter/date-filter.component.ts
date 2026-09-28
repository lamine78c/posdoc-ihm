import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IFloatingFilterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
  standalone: false,
})
export class DateFilterComponent implements OnDestroy, IFloatingFilterAngularComp {
  private date: Date;
  private params: IFloatingFilterParams;
  form: FormGroup;
  subscription: Subscription;

  constructor(private fb: FormBuilder) {}

  agInit(params: IFloatingFilterParams): void {
    this.params = params;

    // Récupère la date initiale si elle existe
    let date: Date;
    if (!!this.params.currentParentModel && this.params.currentParentModel()?.dateFrom) {
      date = new Date(this.params.currentParentModel().dateFrom);
    }
    const initialeValue = date ? { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } : null;

    this.form = this.fb.group({
      currentDate: [initialeValue, null],
    });

    this.subscription = this.form.valueChanges.subscribe(value => {
      const currentDate: Date = value.currentDate ? new Date(value.currentDate.year, value.currentDate.month - 1, value.currentDate.day) : null;
      if (!currentDate) {
        // Vide le filtre si il n'y a pas de valeur
        this.params.parentFilterInstance(instance => {
          instance.onFloatingFilterChanged(null, null);
        });
        return;
      }

      // Met à jour le filtre
      this.params.parentFilterInstance(instance => {
        instance.onFloatingFilterChanged('contains', currentDate);
      });
    });
  }

  getDate(): Date {
    return this.date;
  }

  setDate(date: Date): void {
    this.date = date;
  }

  /**
   * Met à jour le formulaire avec la nouvelle valeur
   */
  onParentModelChanged(parentModel): void {
    let date: Date;
    if (parentModel?.dateFrom) {
      date = new Date(parentModel.dateFrom);
    }

    const ngbDate = date ? { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } : null;
    this.form.get('currentDate').setValue(ngbDate);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
