import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { SearchCommande } from '@app/models/searchCommande';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE, getFormName } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { of, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-search-commande-compare-modal',
  templateUrl: './search-commande-compare-modal.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class SearchCommandeCompareModalComponent implements OnInit, OnDestroy {
  @Input() environnementList = [];
  @Input() allOrgReg: any = [];
  @Output() applyCommandeEvent = new EventEmitter<any>();

  form: FormGroup;
  envOptSelected = [];
  orgOptSelected = [];
  appOptSelected = [];
  applicationList = [];
  regions: any[];
  formName = getFormName();
  formEnv: FormGroup;
  formOrg: FormGroup;
  formApp: FormGroup;
  subscriptions: Subscription[] = [];
  private onChangeEnvTimeout?: ReturnType<typeof setTimeout>;
  private onChangeAppTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private fb: UntypedFormBuilder,
    private apiAdelaideCommandeService: ApiAdelaideCommandeService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      [this.formName.APPLICATION]: this.fb.group({}),
      [this.formName.ENVIRONNEMENT]: this.fb.group({}),
      [this.formName.ORGANISME]: this.fb.group({}),
    });
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormGroup;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormGroup;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.initEnvironnementForm();
  }

  initEnvironnementForm() {
    this.environnementList.forEach(envCode => this.formEnv.addControl(envCode, new FormControl(false, null)));
  }

  onChangeEnvCompare(event: { title: string; selected: boolean }[]) {
    // debounce change and process the last one
    clearTimeout(this.onChangeEnvTimeout);
    this.onChangeEnvTimeout = setTimeout(() => {
      this.doChangeEnvCompare(event);
    }, DELAI_VALUE_CHANGE);
  }

  doChangeEnvCompare(event: { title: string; selected: boolean }[]) {
    this.envOptSelected = [];
    event.forEach(element => {
      this.envOptSelected.push(element.title);
    });
    Object.keys(this.formApp.controls).forEach(key => this.formApp.removeControl(key));
    const request$ = this.envOptSelected.length ? this.apiAdelaideCommandeService.getDistAppsByEnvsFromCommande(this.envOptSelected) : of(null);
    this.subscriptions.push(
      request$.pipe(take(1)).subscribe((result: any) => {
        this.applicationList = result?.data.getDistAppByEnvsFromCommande ?? [];
        this.appOptSelected = this.appOptSelected.filter(codeApp => this.applicationList.includes(codeApp));
        this.applicationList.forEach(app => this.formApp.addControl(app, new FormControl(this.appOptSelected.includes(app), null)));
        this.onChangeApplication(this.appOptSelected.map(e => ({ title: e, selected: true })));
      })
    );
  }

  onChangeOrganisme(event) {
    this.orgOptSelected = [];
    let elementSelectedList: any = [];
    elementSelectedList = event;
    elementSelectedList.forEach(element => {
      const elementCode = element.title.split('-', 1);
      this.orgOptSelected.push(elementCode[0].trim());
    });
  }

  onChangeApplication(event: { title: string; selected: boolean }[]) {
    // debounce change and process the last one
    clearTimeout(this.onChangeAppTimeout);
    this.onChangeAppTimeout = setTimeout(() => {
      this.doChangeApplication(event);
    }, DELAI_VALUE_CHANGE);
  }

  doChangeApplication(event: { title: string; selected: boolean }[]) {
    this.appOptSelected = [];
    event.forEach(element => {
      this.appOptSelected.push(element.title);
    });
    const request$ =
      this.envOptSelected.length && this.appOptSelected.length
        ? this.apiAdelaideCommandeService.getDistOrgsByEnvApp(this.envOptSelected, this.appOptSelected)
        : of(null);
    this.subscriptions.push(
      request$.pipe(take(1)).subscribe((result: any) => {
        const orgList = result?.data.getDistOrgByEnvsAndAppsFromCommande ?? [];
        const orgForm = this.formOrg;
        this.orgOptSelected = this.orgOptSelected.filter(codeOrg => orgList.includes(codeOrg));
        SharedUtil.getOrgFormByOrgData(orgForm, orgList, this.allOrgReg, false, this.orgOptSelected);
      })
    );
  }

  lister() {
    const searchCommande: SearchCommande = new SearchCommande();
    searchCommande.codesEnvironnement = this.envOptSelected;
    searchCommande.codesOrganisme = this.orgOptSelected;
    searchCommande.codesApplication = this.appOptSelected;
    this.applyCommandeEvent.emit(searchCommande);
  }

  ngOnDestroy(): void {
    clearTimeout(this.onChangeEnvTimeout);
    clearTimeout(this.onChangeAppTimeout);
  }
}
