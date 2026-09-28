import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { FIFTEEN, FORTY, MINUS_ONE, NINETEEN, SEVEN } from '@app/shared/utils/Constants';
import { DataService } from '@app/shared/utils/data.service';
import { DateUtil } from '@app/shared/utils/DateUtil';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { isTransferCompteToSearch, SearchPliByQuery, TransferCompteToSearch } from '../../model/search-pli';

@Component({
  selector: 'app-search-suivi-au-pli',
  templateUrl: './search-suivi-au-pli.component.html',
  styleUrls: ['./search-suivi-au-pli.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchSuiviAuPliComponent implements OnInit {
  fb = inject(FormBuilder);
  dataService = inject(DataService);
  calendar = inject(NgbCalendar);

  fromDefaultDate: NgbDateStruct = this.calendar.getToday();
  toDefaultDate: NgbDateStruct = this.calendar.getToday();
  toMaxDate: NgbDateStruct = this.calendar.getNext(this.calendar.getToday(), 'd', SEVEN);
  fromMinDate: NgbDateStruct = this.calendar.getNext(this.calendar.getToday(), 'm', MINUS_ONE);
  form: FormGroup;
  formFromDate: FormControl;
  formToDate: FormControl;
  formSmartData: FormControl;
  formCompte: FormControl;
  formAdresse: FormControl;
  formIsDateEmpty: FormControl;
  formIsCnav: FormControl;
  @Output() applyEvent = new EventEmitter<any>();
  subscriptions: Subscription[] = [];
  fromDateSelected;
  toDateSelected;
  lengthSmartData = FIFTEEN;
  lengthCompte: number;
  lengthCompteNonCnav = NINETEEN;
  lengthCompteCnav = FORTY;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.onChangeFormIsDateEmpty();

    // Observateur se lance lorsqu'il a reçu une nouvelle valeur
    this.subscriptions.push(
      this.dataService.getTransferedData().subscribe(
        data =>
          // mettre à jour le champ compte
          isTransferCompteToSearch(data) && this.searchWithCompteTransfered(data)
      )
    );
  }

  searchWithCompteTransfered(data: TransferCompteToSearch) {
    data.isCompteCnav ? this.formIsCnav.patchValue(true) : this.formIsCnav.patchValue(false);
    this.formCompte.patchValue(data.compte);
    this.formSmartData.patchValue('');
    this.formAdresse.patchValue('');
    this.formIsDateEmpty.patchValue(true);
    this.lister();
  }

  onChangeFormIsDateEmpty() {
    this.subscriptions.push(
      this.formIsDateEmpty.valueChanges.subscribe(value => {
        if (value) {
          this.formFromDate.disable();
          this.formToDate.disable();
        } else {
          this.formFromDate.enable();
          this.formToDate.enable();
        }
      })
    );
  }

  initForm() {
    this.form = this.fb.group({
      fromDate: [this.fromDefaultDate],
      toDate: [this.toDefaultDate],
      smartData: ['', null],
      compte: ['', null],
      adresse: ['', null],
      isDateEmpty: [false],
      isCnav: [false],
    });
    this.formFromDate = this.form.get('fromDate') as FormControl;
    this.formToDate = this.form.get('toDate') as FormControl;
    this.formSmartData = this.form.get('smartData') as FormControl;
    this.formCompte = this.form.get('compte') as FormControl;
    this.formAdresse = this.form.get('adresse') as FormControl;
    this.formIsDateEmpty = this.form.get('isDateEmpty') as FormControl;
    this.formIsCnav = this.form.get('isCnav') as FormControl;
    this.getMaxLengthCompte();
    this.lengthCompte = this.lengthCompteNonCnav;
  }

  getMaxLengthCompte() {
    this.subscriptions.push(
      this.formIsCnav.valueChanges.subscribe(value => {
        if (value) {
          this.lengthCompte = this.lengthCompteCnav;
        } else {
          this.lengthCompte = this.lengthCompteNonCnav;
        }
        this.formCompte.value.length > this.lengthCompte && this.formCompte.patchValue('');
      })
    );
  }

  isDateEmpty() {
    return this.formIsDateEmpty.value;
  }

  isFormIsDateEmptyValid() {
    return this.formSmartData?.value.length === this.lengthSmartData || this.formCompte?.value.length === this.lengthCompte;
  }

  isFormIsDateRequiredValid() {
    return (this.formSmartData.value || this.formCompte.value || this.formAdresse.value) && this.formFromDate.value && this.formToDate.value;
  }

  isFormValid() {
    return this.form.valid && this.isDateEmpty() ? this.isFormIsDateEmptyValid() : this.isFormIsDateRequiredValid();
  }

  lister() {
    this.applyEvent.emit(this.isDateEmpty() ? this.getSearchPliIsDateEmptyByQuery() : this.getSearchPliIsDateRequiredByQuery());
  }

  getSearchPliIsDateRequiredByQuery(): SearchPliByQuery {
    return {
      dtdeb: DateUtil.transformNgbDateToString(this.formFromDate.value),
      dtfin: DateUtil.transformNgbDateToString(this.formToDate.value),
      numpli: this.formSmartData.value ?? null,
      idtpli: this.formCompte.value ?? null,
      adress: this.formAdresse.value ?? null,
      isCnav: this.formIsCnav.value,
    };
  }

  getSearchPliIsDateEmptyByQuery(): SearchPliByQuery {
    return {
      dtdeb: null,
      dtfin: null,
      numpli: this.formSmartData.value ?? null,
      idtpli: this.formCompte.value ?? null,
      adress: this.formAdresse.value ?? null,
      isCnav: this.formIsCnav.value,
    };
  }

  getSmartDataPlaceholder(): string {
    return this.isDateEmpty() ? `${this.lengthSmartData} caractères attendus` : ""
  }

  getComptePlaceholder(): string {
    if (this.isDateEmpty()) {
      return this.formIsCnav.value ? `${this.lengthCompteCnav} caractères attendus (compte CNAV)` : `${this.lengthCompteNonCnav} caractères attendus (compte non CNAV)`;
    } else {
      return "";
    }
  }

  getSearchButtonInformation(): string {
    if (this.isDateEmpty()) {
      return 'Le champ "compte" ou le champ "smartData" doit être renseigné pour lancer la recherche';
    } else {
      return "";
    }
  }
}
