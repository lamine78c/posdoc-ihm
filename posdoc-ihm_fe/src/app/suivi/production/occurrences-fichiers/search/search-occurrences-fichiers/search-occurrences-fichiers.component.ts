import { Component, EventEmitter, inject, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApolloQueryResult } from '@apollo/client/core';
import { PeriodeTableColumnsInterface, PeriodeTableInterface } from '@app/models/periode-tableau.interface';
import { OccurrencesFichiersFilters } from '@app/models/suivi/occurrence-fichier.model';
import { DetailsPeriodeInterface, PeriodeInterface } from '@app/models/supervision/production/details/periode-interface';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { ApiAdelaideReeditionProduitService } from '@app/services/api-adelaide-reedition-produit.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DEFAULT_ENVIRONNEMENT, DELAI_VALUE_CHANGE, FICHIER_STATUT_OPTIONS, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { StringUtil } from '@app/shared/utils/StringUtil';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, map, switchMap, take, tap } from 'rxjs/operators';

interface DistinctEnvOrgApp {
  codenv: string;
  codorg: string;
  codapp: string;
}

@Component({
  selector: 'app-search-occurrences-fichiers',
  templateUrl: './search-occurrences-fichiers.component.html',
  styleUrls: ['./search-occurrences-fichiers.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchOccurrencesFichiersComponent implements OnInit {
  @Output() applySearchEvent = new EventEmitter<OccurrencesFichiersFilters>();

  readonly optionsEnv: WritableSignal<string[]> = signal([]);
  readonly optionsApp: WritableSignal<string[]> = signal([]);
  readonly optionsPeriode: WritableSignal<PeriodeTableInterface[]> = signal([]);
  readonly optionsStatut = FICHIER_STATUT_OPTIONS;

  private readonly searchData: WritableSignal<DistinctEnvOrgApp[]> = signal([]);
  private readonly allOrgReg: WritableSignal<any> = signal(null);

  isOrgOptionsInitialized = false;

  form: FormGroup;
  readonly formName = getFormName();
  readonly indexForm = getFormIndex();

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formPeriode: FormControl;
  formCom: FormControl;
  formFic: FormControl;
  formPrd: FormControl;
  formSta: FormControl;
  formImp: FormControl;

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

  private readonly apiAdelaideReeditionProduitService = inject(ApiAdelaideReeditionProduitService);
  private readonly adelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);
  private readonly fb = inject(FormBuilder);
  private readonly sessionDataSearchService = inject(SessionDataSearchService);

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    this.onChangeEnv();
    this.onChangeApplication();
  }

  private initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}),
      [this.formName.APPLICATION]: [''],
      [this.formName.PERIODE]: [''],
      [this.formName.COMMANDE]: [''],
      [this.formName.FICHIER]: [''],
      codprd: [''],
      codsta: [''],
      [this.formName.REFIMPRIME]: [''],
    });

    this.assignFormControls();
  }

  private assignFormControls(): void {
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formPeriode = this.form.get(this.formName.PERIODE) as FormControl;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormControl;
    this.formPrd = this.form.get('codprd') as FormControl;
    this.formSta = this.form.get('codsta') as FormControl;
    this.formImp = this.form.get(this.formName.REFIMPRIME) as FormControl;
  }

  private loadInitialData(): void {
    this.subscriptions.push(
      this.apiAdelaideReeditionProduitService
        .getDistinctEnvOrgAppFromGenfic()
        .pipe(
          take(1),
          tap((result: any) => {
            const data: DistinctEnvOrgApp[] = result.data.getDistinctEnvOrgAppFromGenfic;
            this.searchData.set(data);
            const envOptions = this.extractUniqueValues(data, 'codenv');
            this.optionsEnv.set(envOptions);
            this.allOrgReg.set(result.data.allOrganismes);

            // Sélectionner 'P' par défaut s'il existe, sinon la première valeur
            if (envOptions.length > 0) {
              const defaultEnv = envOptions.includes(DEFAULT_ENVIRONNEMENT) ? DEFAULT_ENVIRONNEMENT : envOptions[0];
              this.formEnv.setValue(defaultEnv, { emitEvent: false });
            }
          })
        )
        .subscribe(() => this.initializeOrganismesAndApplications())
    );
  }

  private extractUniqueValues<T>(data: T[], key: keyof T): string[] {
    return [...new Set(data.map(item => item[key] as string))].sort((a, b) => a.localeCompare(b));
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

        this.updateOrganismeOptions(organismes);
        this.isOrgOptionsInitialized && this.onChangeOrganisme([]);
        this.isOrgOptionsInitialized = true;
      })
    );
  }

  private initializeOrganismesAndApplications(): void {
    const allOrganismes = this.extractUniqueValues(this.searchData(), 'codorg');
    if (allOrganismes.length > 0) {
      this.updateOrganismeOptions(allOrganismes);
    }

    const allApplications = this.extractUniqueValues(this.searchData(), 'codapp');
    this.optionsApp.set(allApplications);
  }

  private updateOrganismeOptions(organismes: string[]): void {
    SharedUtil.getOrgFormByOrgData(this.formOrg, organismes, this.allOrgReg(), false);
  }

  onChangeOrganisme(elements: any): void {
    const selectedOrgs: string[] = Object.values(elements).map((e: any) => e.title);
    const selectedEnv: string = this.formEnv.value;
    const selectedApp: string = this.formApp.value;

    const apps = this.getFilteredApplications(selectedEnv, selectedOrgs);
    this.optionsApp.set(apps);
    this.updateFormControlValue(this.formApp, selectedApp, apps);
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

  private onChangeApplication(): void {
    this.subscriptions.push(
      this.formApp.valueChanges
        .pipe(
          debounceTime(DELAI_VALUE_CHANGE),
          switchMap(() => this.fetchPeriodesIfValid())
        )
        .subscribe((periodes: PeriodeTableInterface[]) => {
          this.optionsPeriode.set(periodes);
          this.updateFormControlValue(
            this.formPeriode,
            this.formPeriode.value,
            periodes.map(e => e.value)
          );
        })
    );
  }

  private fetchPeriodesIfValid(): Observable<PeriodeTableInterface[]> {
    if (!this.isValueInOptions(this.formApp.value, this.optionsApp())) {
      return of([this.defaultOptionPercod]);
    }

    const selectedOrgs = this.getSelectedOrganismes();
    return this.adelaideOccurenceApplicationService
      .getDetailsPeriodeFromGenApp({
        codEnv: this.formEnv.value,
        codOrgs: selectedOrgs,
        codApp: this.formApp.value,
        isManuel: true,
      })
      .pipe(
        map((result: ApolloQueryResult<DetailsPeriodeInterface>) => {
          const data = result?.data?.getDetailsPeriodeFromGenApp || [];
          return this.mapToDistinctPercod(data);
        })
      );
  }

  private mapToDistinctPercod(data: PeriodeInterface[]): PeriodeTableInterface[] {
    data.sort((a, b) => b.perCod.localeCompare(a.perCod));
    const periodes = new Map<string, PeriodeTableInterface>();
    periodes.set('', this.defaultOptionPercod);
    for (const item of data) {
      if (periodes.has(item.perCod)) {
        periodes.get(item.perCod).columns = [
          { label: 'Période', value: item.perCod },
          { label: 'Statut', value: '' },
          { label: 'Débuté', value: '' },
          { label: 'Terminé', value: '' },
        ];
      } else {
        periodes.set(item.perCod, {
          value: item.perCod,
          columns: [
            { label: 'Période', value: item.perCod },
            { label: 'Statut', value: item.appsta },
            { label: 'Débuté', value: item.dappld ? SharedUtil.formatDateToDDMMYYYYHHMMSS(item.dappld.toString()) : '' },
            { label: 'Terminé', value: item.dapplt ? SharedUtil.formatDateToDDMMYYYYHHMMSS(item.dapplt.toString()) : '' },
          ],
        });
      }
    }
    return Array.from(periodes.values());
  }

  private getSelectedOrganismes(): string[] {
    const selectedOrgs: string[] = [];
    SharedUtil.extractSelectedOrgs(this.formOrg.value, selectedOrgs);
    return selectedOrgs;
  }

  private isValueInOptions(value: string, options: string[]): boolean {
    return options.includes(value);
  }

  private updateFormControlValue(control: FormControl, currentValue: string, availableOptions: string[]): void {
    const newValue = availableOptions.includes(currentValue) ? currentValue : '';
    control.reset(newValue, { emitEvent: true });
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  valider(): void {
    const formData = this.form.getRawValue();
    this.sessionDataSearchService.updateDataSearchToSession(formData);

    const payload: OccurrencesFichiersFilters = this.buildSearchPayload(formData);
    this.applySearchEvent.emit(payload);
  }

  private buildSearchPayload(formData: any): OccurrencesFichiersFilters {
    const selectedOrgs = this.extractOrganismes(formData[this.formName.ORGANISME]);

    return {
      codenv: formData[this.formName.ENVIRONNEMENT],
      codorg: selectedOrgs.length > 0 ? selectedOrgs : null,
      codapp: formData[this.formName.APPLICATION] || null,
      percod: formData[this.formName.PERIODE] || null,
      codcom: StringUtil.addPercent(formData[this.formName.COMMANDE]),
      codfic: StringUtil.addPercent(formData[this.formName.FICHIER]),
      codprd: StringUtil.addPercent(formData.codprd),
      codsta: formData.codsta || null,
      refimp: StringUtil.addPercent(formData[this.formName.REFIMPRIME]),
    };
  }

  private extractOrganismes(organismes: any): string[] {
    if (!organismes) {
      return [];
    }
    return this.getSelectedOrganismes();
  }
}
