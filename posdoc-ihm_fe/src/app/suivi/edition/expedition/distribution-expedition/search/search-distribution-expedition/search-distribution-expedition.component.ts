import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchExpeditionQuery } from '@app/models/payload/search-expedition';
import { ApiAdelaideDateService } from '@app/services/api-adelaide-date.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { ApiAdelaideReeditionProduitService } from '@app/services/api-adelaide-reedition-produit.service';
import { getFormIndex, getFormName } from '@app/shared/utils/Constants';
import { PARAM_CODE_MASAPP } from '@app/shared/utils/Constants_params';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-search-distribution-expedition',
  templateUrl: './search-distribution-expedition.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class SearchDistributionExpeditionComponent implements OnInit {
  fromDateSelected: string = '';
  toDateSelected: string = '';

  @Input()
  fromMinDate: NgbDateStruct;
  @Input()
  toMaxDate: NgbDateStruct;
  @Input()
  fromDefaultDate: NgbDateStruct;
  @Input()
  toDefaultDate: NgbDateStruct;

  @Output() applyDateIntervalleEvent = new EventEmitter<any>();

  formName = getFormName();
  indexForm = getFormIndex();
  optionsEnv$: Observable<string[]> = new Observable<string[]>();
  optionsApp$: Observable<string[]> = new Observable<string[]>();
  selectedEnv$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  selectedOrgs$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  selectedApp$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  isOrgOptionsInitialized = false;
  form: FormGroup;
  formToDate: FormControl;
  formFromDate: FormControl;
  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formIsDateEmpty: FormControl;
  allOrgReg;
  allEnvOrgApp = [];
  subscriptions: Subscription[] = [];
  masApp;

  constructor(
    private fb: FormBuilder,
    private apiAdelaideDateService: ApiAdelaideDateService,
    private apiAdelaideReeditionProduitService: ApiAdelaideReeditionProduitService,
    private apiAdelaideParametreService: ApiAdelaideParametreService,
    private sessionDataSearchService: SessionDataSearchService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getMasApp();
    this.getDistinctEnvOrgAppFromGenfic();
    this.onEnvironnementChange();
    this.onApplicationChange();
    this.onChangeFromDate();
    this.onChangeToDate();
  }

  getMasApp(): void {
    this.subscriptions.push(
      this.apiAdelaideParametreService.getParamsForMasappMasgamMasuti().pipe(first()).subscribe((result: any) => {
        this.masApp = result.data.getParamsForMasappMasgamMasuti.filter(e => e.code === PARAM_CODE_MASAPP)[0]?.value;
      })
    );
  }

  getDistinctEnvOrgAppFromGenfic() {
    const request = this.apiAdelaideReeditionProduitService.getDistinctEnvOrgAppFromGenfic();
    this.optionsEnv$ = request.pipe(
      first(),
      map((result: any) => {
        this.allEnvOrgApp = result.data.getDistinctEnvOrgAppFromGenfic.filter(e => e.codapp != this.masApp);
        this.allOrgReg = result.data.allOrganismes;
        return [...new Set(this.allEnvOrgApp.map(e => e.codenv))];
      })
    );
  }

  onEnvironnementChange() {
    this.subscriptions.push(
      this.formEnv.valueChanges.subscribe(value => {
        this.selectedEnv$.next(value);
        const organismes = [...new Set(this.allEnvOrgApp.filter(e => e.codenv == value).map(e => e.codorg))];
        const orgForm = this.formOrg;
        SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
        this.isOrgOptionsInitialized && this.onChangeOrganisme([]);
        this.isOrgOptionsInitialized = true;
      })
    );
  }

  onChangeOrganisme(e) {
    this.selectedOrgs$.next(Object.values(e).map((o: any) => o.title));
    this.optionsApp$ = this.getEnvAndOrgsSelection().pipe(
      map(([selectedEnv, selectedOrgs]: [string, string[]]) => {
        if (selectedEnv !== '' && selectedOrgs.length > 0) {
          return this.getFilteredApps(selectedEnv, selectedOrgs);
        } else {
          return [];
        }
      })
    );
    this.subscriptions.push(
      this.optionsApp$.subscribe(observer => {
        const selectedCodapp = this.selectedApp$.getValue();
        if (observer.includes(selectedCodapp)) {
          this.formApp.reset(selectedCodapp, { emitEvent: true });
        } else {
          this.formApp.reset(false, { emitEvent: true });
        }
      })
    );
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

  private getFilteredApps(currentEnv: string, selectedOrgs: string[]): string[] {
    return [
      ...new Set(this.allEnvOrgApp.filter(item => item.codenv === currentEnv && selectedOrgs.includes(item.codorg)).map(item => item.codapp)),
    ].sort((a, b) => a.localeCompare(b));
  }

  initForm(): void {
    this.fromDateSelected = this.apiAdelaideDateService.transformDateToString(this.fromDefaultDate);
    this.toDateSelected = this.apiAdelaideDateService.transformDateToString(this.toDefaultDate, true);
    this.form = this.fb.group({
      fromDate: [this.fromDefaultDate, CustomValidators.required()],
      toDate: [this.toDefaultDate, CustomValidators.required()],
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      isDateEmpty: [true],
    });
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formIsDateEmpty = this.form.get('isDateEmpty') as FormControl;
    this.formFromDate = this.form.get('fromDate') as FormControl;
    this.formToDate = this.form.get('toDate') as FormControl;
  }

  onChangeFromDate() {
    this.subscriptions.push(
      this.formFromDate.valueChanges.subscribe(_e => {
        this.fromDateSelected = this.apiAdelaideDateService.transformDateToString(this.formFromDate.value);
      })
    );
  }

  onChangeToDate() {
    this.subscriptions.push(
      this.formToDate.valueChanges.subscribe(_e => {
        this.toDateSelected = this.apiAdelaideDateService.transformDateToString(this.formToDate.value, true);
      })
    );
  }

  lister(event) {
    this.sessionDataSearchService.updateDataSearchToSession(this.form.getRawValue());
    this.applyDateIntervalleEvent.emit(this.getSearchExpeditionQuery());
  }

  getSearchExpeditionQuery(): SearchExpeditionQuery {
    const formState = this.form.getRawValue();
    const selectedOrgs = [];
    SharedUtil.extractSelectedOrgs(formState[this.formName.ORGANISME], selectedOrgs);
    return {
      codenv: formState[this.formName.ENVIRONNEMENT],
      codorg: selectedOrgs,
      codapp: formState[this.formName.APPLICATION],
      isNotNullDfiexp: formState.isDateEmpty,
      dfiexpDeb: this.fromDateSelected,
      dfiexpFin: this.toDateSelected,
    };
  }

  isFormValid() {
    return this.form.valid;
  }
}
