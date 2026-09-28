import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ParamSearchPeriodeApiModel } from '@app/models/supervision/production/details/param-search-periode-api-model';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { APP_OCCURRENCES_STATUS_SUSPENDED, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-search-gestion-occurrence-application',
  templateUrl: './search-gestion-occurrence-application.component.html',
  styleUrls: ['./search-gestion-occurrence-application.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchGestionOccurrenceApplicationComponent implements OnInit {
  form: FormGroup;

  allOrgReg: any;

  optionsEnv = [];

  optionsApp = [];

  optionsPeriode = [];

  searchData = [];

  @Output() applySearchEvent = new EventEmitter<any>();

  paramSearchPeriodeApiModel: ParamSearchPeriodeApiModel;

  selectedOrg: string;

  formName = getFormName();
  indexForm = getFormIndex();

  isOrgOptionsInitialized = false;

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formPeriode: FormControl;
  subscriptions: Subscription[] = [];

  constructor(
    private apiAdelaideOccurenceApplicationService: ApiAdelaideOccurenceApplicationService,
    private sessionDataSearchService: SessionDataSearchService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.onlyOneRequired() }),
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.PERIODE]: ['', CustomValidators.required()],
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formPeriode = this.form.get(this.formName.PERIODE) as FormControl;

    this.getDistinctEnvOrgAppFromGenapp();

    this.subscriptions.push(
      this.formEnv.valueChanges.subscribe(_e => {
        const organismes = [...new Set(this.searchData.filter(e => e.codenv == this.formEnv.value).map(e1 => e1.codorg))];
        const orgForm = this.formOrg;
        SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
        this.isOrgOptionsInitialized && this.onChangeOrganisme(this.selectedOrg);
        this.isOrgOptionsInitialized = true;
      })
    );

    this.subscriptions.push(
      this.formApp.valueChanges.subscribe(_e => {
        this.getPeriode();
      })
    );

    // Lister lorsque la periode est choisie
    this.subscriptions.push(this.formPeriode.valueChanges.subscribe(() => this.lister()));
  }

  getDistinctEnvOrgAppFromGenapp() {
    this.subscriptions.push(
      this.apiAdelaideOccurenceApplicationService.getDistinctEnvOrgAppFromGenapp().pipe(take(1)).subscribe(data => {
        this.searchData = (data as any).data.getDistinctEnvOrgAppFromGenapp;
        this.optionsEnv = [...new Set(this.searchData.map(e => e.codenv))]; // enlève les doublons
        this.allOrgReg = (data as any).data.allOrganismes;
      })
    );
  }

  getOptionsApp() {
    this.optionsApp = [];
    const env = this.formEnv.value;
    if (env && this.selectedOrg) {
      this.optionsApp = [
        ...new Set(
          this.searchData
            .filter(e => e.codenv == env)
            .filter(e => this.selectedOrg == e.codorg)
            .map(e => e.codapp)
            .sort((a, b) => a.localeCompare(b))
        ),
      ];
    }
  }

  getPeriode() {
    this.optionsPeriode = [];
    const env = this.formEnv.value;
    const app = this.formApp.value;
    if (!!env && !!app && this.selectedOrg && this.isSelectedAppInOptionsApp()) {
      this.paramSearchPeriodeApiModel = {
        codEnv: env,
        codOrgs: [this.selectedOrg],
        codApp: app,
        isManuel: false,
      };
      this.subscriptions.push(
        this.apiAdelaideOccurenceApplicationService
          .getDetailsPeriodeFromGenApp(this.paramSearchPeriodeApiModel)
          .pipe(take(1))
          .subscribe((data: any) => {
            // n'affiche que les périodes "suspendues"
            this.optionsPeriode = data.data.getDetailsPeriodeFromGenApp
              .filter(e => e.appsta === APP_OCCURRENCES_STATUS_SUSPENDED)
              .map(e => e.perCod);
          })
      );
    }
  }

  onChangeOrganisme(selectedOrg: string): void {
    this.selectedOrg = selectedOrg;
    this.getOptionsApp();
    this.getPeriode();
  }

  lister() {
    const data = { ...this.form.getRawValue(), [this.formName.ORGANISME]: this.selectedOrg };
    this.sessionDataSearchService.updateDataSearchToSession(data);
    this.applySearchEvent.emit(data);
  }

  isSelectedAppInOptionsApp() {
    return this.optionsApp.includes(this.formApp.value);
  }
}
