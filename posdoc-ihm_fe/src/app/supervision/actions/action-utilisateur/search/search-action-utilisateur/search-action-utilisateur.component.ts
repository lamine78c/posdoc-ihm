import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiAdelaideDateService } from '@app/services/api-adelaide-date.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE, SIX } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { DataService } from '@app/shared/utils/data.service';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, Subscription, take } from 'rxjs';
import { SearchActionUtilisateurByQuery } from '../../model/search-action-utilisateur-by-query';
import { ApiAdelaideActionUtilisateurService } from '../../service/api-adelaide-action-utilisateur.service';

@Component({
  selector: 'app-search-action-utilisateur',
  templateUrl: './search-action-utilisateur.component.html',
  styleUrl: './search-action-utilisateur.component.scss',
  standalone: false,
})
@AutoUnsubscribe
export class SearchActionUtilisateurComponent {
  fb = inject(FormBuilder);
  dataService = inject(DataService);
  calendar = inject(NgbCalendar);

  today: NgbDateStruct = this.calendar.getToday();
  fromMaxDate = this.today;
  toMaxDate = this.today;

  form: FormGroup;
  formFromDate: FormControl;
  formToDate: FormControl;
  formEntity: FormControl;
  formAction: FormControl;
  formUser: FormControl;
  formResult: FormControl;
  optionsUser = [];
  optionsAction = [];
  optionsEntity = [];
  optionsResult = ['OK', 'KO'];
  selectedResult = null;

  apiAdelaideService = inject(ApiAdelaideActionUtilisateurService);
  apiAdelaideDateService = inject(ApiAdelaideDateService);

  @Output() applyEvent = new EventEmitter<any>();
  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.getAllDistinctUser();
    this.getAllDistinctEntity();
    this.getAllDistinctAction();
    this.onChangeDateDeb();
    this.onChangeResult();
  }

  onChangeDateDeb() {
    this.subscriptions.push(
      this.formFromDate.valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE)).subscribe((value: NgbDate) => {
        if (value) {
          const dateAfter6Months = this.calendar.getNext(value, 'm', SIX);
          const vToDate = this.formToDate.value;
          this.toMaxDate = dateAfter6Months.after(this.today) ? this.today : dateAfter6Months;
          if (vToDate && (vToDate.after(this.toMaxDate) || vToDate.before(value))) {
            this.formToDate.setValue('');
          }
        }
      })
    );
  }

  onChangeResult() {
    this.subscriptions.push(
      this.formResult.valueChanges.subscribe(value => {
        if (value === 'KO') {
          this.selectedResult = false;
        } else if (value === 'OK') {
          this.selectedResult = true;
        } else {
          this.selectedResult = null;
        }
      })
    );
  }

  getAllDistinctAction() {
    this.subscriptions.push(
      this.apiAdelaideService.getDistinctAction().pipe(take(1)).subscribe(data => {
        this.optionsAction = data.data.findDistinctActionUtilog;
      })
    );
  }

  getAllDistinctUser() {
    this.subscriptions.push(
      this.apiAdelaideService.getDistinctUser().pipe(take(1)).subscribe(data => {
        this.optionsUser = data.data.findDistinctUserUtilog;
      })
    );
  }

  getAllDistinctEntity() {
    this.subscriptions.push(
      this.apiAdelaideService.getDistinctEntity().pipe(take(1)).subscribe(data => {
        this.optionsEntity = data.data.findDistinctFormIdUtilog;
      })
    );
  }

  initForm() {
    this.form = this.fb.group({
      fromDate: [this.today, CustomValidators.required()],
      toDate: [this.today, CustomValidators.required()],
      user: ['', null],
      action: ['', null],
      entity: ['', null],
      result: ['', null],
    });
    this.formFromDate = this.form.get('fromDate') as FormControl;
    this.formToDate = this.form.get('toDate') as FormControl;
    this.formAction = this.form.get('action') as FormControl;
    this.formEntity = this.form.get('entity') as FormControl;
    this.formUser = this.form.get('user') as FormControl;
    this.formResult = this.form.get('result') as FormControl;
  }

  isFormValid() {
    return this.form.valid;
  }

  getDataToTransfer(): SearchActionUtilisateurByQuery {
    return {
      dtdeb: this.apiAdelaideDateService.transformDateToString(this.formFromDate.value),
      dtfin: this.apiAdelaideDateService.transformDateToString(this.formToDate.value, true),
      user: this.formUser.value ? this.formUser.value : null,
      action: this.formAction.value ? this.formAction.value : null,
      form: this.formEntity.value ? this.formEntity.value : null,
      result: this.selectedResult,
    };
  }

  lister() {
    this.applyEvent.emit(this.getDataToTransfer());
  }
}
