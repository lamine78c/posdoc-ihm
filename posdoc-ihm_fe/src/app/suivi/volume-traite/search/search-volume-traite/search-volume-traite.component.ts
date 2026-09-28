import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { setEnvOrgsInput } from '@app/models/suivi/volume-traite-interface';
import { ApiAdelaideDateService } from '@app/services/api-adelaide-date.service';
import { ApiAdelaideVolumeTraiteService } from '@app/services/api-adelaide-volume-traite.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE_LONG, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-volume-traite',
  templateUrl: './search-volume-traite.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class SearchVolumeTraiteComponent implements OnInit {
  form: FormGroup;
  fromDateSelected = '';
  toDateSelected = '';
  environnementList = [];
  orgsSelected;

  fromMinDate: NgbDateStruct;
  toMaxDate: NgbDateStruct;
  fromDefaultDate: NgbDateStruct;
  toDefaultDate: NgbDateStruct;

  allOrganismes;

  @Output() applyVolumesTraitesEvent = new EventEmitter<any>();

  formName = getFormName();
  indexForm = getFormIndex();

  isOrgOptionsInitialized = false;

  formEnv: FormControl;
  formOrg: FormGroup;
  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private apiAdelaideDateService: ApiAdelaideDateService,
    private apiAdelaideVolumeTraiteService: ApiAdelaideVolumeTraiteService,
    private sessionDataSearchService: SessionDataSearchService,
    public datepipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initData();
    this.initForm();
    this.getEnvsOrgsList();
    this.onChangeEnv();
    this.onChangeFromDate();
    this.onChangeToDate();
  }

  initData(): void {
    const today = new Date(); // janv = 0
    this.toDefaultDate = this.toMaxDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }; // Adj
    const twoWeekFromToday = new Date();
    twoWeekFromToday.setDate(twoWeekFromToday.getDate() - 15);
    this.fromDefaultDate = { year: twoWeekFromToday.getFullYear(), month: twoWeekFromToday.getMonth() + 1, day: twoWeekFromToday.getDate() };
    const oneYearFromToday = new Date();
    oneYearFromToday.setMonth(oneYearFromToday.getMonth() - 12);
    oneYearFromToday.setFullYear(1980);
    this.fromMinDate = { year: oneYearFromToday.getFullYear(), month: oneYearFromToday.getMonth() + 1, day: oneYearFromToday.getDate() }; // -12 mois
    this.fromDateSelected = this.apiAdelaideDateService.transformDateToString(this.fromDefaultDate);
    this.toDateSelected = this.apiAdelaideDateService.transformDateToString(this.toDefaultDate, true);
  }

  initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      ressource: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      fromDate: [this.fromDefaultDate, CustomValidators.required()],
      toDate: [this.toDefaultDate, CustomValidators.required()],
    });
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
  }

  transformStrDateToGql(date) {
    return !!date ? this.datepipe.transform(date, 'yyyy-MM-ddTHH:mm:ss') : null;
  }

  getEnvsOrgsList(): void {
    this.subscriptions.push(
      this.apiAdelaideVolumeTraiteService.getEnvsOrgsSelectionFromGenETP().subscribe(data => {
        this.allOrganismes = data.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code));
        this.environnementList = data.data.getDistinctEnvsFromGenEtp;
        const organismes = data.data.getDistinctOrgsFromGenEtp;
        // filtrer les organismes selectionnéés par la nouvelle liste
        this.orgsSelected = this.orgsSelected.filter(e => organismes.includes(e.title));
        const orgForm = this.formOrg;
        // affichage avec les organismes selectionnéés
        SharedUtil.getOrgFormByOrgData(
          orgForm,
          organismes,
          this.allOrganismes,
          false,
          this.orgsSelected.map(e => e.title)
        );
        this.isOrgOptionsInitialized && this.onChangeOrganisme(this.orgsSelected);
        this.isOrgOptionsInitialized = true;
      })
    );
  }

  onChangeFromDate(): void {
    this.subscriptions.push(
      this.form
        .get('fromDate')
        .valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE_LONG))
        .subscribe(() => {
          this.fromDateSelected = this.apiAdelaideDateService.transformDateToString(this.form.get('fromDate').value);
        })
    );
  }

  onChangeToDate(): void {
    this.subscriptions.push(
      this.form
        .get('toDate')
        .valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE_LONG))
        .subscribe(() => {
          this.toDateSelected = this.apiAdelaideDateService.transformDateToString(this.form.get('toDate').value, true);
        })
    );
  }

  onChangeEnv(): void {
    this.subscriptions.push(
      this.formEnv.valueChanges
        .pipe(
          switchMap(env => {
            const selectedOrgs = [];
            SharedUtil.extractSelectedOrgs(this.formOrg.value, selectedOrgs);
            return !!env && !!selectedOrgs.length
              ? this.apiAdelaideVolumeTraiteService.getGamSitResByEnvOrgs(setEnvOrgsInput(env, selectedOrgs))
              : of(null);
          })
        )
        .subscribe(data => !!data && this.initFormRessources(data.data.getGamSitResByEnvOrgs))
    );
  }

  onChangeOrganisme(elements: { title: string; selected: boolean }[]): void {
    this.orgsSelected = elements;
    const env: string = this.formEnv.value;
    const orgs = Object.values(elements).map(e => e.title);
    if (!!env && !!orgs.length) {
      this.subscriptions.push(
        this.apiAdelaideVolumeTraiteService
          .getGamSitResByEnvOrgs(setEnvOrgsInput(env, orgs))
          .subscribe(data => this.initFormRessources(data.data.getGamSitResByEnvOrgs))
      );
    } else {
      const ressForm = this.form.get('ressource') as FormGroup;
      Object.keys(ressForm.controls).forEach(key => ressForm.removeControl(key, { emitEvent: false }));
    }
  }

  initFormRessources(data) {
    const ressources = data.map(e => e.codgam + '/' + e.codsit + '/' + e.codres);
    const ressForm = this.form.get('ressource') as FormGroup;
    // get les ressources selectionnéés et filtrer par la nouvlle liste
    const ressSelected = [];
    const ressFormState = ressForm.getRawValue();
    for (const key in ressFormState) {
      ressFormState[key] && ressources.includes(key) && ressSelected.push(key);
    }
    Object.keys(ressForm.controls).forEach(key => ressForm.removeControl(key, { emitEvent: false }));
    ressources.forEach(i => {
      // coché les ressources selectinnéés
      ressForm.addControl(i as string, new FormControl(ressSelected.includes(i), null), { emitEvent: false });
    });
  }

  lister() {
    const data = this.form.getRawValue();
    data.fromDate = this.fromDateSelected;
    data.toDate = this.toDateSelected;
    this.sessionDataSearchService.updateDataSearchToSession(data);
    this.applyVolumesTraitesEvent.emit(data);
  }

  isFormValid() {
    return (
      this.formEnv.valid && this.formOrg.valid && this.form.get('ressource').valid && this.form.get('fromDate').valid && this.form.get('toDate').valid
    );
  }
}
