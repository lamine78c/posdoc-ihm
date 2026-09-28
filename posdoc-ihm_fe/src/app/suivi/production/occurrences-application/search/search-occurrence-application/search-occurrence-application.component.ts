import { Component, EventEmitter, inject, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { debounceTime, map, of, Subscription, switchMap, take, tap } from 'rxjs';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ParamSearchPeriodeApiModel } from '@app/models/supervision/production/details/param-search-periode-api-model';
import { PeriodeInterface } from '@app/models/supervision/production/details/periode-interface';
import { OccurrenceApplicationFilter } from '@app/models/suivi/occurrence-application-interface';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import { PeriodeTableColumnsInterface, PeriodeTableInterface } from '@app/models/periode-tableau.interface';

interface DistinctEnvOrgApp {
  codenv: string;
  codorg: string;
  codapp: string;
}

@Component({
  selector: 'app-search-occurrence-application',
  templateUrl: './search-occurrence-application.component.html',
  styleUrl: './search-occurrence-application.component.scss',
  standalone: false,
})
@AutoUnsubscribe
export class SearchOccurrenceApplicationComponent implements OnInit {
  @Output() applySearchEvent = new EventEmitter<any>();

  readonly optionsEnv: WritableSignal<string[]> = signal([]);
  readonly optionsApp: WritableSignal<string[]> = signal([]);
  readonly optionsPeriode: WritableSignal<{ value: string | number; columns: { label: string; value: string | number }[] }[]> = signal([]);
  readonly optionsSite: WritableSignal<string[]> = signal([]);

  private readonly searchData: WritableSignal<DistinctEnvOrgApp[]> = signal([]);
  private readonly allOrgReg: WritableSignal<any> = signal(null);

  form: FormGroup;
  readonly formName = getFormName();
  readonly indexForm = getFormIndex();

  formEnv: FormControl;
  formOrg: FormGroup;
  formApp: FormControl;
  formPeriode: FormControl;
  formSite: FormControl;

  isOrgOptionsInitialized = false;

  subscriptions: Subscription[] = [];

