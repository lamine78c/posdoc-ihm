import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ParamSearchPeriodeApiModel } from '@app/models/supervision/production/details/param-search-periode-api-model';
import { PeriodeInterface } from '@app/models/supervision/production/details/periode-interface';
import { OccurrenceEtapeSearchData } from '@app/models/supervision/video-step-interface';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-search-occurrence-etape',
  templateUrl: './search-occurrence-etape.component.html',
  styleUrls: ['./search-occurrence-etape.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchOccurrenceEtapeComponent implements OnInit  {
  @Output() applySearchEvent = new EventEmitter<any>();
  @Input() isIntervalStart: boolean;

  form: FormGroup;
  allOrgReg: any;
  optionsEnv = [];
  optionsApp = [];
  optionsCommande: string[];
  optionsGamme: string[];
  optionsStatut = [
    { value: 'V', text: 'Validé' },
    { value: 'D', text: 'Débuté' },
    { value: 'T', text: 'Terminé' },
    { value: 'I', text: 'Invalide' },
    { value: 'S', text: 'Suspendu' },
  ];
  optionsFiltre = [
    { value: 'statut', text: 'Statut' },
    { value: 'gamme', text: 'Gamme' },
    { value: 'commande', text: 'Commande' },
    { value: 'statutD', text: '***En cours***' },
    { value: 'reedition', text: '***Rééditions***' },
    { value: 'fusion', text: '***Fusion FAB***' },
  ];
  optionsPeriode: { value: string | number; columns: { label: string; value: string | number }[] }[] = [];
  selectedOrg: string;
  selectedPeriode: string;
  searchData: OccurrenceEtapeSearchData[] = [];
  allExemplaires: any[] = [];

  formName = getFormName();
  indexForm = getFormIndex();

  isOrgOptionsInitialized = false;

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formPeriode: FormControl;
  subscriptions: Subscription[] = [];

  constructor(
    private adelaideOccurenceApplicationService: ApiAdelaideOccurenceApplicationService,
    private apiGestionOccurrenceEtapeService: ApiGestionOccurrenceEtapeService,
    private sessionDataSearchService: SessionDataSearchService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getEnvsFromGenEtp();

    this.subscriptions.push(
      this.formEnv.valueChanges.subscribe(() => this.setOrgsByEnv()),
      this.formApp.valueChanges.subscribe(() => this.setPeriodeByApp()),
      this.formPeriode.valueChanges.subscribe(() => {
        this.saveNewSelectedPeriode();
        this.isFormValid() && this.lister();
      })
    );
  }

  isFormValid() {
    return this.form.valid && !this.isIntervalStart;
  }

  initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.required() }),
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.PERIODE]: ['', CustomValidators.required()],
      filtre: [''],
      commande: [''],
      gamme: [''],
      statut: [''],
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formPeriode = this.form.get(this.formName.PERIODE) as FormControl;
  }

  saveNewSelectedPeriode(): void {
    this.selectedPeriode = this.formPeriode.value;
    this.getCommandesAndGammes();
  }

  // Affiche les options des périodes selon l'application choisi
  setPeriodeByApp() {
    this.formPeriode.setValue('', { emitEvent: false });
    this.optionsPeriode = [];
    const input: ParamSearchPeriodeApiModel = {
      codApp: this.formApp.value,
      codEnv: this.formEnv.value,
      codOrgs: [this.selectedOrg],
      isManuel: false,
    };
    // affiche les options d'application selon l'environnement et l'organismes choisi
    if (input.codApp) {
      this.subscriptions.push(
        this.adelaideOccurenceApplicationService.getDetailsPeriodeFromGenApp(input).pipe(take(1)).subscribe(result => {
          this.optionsPeriode = result.data.getDetailsPeriodeFromGenApp
            .map((e: PeriodeInterface) => ({
              value: e.perCod,
              columns: [
                { label: 'Période', value: e.perCod },
                { label: 'Statut', value: e.appsta },
                { label: 'Debuté', value: e.dappld ? SharedUtil.formatDateToDDMMYYYYHHMMSS(e.dappld.toString()) : '' },
                { label: 'Terminé', value: e.dapplt ? SharedUtil.formatDateToDDMMYYYYHHMMSS(e.dapplt.toString()) : '' },
              ],
            }))
            .sort((a, b) => b.value.localeCompare(a.value));
          this.formPeriode.setValue(
            this.optionsPeriode.map(e => e.value).some((p: string) => p === this.selectedPeriode) ? this.selectedPeriode : '',
            {
              emitEvent: false,
            }
          );
        })
      );
    }
  }

  // Affiche les options d'organismes selon l'environnement choisi
  setOrgsByEnv() {
    const selectedEnv = this.formEnv.value;
    const organismes = [
      ...new Set(this.searchData.filter((e: OccurrenceEtapeSearchData) => e.codenv === selectedEnv).map((e: OccurrenceEtapeSearchData) => e.codorg)),
    ];
    const orgForm = this.formOrg;
    SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false, [this.selectedOrg]);
    // Mettre à jour le sélecteur d'application après un changement d'environnement
    this.isOrgOptionsInitialized && this.onChangeOrganisme(this.selectedOrg);
    this.isOrgOptionsInitialized = true;
  }

  getCommandesAndGammes(): void {
    const selectedApp = this.formApp.value;
    const selectedEnv = this.formEnv.value;
    this.subscriptions.push(
      this.apiGestionOccurrenceEtapeService
        .getDistinctGamsAndComsByEnvsAndOrgsAndAppsAndPercods([selectedEnv], [this.selectedOrg], [selectedApp], [this.selectedPeriode])
        .pipe(take(1))
        .subscribe(result => {
          this.optionsCommande = result.data.getDistinctComsByEnvsAndOrgsAndAppsAndPercods.sort((a, b) => a?.localeCompare(b));
          this.optionsGamme = result.data.getDistinctGamsByEnvsAndOrgsAndAppsAndPercods.sort((a, b) => a?.localeCompare(b));
        })
    );
  }

  getEnvsFromGenEtp(): void {
    this.subscriptions.push(
      this.apiGestionOccurrenceEtapeService.getOccurrenceEtapeSearchData().pipe(take(1)).subscribe(result => {
        this.allOrgReg = result.data.allOrganismes;
        this.searchData = result.data.getOccurrenceEtapeSearchData;
        this.optionsEnv = [...new Set(this.searchData.map((e: OccurrenceEtapeSearchData) => e.codenv))];
      })
    );
  }

  onChangeOrganisme(selectedOrg: string): void {
    const selectedEnv = this.formEnv.value;
    this.selectedOrg = selectedOrg;
    // affiche les options d'application selon l'environnement et l'organismes choisi
    this.optionsApp = [
      ...new Set(
        this.searchData
          .filter((e: OccurrenceEtapeSearchData) => e.codenv === selectedEnv)
          .filter((e: OccurrenceEtapeSearchData) => this.selectedOrg === e.codorg)
          .map((e: OccurrenceEtapeSearchData) => e.codapp)
          .sort((a, b) => a.localeCompare(b))
      ),
    ];
    // Mettre à jour le sélecteur des périodes après un changement d'organisme
    this.setPeriodeByApp();
  }

  lister() {
    this.sessionDataSearchService.updateDataSearchToSession({ ...this.form.getRawValue(), [this.formName.ORGANISME]: this.selectedOrg });
    const dataToEmit = {
      ...this.form.getRawValue(),
      [this.formName.ORGANISME]: this.selectedOrg,
      statut: this.getStatut(),
      etpfus: this.getEtpfus(),
      reedit: this.getReedit(),
      commande: this.getCommande(),
      gamme: this.getGamme(),
    };
    delete dataToEmit.filtre;
    this.applySearchEvent.emit(dataToEmit);
  }

  getCommande(): string {
    return this.form.get('commande').value;
  }

  getGamme(): string {
    return this.form.get('gamme').value;
  }

  getStatut(): string {
    const filtre = this.form.get('filtre').value;
    if (filtre === 'statutD') {
      this.form.get('statut').setValue('D', { emitEvent: false, onlySelf: true });
    }
    return this.form.get('statut').value;
  }

  getEtpfus(): string {
    return this.form.get('filtre').value === 'fusion' ? 'FAB' : '';
  }

  getReedit(): boolean {
    const filtre = this.form.get('filtre').value;
    return filtre === 'reedition';
  }

  isCommandeToShow(): boolean {
    const isCommandeToShow = this.form.get('filtre').value === 'commande';
    if (isCommandeToShow) {
      this.form.get('gamme').setValue('', { emitEvent: false });
      this.form.get('statut').setValue('', { emitEvent: false });
    } else {
      this.form.get('commande').setValue('', { emitEvent: false });
    }
    return isCommandeToShow;
  }

  isGammeToShow(): boolean {
    const isGammeToShow = this.form.get('filtre').value === 'gamme';
    if (isGammeToShow) {
      this.form.get('commande').setValue('', { emitEvent: false });
      this.form.get('statut').setValue('', { emitEvent: false });
    } else {
      this.form.get('gamme').setValue('', { emitEvent: false });
    }
    return isGammeToShow;
  }

  isStatutToShow(): boolean {
    const isStatutToShow = this.form.get('filtre').value === 'statut';
    if (isStatutToShow) {
      this.form.get('gamme').setValue('', { emitEvent: false });
      this.form.get('commande').setValue('', { emitEvent: false });
    } else {
      this.form.get('statut').setValue('', { emitEvent: false });
    }
    return isStatutToShow;
  }

  isAnnexSearchDisabled(): boolean {
    return this.form.invalid || this.isIntervalStart;
  }
}
