import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiAdelaideSuiviMassificationService } from '@app/services/api-adelaide-suivi-massification.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subscription, take } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-massification-search',
  templateUrl: './massification-search.component.html',
  styleUrls: ['./massification-search.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class MassificationSearchComponent implements OnInit {
  // Subscriptions
  serviceCallSubscription: Subscription;
  envChangeSubscription: Subscription;
  siteChangeSubscription: Subscription;
  periodeDebutChangeSubscription: Subscription;
  periodeFinChangeSubscription: Subscription;

  form: FormGroup;

  optionsEnv = [];
  optionsPeriode = [];
  optionsPeriodeDebut = [];
  optionsPeriodeFin = [];

  searchData = [];
  envOrgSiteMassification;

  @Output() applySearchEvent = new EventEmitter<any>();

  formName = getFormName();
  indexForm = getFormIndex();

  indexFormPeriodeDebut;

  formEnv: FormControl;
  formPeriodeDebut: FormGroup;

  constructor(
    private apiService: ApiAdelaideSuiviMassificationService,
    private fb: FormBuilder,
    private sessionDataSearchService: SessionDataSearchService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getFiltreMassification();
    this.onEnvironnementChange();
    this.onSiteChange();
    this.onPeriodeDebutChange();
    this.onPeriodeFinChange();
  }

  private initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      site: this.fb.group({}),
      [this.formName.PERIODE]: ['', CustomValidators.required()],
      periodeFin: [''],
    });

    this.indexFormPeriodeDebut = this.indexForm.PERIODE_TB;
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formPeriodeDebut = this.form.get(this.formName.PERIODE) as FormGroup;
  }

  private onEnvironnementChange(): void {
    this.envChangeSubscription = this.formEnv.valueChanges.subscribe(() => {
      this.initFormSite();
    });
  }

  private onSiteChange(): void {
    this.siteChangeSubscription = this.form
      .get('site')
      .valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE))
      .subscribe(() => {
        const periodeFinForm = this.form.get('periodeFin') as FormGroup;
        this.updatePeriodeOptions();
        this.updatePeriodeDebutOptions(periodeFinForm.value, true);
      });
  }

  private onPeriodeDebutChange(): void {
    this.periodeDebutChangeSubscription = this.formPeriodeDebut.valueChanges.subscribe(value => {
      this.form.get('periodeFin').setErrors(null);
      this.updatePeriodeFinOptions(value);
    });
  }

  private onPeriodeFinChange(): void {
    this.periodeFinChangeSubscription = this.form.get('periodeFin').valueChanges.subscribe(value => {
      this.form.get('periodeFin').setErrors(null);
      this.updatePeriodeDebutOptions(value, false);
    });
  }

  private updatePeriodeOptions(): void {
    const selectedEnv = this.formEnv.value;
    const selectedSites = (this.form.get('site') as FormGroup).value;
    const selectedSitesList = Object.keys(selectedSites).filter(key => selectedSites[key]);
    const nbrSelectedSites = selectedSitesList.length;

    this.optionsPeriode = [
      ...new Set(
        this.searchData
          .filter(
            (e, index, arr) =>
              (selectedEnv === '' || e.masenv === selectedEnv) &&
              (nbrSelectedSites === 0 || e.codsit.split(',').filter(site => selectedSitesList.includes(site)).length > 0) &&
              arr.findIndex(t => t.masper === e.masper && (nbrSelectedSites !== 1 || t.codsit === e.codsit)) === index
          )
          .map((e: any) => ({
            value: e.masper,
            columns: [
              { label: 'Période', value: e.masper },
              { label: 'Statut', value: nbrSelectedSites !== 1 ? '' : e.appsta },
              { label: 'Debuté', value: nbrSelectedSites === 1 && e.dappld ? SharedUtil.formatDateToDDMMYYYYHHMMSS(e.dappld.toString()) : '' },
              { label: 'Terminé', value: nbrSelectedSites === 1 && e.dapplt ? SharedUtil.formatDateToDDMMYYYYHHMMSS(e.dapplt.toString()) : '' },
            ],
          }))
          .sort((a, b) => b.value.localeCompare(a.value))
      ),
    ];
  }

  private updatePeriodeDebutOptions(periodeFinValue: string, emitEvent: boolean): void {
    const valueDefault = '';
    this.optionsPeriodeDebut = [
      {
        value: valueDefault,
        columns: [
          { label: 'Période', value: '' },
          { label: 'Statut', value: '' },
          { label: 'Debuté', value: '' },
          { label: 'Terminé', value: '' },
        ],
      },
      ...this.optionsPeriode.filter(
        option =>
          periodeFinValue === '' ||
          (option.value.localeCompare(periodeFinValue) <= 0 &&
            SharedUtil.comparePeriodes(SharedUtil.getDateFromPeriode(periodeFinValue), SharedUtil.getDateFromPeriode(option.value)))
      ),
    ];
    const periodeDebut = this.formPeriodeDebut.value;
    !this.optionsPeriodeDebut.find(opt => opt.value === periodeDebut) && this.formPeriodeDebut.reset(valueDefault, { emitEvent: false });
    this.formPeriodeDebut.updateValueAndValidity({ emitEvent: emitEvent });
  }

  private updatePeriodeFinOptions(periodeDebutValue: string): void {
    const valueDefault = '';
    this.optionsPeriodeFin = [
      {
        value: valueDefault,
        columns: [
          { label: 'Période', value: '' },
          { label: 'Statut', value: '' },
          { label: 'Debuté', value: '' },
          { label: 'Terminé', value: '' },
        ],
      },
      ...this.optionsPeriode.filter(
        option =>
          periodeDebutValue === '' ||
          (option.value.localeCompare(periodeDebutValue) >= 0 &&
            SharedUtil.comparePeriodes(SharedUtil.getDateFromPeriode(option.value), SharedUtil.getDateFromPeriode(periodeDebutValue)))
      ),
    ];
    const periodeFin = this.form.get('periodeFin').value;
    !this.optionsPeriodeFin.find(opt => opt.value === periodeFin) && this.form.get('periodeFin').reset(valueDefault, { emitEvent: false });
  }

  getOptionsEnv() {
    this.optionsEnv = [...new Set(this.envOrgSiteMassification.map(e => e.masenv))];
  }

  initFormSite() {
    const siteForm = this.form.get('site') as FormGroup;
    Object.keys(siteForm.controls).forEach(key => siteForm.removeControl(key));
    const optionsSites = this.envOrgSiteMassification.map(e => e.codsit);
    optionsSites.forEach(codsit => siteForm.addControl(codsit, new FormControl(false, null)));
  }

  getOptionsPeriode(searchData) {
    this.optionsPeriode = [
      {
        value: '',
        columns: [
          { label: 'Période', value: '' },
          { label: 'Statut', value: '' },
          { label: 'Debuté', value: '' },
          { label: 'Terminé', value: '' },
        ],
      },
      ...new Set(
        searchData
          .map((e: any) => ({
            value: e.masper,
            columns: [
              { label: 'Période', value: e.masper },
              { label: 'Statut', value: '' },
              { label: 'Debuté', value: '' },
              { label: 'Terminé', value: '' },
            ],
          }))
          .filter((e, index, arr) => arr.findIndex(t => e.value === t.value) === index)
          .sort((a, b) => b.value.localeCompare(a.value))
      ),
    ];
    this.optionsPeriodeDebut = this.optionsPeriode;
    this.optionsPeriodeFin = this.optionsPeriode;
  }

  getFiltreMassification() {
    this.serviceCallSubscription = this.apiService.getFiltreMassification().pipe(take(1)).subscribe(result => {
      this.searchData = (result as any).data.getDistinctFiltreMassification;
      this.envOrgSiteMassification = Array.from(
        new Set(this.searchData.map(e => ({ masenv: e.masenv, masorg: e.masorg, codsit: e.codsit })).map(a => JSON.stringify(a)))
      ).map(e => JSON.parse(e));
      // initialiser les options de la recherche
      this.getOptionsEnv();
      this.initFormSite();
      this.getOptionsPeriode(this.searchData);
    });
  }

  isFormValid(): boolean {
    if (!this.form.valid) {
      return false;
    }
    const periodeFin = this.form.get('periodeFin').value;
    const periodeDebut = this.formPeriodeDebut.value;
    if (periodeFin === '' && periodeDebut !== '') {
      return this.isValidFifteenDaysLimit(periodeDebut);
    }
    return true;
  }

  private isValidFifteenDaysLimit(periodeDebut: string): boolean {
    const dateDebut = SharedUtil.getDateFromPeriode(periodeDebut);
    const today = new Date();
    const diffEnJours = Math.floor((today.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
    return diffEnJours <= 15;
  }

  valider() {
    const periodeFin = this.form.get('periodeFin').value;
    const periodeDebut = this.formPeriodeDebut.value;

    if (periodeFin === '' && periodeDebut !== '' && !this.isValidFifteenDaysLimit(periodeDebut)) {
      this.form.get('periodeFin').setErrors({ message: 'La période de fin doit être renseignée si la période de début est plus ancienne de 15 jours.' });
      return;
    }

    this.form.get('periodeFin').setErrors(null);
    const data = this.form.getRawValue();
    this.sessionDataSearchService.updateDataSearchToSession(data);
    this.applySearchEvent.emit(data);
  }
}
