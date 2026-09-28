import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OccurrenceApplicationTri } from '@app/models/enums/occurrence-application-tri';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE_LONG, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-occurrence-application',
  templateUrl: './search-occurrence-application.component.html',
  styleUrls: ['./search-occurrence-application.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchOccurrenceApplicationComponent implements OnInit {
  @Output() applySearchEvent = new EventEmitter<any>();
  @Input() isIntervalStart: boolean;
  form: FormGroup;
  searchData = [];
  allOrgReg: any;
  optionsEnv = [];
  optionsApp = [];
  optionsSite = [];
  optionsTri = Object.values(OccurrenceApplicationTri);
  fromMinDate: NgbDateStruct;
  toMaxDate: NgbDateStruct;

  formName = getFormName();
  indexForm = getFormIndex();

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  subscriptions: Subscription[] = [];

  private readonly apiService = inject(ApiAdelaideOccurenceApplicationService);
  private readonly datePipe = inject(DatePipe);
  private readonly fb = inject(FormBuilder);

  constructor() {
    // do nothing
  }

  getExtFormControl(): FormControl {
    return this.form.get('ext') as FormControl;
  }

  ngOnInit(): void {
    const today = new Date(); // janv = 0
    this.toMaxDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }; // Adj

    const dateFromToday = new Date();
    dateFromToday.setDate(dateFromToday.getDate() - 15);
    this.fromMinDate = { year: dateFromToday.getFullYear(), month: dateFromToday.getMonth() + 1, day: dateFromToday.getDate() }; // -15 jours

    this.initForm();
    this.getSearchElementFromApplis();

    this.onChangeEnv();
  }

  onChangeEnv(): void {
    this.subscriptions.push(this.formEnv.valueChanges.subscribe(() => {
      // récuépérer les options d'organismes de cet environnement choisi
      this.getSearchElementOrgByEnv();
      // récuépérer les options d'applications de cet environnement choisi
      this.optionsApp = [
        ...new Set(
          this.searchData
            .filter(e => !this.formEnv.value || e.codeEnvironnement == this.formEnv.value)
            .map(e => e.code)
            .sort((a, b) => a.localeCompare(b))
        ),
      ];
    }));
  }

  initForm(): void {
    this.form = this.fb.group({
      date: [SharedUtil.getCurentDate(), CustomValidators.required()],
      tri: [OccurrenceApplicationTri.A],
      [this.formName.ENVIRONNEMENT]: [''],
      [this.formName.ORGANISME]: this.fb.group({}, {}),
      [this.formName.APPLICATION]: [''],
      site: [''],
      ext: [''], // Afficher les occurrences d'applications externes avec des fichiers délestés
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;

    this.subscriptions.push(this.form.valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE_LONG)).subscribe(() => this.isFormValid() && this.lister()));
  }

  getSearchElementFromApplis(): void {
    this.subscriptions.push(
      this.apiService
        .getSearchElementFromApplis()
        .pipe(
          switchMap((result: any) => {
            return of(result);
          })
        )
        .subscribe((result: any) => {
          this.searchData = result.data.allApplications;
          this.allOrgReg = result.data.allOrganismes;
          // afficher toutes les options initialement
          this.optionsSite = [...new Set(result.data.allSitesCNP.map(e => e.code))];
          this.optionsEnv = [...new Set(this.searchData.map(e => e.codeEnvironnement))];
          this.optionsApp = [...new Set(this.searchData.map(e => e.code).sort((a, b) => a.localeCompare(b)))];
          this.getSearchElementOrgByEnv();
        })
    );
  }

  // récuépérer les options d'organismes selon l'environnement choisi
  getSearchElementOrgByEnv() {
    const organismes = [
      ...new Set(this.searchData.filter(e => !this.formEnv.value || e.codeEnvironnement == this.formEnv.value).map(e => e.codeOrganisation)),
    ];
    const orgForm = this.formOrg;
    SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
    return organismes;
  }

  // récuépérer les options d'applications selon l'env et les orgs choisis
  onChangeOrganisme(elements): void {
    const selectedOrgs: string[] = Object.values(elements).map((e: any) => e.title);
    this.optionsApp = [
      ...new Set(
        this.searchData
          .filter(e => !this.formEnv.value || e.codeEnvironnement == this.formEnv.value)
          .filter(e => selectedOrgs.length == 0 || selectedOrgs.includes(e.codeOrganisation))
          .map(e => e.code)
          .sort((a, b) => a.localeCompare(b))
      ),
    ];

    // on met à vide si l'application sélectionnée n'est pas présenté dans sa liste
    const selectedApp = this.formApp.value;
    selectedApp && !this.optionsApp.some(e => e === selectedApp) && this.formApp.reset('');
  }

  isFormValid() {
    return this.form.valid && !this.isIntervalStart;
  }

  lister() {
    const rawOrg = this.formOrg.value;
    const orgs = [];
    SharedUtil.extractSelectedOrgs(rawOrg, orgs);
    const dateObject = this.form.get('date').value;
    const currentDate = new Date(Date.UTC(dateObject.year, dateObject.month - 1, dateObject.day));
    const codSite = this.form.get('site').value;
    const codEnv = this.formEnv.value;
    const codApp = this.formApp.value;
    const tri = this.form.get('tri').value;
    const ext = this.form.get('ext').value;

    this.applySearchEvent.emit({
      currentDate: this.datePipe.transform(currentDate.toISOString(), 'yyyy-MM-dd'),
      codSite: codSite ? codSite : null,
      codEnv: codEnv ? codEnv : null,
      codOrgs: !!orgs.length ? orgs : null,
      codApp: codApp ? codApp : null,
      tri: tri ? tri : null,
      ext: ext ? ext : false,
    });
  }
}