  defaultColumnsPercod: PeriodeTableColumnsInterface[] = [
    { label: 'Période', value: '' },
    { label: 'Statut', value: '' },
    { label: 'Débuté', value: '' },
    { label: 'Terminé', value: '' },
  ];
  defaultOptionPercod: PeriodeTableInterface = {
    value: '',
    columns: this.defaultColumnsPercod,
  };

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly sessionDataSearchService: SessionDataSearchService = inject(SessionDataSearchService);
  private readonly apiOccurrenceApplication: ApiAdelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);

  ngOnInit(): void {
    this.initForm();
    this.loadInitialOptions();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}),
      [this.formName.APPLICATION]: [''],
      [this.formName.PERIODE]: [''],
      [this.formName.SITE]: [''],
    });

    this.assignFormControls();
  }

  private assignFormControls(): void {
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formPeriode = this.form.get(this.formName.PERIODE) as FormControl;
    this.formSite = this.form.get(this.formName.SITE) as FormControl;
  }

  private loadInitialOptions(): void {
    this.subscriptions.push(
      this.apiOccurrenceApplication
        .getDistinctEnvOrgAppFromGenapp()
        .pipe(take(1))
        .pipe(
          tap(result => {
            const data = result.data.getDistinctEnvOrgAppFromGenapp;
            this.searchData.set(data);
            this.optionsEnv.set(this.extractUniqueValues(data, 'codenv'));
            this.allOrgReg.set(result.data.allOrganismes);
            this.optionsSite.set(result.data.allSitesCNP.map(site => site.code));
          })
        )
        .subscribe(() => this.initializeOrganismesAndApplications())
    );
  }

  private initializeOrganismesAndApplications(): void {
    const allOrganismes = this.extractUniqueValues(this.searchData(), 'codorg');
    if (allOrganismes.length > 0) {
      SharedUtil.getOrgFormByOrgData(this.formOrg, allOrganismes, this.allOrgReg(), false);
    }

    const allApplications = this.extractUniqueValues(this.searchData(), 'codapp');
    this.optionsApp.set(allApplications);
  }

  private extractUniqueValues<T>(data: T[], key: keyof T): string[] {
    return [...new Set(data.map(item => item[key] as string))].sort((a, b) => a.localeCompare(b));
  }

  private getFilteredApplications(selectedEnv: string, selectedOrgs: string[]): string[] {
    let filteredData = this.searchData();

    if (selectedEnv) {
      filteredData = filteredData.filter(e => e.codenv === selectedEnv);
    }

    if (selectedOrgs.length > 0) {
      filteredData = filteredData.filter(e => selectedOrgs.includes(e.codorg));
    }

    return this.extractUniqueValues(filteredData, 'codapp');
  }

  private updateFormControlValue(control: FormControl, currentValue: string, availableOptions: string[]): void {
    const newValue = availableOptions.includes(currentValue) ? currentValue : '';
    control.reset(newValue, { emitEvent: true });
  }

  private setupFormListeners(): void {
    this.onChangeEnv();
    this.onChangeApplication();
  }

  private onChangeEnv(): void {
    this.subscriptions.push(
      this.formEnv.valueChanges.subscribe((selectedEnv: string) => {
        const organismes = selectedEnv
          ? this.extractUniqueValues(
              this.searchData().filter(e => e.codenv === selectedEnv),
              'codorg'
            )
          : this.extractUniqueValues(this.searchData(), 'codorg');

        SharedUtil.getOrgFormByOrgData(this.formOrg, organismes, this.allOrgReg(), false);
        this.isOrgOptionsInitialized && this.onChangeOrganisme([]);
        this.isOrgOptionsInitialized = true;
      })
    );
  }

  onChangeOrganisme(elements: any): void {
    const selectedOrgs: string[] = Object.values(elements).map((e: any) => e.title);
    const selectedEnv: string = this.formEnv.value;
    const selectedApp: string = this.formApp.value;

    const apps = this.getFilteredApplications(selectedEnv, selectedOrgs);
    this.optionsApp.set(apps);
    this.updateFormControlValue(this.formApp, selectedApp, apps);
  }

  private onChangeApplication(): void {
    this.subscriptions.push(
      this.formApp.valueChanges
        .pipe(
          debounceTime(DELAI_VALUE_CHANGE),
          switchMap(() => this.fetchPeriodesIfValid())
        )
        .subscribe((periodes: { value: string | number; columns: { label: string; value: string | number }[] }[]) => {
          periodes = [this.defaultOptionPercod, ...periodes];
          this.optionsPeriode.set(periodes);
          this.updateFormControlValue(
            this.formPeriode,
            this.formPeriode.value,
            periodes.map(p => p.value as string)
          );
        })
    );
  }

  private fetchPeriodesIfValid() {
    if (!this.isValueInOptions(this.formApp.value, this.optionsApp())) {
      return of([]);
    }

    const getDetailsPeriodeQuery: ParamSearchPeriodeApiModel = {
      codEnv: this.formEnv.value,
      codOrgs: this.getSelectedOrganismes(),
      codApp: this.formApp.value,
      isManuel: true,
    };
    const nbrSelectedOrgs = this.getSelectedOrganismes().length;
    return this.apiOccurrenceApplication.getDetailsPeriodeFromGenApp(getDetailsPeriodeQuery).pipe(
      map(
        (result: any) =>
          result?.data?.getDetailsPeriodeFromGenApp
            .filter((e, index, arr) => arr.findIndex(t => t.perCod === e.perCod) === index)
            .map((e: PeriodeInterface) => ({
              value: e.perCod,
              columns: [
                { label: 'Période', value: e.perCod },
                { label: 'Statut', value: nbrSelectedOrgs === 1 ? e.appsta : '' },
                { label: 'Débuté', value: nbrSelectedOrgs === 1 && e.dappld ? SharedUtil.formatDateToDDMMYYYYHHMMSS(e.dappld.toString()) : '' },
                { label: 'Terminé', value: nbrSelectedOrgs === 1 && e.dapplt ? SharedUtil.formatDateToDDMMYYYYHHMMSS(e.dapplt.toString()) : '' },
              ],
            })) || []
      )
    );
  }

  private isValueInOptions(value: string, options: string[]): boolean {
    return options.includes(value);
  }

  private getSelectedOrganismes(): string[] {
    const selectedOrgs: string[] = [];
    SharedUtil.extractSelectedOrgs(this.formOrg.value, selectedOrgs);
    return selectedOrgs;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  valider(): void {
    const formData = this.form.getRawValue();
    this.sessionDataSearchService.updateDataSearchToSession(formData);

    const payload: OccurrenceApplicationFilter = this.buildSearchPayload(formData);
    this.applySearchEvent.emit(payload);
  }

  private buildSearchPayload(formData: any): OccurrenceApplicationFilter {
    const selectedOrgs = this.extractOrganismes(formData[this.formName.ORGANISME]);

    return {
      codenv: formData[this.formName.ENVIRONNEMENT],
      codorgs: selectedOrgs.length > 0 ? selectedOrgs : null,
      codapp: formData[this.formName.APPLICATION] || null,
      percod: formData[this.formName.PERIODE] || null,
      codsit: formData[this.formName.SITE] || null,
    };
  }

  private extractOrganismes(organismes: any): string[] {
    if (!organismes) {
      return [];
    }
    return this.getSelectedOrganismes();
  }
}
