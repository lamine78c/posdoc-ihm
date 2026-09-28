import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePickerComponent } from '@app/fullstack-components/shared/date-picker/date-picker.component';
import { BonTravailPeriodeFilterPayloadModel } from '@app/models/exploitation-editique/bon-travail/bon-travail-periode-filter-payload-model';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { ApiBonTravailService } from '@app/services/api-adelaide/exploitation-editique/bon-travail/api-bon-travail.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE_LONG, DELMSP, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import { PARAM_CODE_MASAPP } from '@app/shared/utils/Constants_params';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { debounceTime, filter, first, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-bon-travail',
  templateUrl: './search-bon-travail.component.html',
  styleUrls: ['./search-bon-travail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
@AutoUnsubscribe
export class SearchBonTravailComponent implements OnInit {
  form: FormGroup;
  allOrganismes: any;
  optionsEnv$: Observable<string[]> = new Observable<string[]>();
  optionsApp$: Observable<string[]> = new Observable<string[]>();
  optionsPeriode$: Observable<string[]> = new Observable<string[]>();
  optionsClient = [];
  optionsSite = [];
  optionsCommande = [];
  optionsFichier = [];
  optionsDelmsp = DELMSP;
  allOrgReg;
  searchData = [];

  @Output() applySearchEvent = new EventEmitter<any>();
  @ViewChild('dappcrDeb') dappcrDeb: DatePickerComponent;
  @ViewChild('dappcrFin') dappcrFin: DatePickerComponent;
  @ViewChild('dfiexpDeb') dfiexpDeb: DatePickerComponent;
  @ViewChild('dfiexpFin') dfiexpFin: DatePickerComponent;

  formName = getFormName();
  indexForm = getFormIndex();

  isOrgOptionsInitialized = false;

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formPeriode: FormControl;
  formCom: FormControl;
  formFic: FormControl;

  subscriptions: Subscription[] = [];
  masApp;

  selectedEnv$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  selectedOrgs$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  selectedApp$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private readonly fb = inject(FormBuilder);
  private readonly apiBonTravailService = inject(ApiBonTravailService);
  private readonly sessionDataSearchService = inject(SessionDataSearchService);
  private readonly datePipe = inject(DatePipe);
  private readonly apiAdelaideParametreService = inject(ApiAdelaideParametreService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.getDistinctEnvOrgAppFromGenapp();
    this.onEnvironnementChange();
    this.onApplicationChange();
    this.getMasApp();
    this.getOptionsPeriode();
    this.initAppOptions();
    this.onDateEmptyChange();
  }

  getMasApp(): void {
    this.subscriptions.push(
      this.apiAdelaideParametreService.getParamsForMasappMasgamMasuti().pipe(first()).subscribe((result: any) => {
        this.masApp = result.data.getParamsForMasappMasgamMasuti.filter(e => e.code === PARAM_CODE_MASAPP)[0]?.value;
      })
    );
  }

  initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.PERIODE]: [''],
      [this.formName.COMMANDE]: [''],
      [this.formName.FICHIER]: [''],
      codcli: [''],
      codbon: [''],
      dappcrDeb: [''],
      dappcrFin: [''],
      dfiexpDeb: [''],
      dfiexpFin: [''],
      isDateEmpty: [true],
      delmsp: [''],
      codsit: [''],
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formPeriode = this.form.get(this.formName.PERIODE) as FormControl;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormControl;

    // Désactiver les dates d'expédition par défaut car isDateEmpty est true
    this.form.get('dfiexpDeb').disable();
    this.form.get('dfiexpFin').disable();

    // optimise l'envoie de valeur à partir d'une ressource observable,
    // il va n'emettre que la valeur le plus récent après 1000ms sans les autres emissions
    this.subscriptions.push(
      this.form.valueChanges
        .pipe(
          debounceTime(DELAI_VALUE_CHANGE_LONG),
          switchMap(() => this.isFormValid()),
          filter(isFormValid => isFormValid)
        )
        .subscribe(() => this.valider())
    );
  }

  getDistinctEnvOrgAppFromGenapp() {
    const request = this.apiBonTravailService.getDistinctEnvOrgAppFromGenapp();
    this.optionsEnv$ = request.pipe(
      first(),
      map((result: any) => {
        this.searchData = result.data.getDistinctEnvOrgAppFromGenapp;
        this.optionsSite = [...new Set(result.data.allSitesCNP.map(e => e.code))];
        this.optionsClient = [...new Set(result.data.allClients.map(e => e.code))];
        this.allOrgReg = result.data.allOrganismes;
        return [...new Set(this.searchData.map(e => e.codenv))];
      }),
      startWith([])
    );
  }

  setBonTravailPeriodeFilterPayloadModel(selectedEnv: string, selectedOrgs: string[], selectedApp: string): BonTravailPeriodeFilterPayloadModel {
    const payload = new BonTravailPeriodeFilterPayloadModel();
    payload.codenv = selectedEnv;
    payload.codorg = selectedOrgs;
    payload.codapp = selectedApp;
    return payload;
  }

  onEnvironnementChange() {
    this.subscriptions.push(
      this.formEnv.valueChanges.subscribe(value => {
        this.selectedEnv$.next(value);
        const organismes = [...new Set(this.searchData.filter(e => e.codenv == value).map(e => e.codorg))];
        const orgForm = this.formOrg;
        SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
        this.isOrgOptionsInitialized = true;
      })
    );
  }

  onChangeOrganisme(e) {
    this.selectedOrgs$.next(Object.values(e).map((o: any) => o.title));
  }

  onApplicationChange() {
    this.subscriptions.push(
      this.formApp.valueChanges.subscribe((selectedCodapp: string) => {
        this.selectedApp$.next(selectedCodapp);
      })
    );
  }

  getEnvAndOrgsSelection() {
    return combineLatest([this.selectedEnv$, this.selectedOrgs$]);
  }

  public getOptionsPeriode(): void {
    this.optionsPeriode$ = this.selectedApp$.pipe(
      filter((selectedApp: string) => !!selectedApp),
      switchMap((selectedApp: string) => {
        const selectedEnv = this.selectedEnv$.getValue();
        const selectedOrgs = this.selectedOrgs$.getValue();
        const payload = this.setBonTravailPeriodeFilterPayloadModel(selectedEnv, selectedOrgs, selectedApp);
        return this.apiBonTravailService.getDistinctEnvOrgAppPerFromGenApp(payload);
      }),
      map((result: any) => result?.data?.getDistinctEnvOrgAppPerFromGenApp)
    );
  }

  initAppOptions() {
    this.optionsApp$ = this.getEnvAndOrgsSelection().pipe(
      map(([selectedEnv, selectedOrgs]: [string, string[]]) => {
        if (selectedEnv !== '' && selectedOrgs.length > 0) {
          return this.getFilteredApps(selectedEnv, selectedOrgs);
        } else {
          return [];
        }
      })
    );
  }

  private getFilteredApps(currentEnv: string, selectedOrgs: string[]): string[] {
    return [
      ...new Set(this.searchData.filter(item => item.codenv === currentEnv && selectedOrgs.includes(item.codorg)).map(item => item.codapp)),
    ].sort((a, b) => a.localeCompare(b));
  }

  onDateEmptyChange() {
    this.subscriptions.push(
      this.form.get('isDateEmpty').valueChanges.subscribe((isDateEmpty: boolean) => {
        if (isDateEmpty) {
          this.form.get('dfiexpDeb').disable();
          this.form.get('dfiexpFin').disable();
          this.form.get('dfiexpDeb').setValue(null);
          this.form.get('dfiexpFin').setValue(null);
          if (this.dfiexpDeb && typeof this.dfiexpDeb.resetDate === 'function') {
            this.dfiexpDeb.resetDate();
          }
          if (this.dfiexpFin && typeof this.dfiexpFin.resetDate === 'function') {
            this.dfiexpFin.resetDate();
          }
        } else {
          this.form.get('dfiexpDeb').enable();
          this.form.get('dfiexpFin').enable();
        }
      })
    );
  }

  isFormValid() {
    return this.optionsApp$.pipe(
      map(optionsApp => {
        return this.hasRequiredFields(optionsApp);
      })
    );
  }

  // env app org sont obligatoires
  hasRequiredFields(optionsApp: string[]) {
    return this.formEnv.valid && this.formApp.valid && this.isSelectedAppInOptionsApp(optionsApp) && this.formOrg.valid;
  }

  isSelectedAppInOptionsApp(optionsApp: string[]) {
    return optionsApp.includes(this.formApp.value);
  }

  valider() {
    const data = this.form.getRawValue();
    const FORMAT_TO_TRANSFORM = 'yyyy-MM-dd HH:mm:ss';
    data.dappcrDeb = data.dappcrDeb
      ? this.datePipe.transform(data.dappcrDeb['year'] + '-' + data.dappcrDeb['month'] + '-' + data.dappcrDeb['day'], FORMAT_TO_TRANSFORM)
      : null;
    data.dappcrFin = data.dappcrFin
      ? this.datePipe.transform(data.dappcrFin['year'] + '-' + data.dappcrFin['month'] + '-' + data.dappcrFin['day'], FORMAT_TO_TRANSFORM)
      : null;

    // Si isDateEmpty est coché, envoyer null pour les dates d'expédition
    if (data.isDateEmpty) {
      data.dfiexpDeb = null;
      data.dfiexpFin = null;
    } else {
      data.dfiexpDeb = data.dfiexpDeb
        ? this.datePipe.transform(data.dfiexpDeb['year'] + '-' + data.dfiexpDeb['month'] + '-' + data.dfiexpDeb['day'], FORMAT_TO_TRANSFORM)
        : null;
      data.dfiexpFin = data.dfiexpFin
        ? this.datePipe.transform(data.dfiexpFin['year'] + '-' + data.dfiexpFin['month'] + '-' + data.dfiexpFin['day'], FORMAT_TO_TRANSFORM)
        : null;
    }

    this.sessionDataSearchService.updateDataSearchToSession(data);
    // compatibilité output parent
    data.codenv = data[this.formName.ENVIRONNEMENT];
    data.codorg = data[this.formName.ORGANISME];
    data.codapp = data[this.formName.APPLICATION];
    data.percod = data[this.formName.PERIODE];
    data.codcom = data[this.formName.COMMANDE];
    data.codfic = data[this.formName.FICHIER];
    this.applySearchEvent.emit(data);
  }

  resetForm() {
    this.form.reset();
    this.selectedApp$.next('');
    this.selectedEnv$.next('');
    this.selectedOrgs$.next([]);
    if (this.dappcrDeb && typeof this.dappcrDeb.resetDate === 'function') {
      this.dappcrDeb.resetDate();
    }
    if (this.dappcrFin && typeof this.dappcrFin.resetDate === 'function') {
      this.dappcrFin.resetDate();
    }
    if (this.dfiexpDeb && typeof this.dfiexpDeb.resetDate === 'function') {
      this.dfiexpDeb.resetDate();
    }
    if (this.dfiexpFin && typeof this.dfiexpFin.resetDate === 'function') {
      this.dfiexpFin.resetDate();
    }
  }
}
