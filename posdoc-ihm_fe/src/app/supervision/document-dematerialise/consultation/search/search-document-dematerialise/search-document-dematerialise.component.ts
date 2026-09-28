import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiAdelaideDocumentDematerialiseService } from '@app/services/api-adelaide-docments-dematerialise.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import {
  APP_OCCURRENCES_STATUS_DELETED,
  APP_OCCURRENCES_STATUS_SUSPENDED,
  APP_OCCURRENCES_STATUS_TERMINATED,
  FICHIER_STATUT_OPTIONS,
  getFormIndex,
  getFormName,
  TYPES,
  ZERO,
} from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { DateUtil } from '@app/shared/utils/DateUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
import { SearchDocDematerialiseInterface } from '../../model/search-document-dematerialise-interface';

@Component({
  selector: 'app-search-document-dematerialise',
  templateUrl: './search-document-dematerialise.component.html',
  styleUrls: ['./search-document-dematerialise.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchDocumentDematerialiseComponent implements OnInit {
  form: FormGroup;
  formName = getFormName();
  indexForm = getFormIndex();
  formDat;
  formOrg;
  formDoc;
  formSta;
  formTyp;
  formApp;
  formCom;
  allOrgReg;
  allOrgAppCom;
  allApp;
  allCom;
  allDoc;
  selectedOrgs = [];
  optionsDoc = [];
  optionsSta = [];
  optionsTyp = [];
  optionsApp = [];
  optionsCom = [];
  toMaxDate: NgbDateStruct;
  @Output() applyEvent = new EventEmitter<any>();
  private readonly fb = inject(FormBuilder);
  private readonly calendar = inject(NgbCalendar);
  private readonly datePipe = inject(DatePipe);
  private readonly apiGenDocService = inject(ApiAdelaideDocumentDematerialiseService);

  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.setDefaultValue();
    this.getDocumentsAndOrganismes();
  }

  setDefaultValue() {
    this.toMaxDate = this.calendar.getToday();
    this.optionsSta = FICHIER_STATUT_OPTIONS.filter(e =>
      [APP_OCCURRENCES_STATUS_DELETED, APP_OCCURRENCES_STATUS_TERMINATED, APP_OCCURRENCES_STATUS_SUSPENDED].includes(e.value)
    );
    this.optionsTyp = TYPES.map(e => ({ value: e.value, text: e.label }));
  }

  initForm() {
    this.form = this.fb.group({
      [this.formName.DATE]: [DateUtil.getCurentDate(), CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, {}),
      [this.formName.STATUT]: [''],
      [this.formName.TYPE]: [''],
      [this.formName.DOCUMENT]: [''],
      [this.formName.APPLICATION]: [''],
      [this.formName.COMMANDE]: [''],
    });

    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formDat = this.form.get(this.formName.DATE) as FormControl;
    this.formTyp = this.form.get(this.formName.TYPE) as FormControl;
    this.formDoc = this.form.get(this.formName.DOCUMENT) as FormControl;
    this.formSta = this.form.get(this.formName.STATUT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
  }

  getDocumentsAndOrganismes() {
    this.subscriptions.push(
      this.apiGenDocService.getDocumentDematerialiseSearchConfig().pipe(take(1)).subscribe(data => {
        this.allDoc = data.data.findComDocLibFicInFichier;
        this.allOrgAppCom = data.data.getDistinctOrgAppComFromGendoc;
        this.allOrgReg = data.data.allOrganismes;

        const orgSet = new Set<string>();
        const appSet = new Set<string>();
        const comSet = new Set<string>();

        for (const { codorg, codapp, codcom } of this.allOrgAppCom) {
          orgSet.add(codorg);
          appSet.add(codapp);
          comSet.add(codcom);
        }

        this.allApp = [...appSet].sort((a, b) => a.localeCompare(b));
        this.allCom = [...comSet].sort((a, b) => a.localeCompare(b));

        const organismes = [...orgSet].sort((a, b) => a.localeCompare(b));
        SharedUtil.getOrgFormByOrgData(this.formOrg, organismes, this.allOrgReg, false);

        this.buildFormDocOptions(null, null);
        this.buildFormAppOptions([], null);
        this.buildFormComOptions([], null, null);

        this.onChangeApplication();
        this.onChangeCommande();
      })
    );
  }

  onChangeOrganisme(event) {
    const orgsSelected = Object.values(event).map((e: any) => e.title);
    this.buildFormAppOptions(orgsSelected, this.formApp.value);
  }

  onChangeApplication() {
    this.subscriptions.push(
      this.formApp.valueChanges.subscribe(appSelected => {
        const orgsSelected = [];
        SharedUtil.extractSelectedOrgs(this.formOrg.value, orgsSelected);
        this.buildFormComOptions(orgsSelected, appSelected, this.formCom.value);
      })
    );
  }

  onChangeCommande() {
    this.subscriptions.push(
      this.formCom.valueChanges.subscribe(comSelected => {
        this.buildFormDocOptions(comSelected, this.formDoc.value);
      })
    );
  }

  private buildFormAppOptions(orgsSelected: string[], appSelected: string): void {
    if (orgsSelected.length > ZERO) {
      this.optionsApp = this.getOptionsAppByOrgs(orgsSelected);
    } else {
      this.optionsApp = this.allApp;
    }
    if (appSelected && this.optionsApp.includes(appSelected)) {
      this.formApp.reset(appSelected, { emitEvent: true });
    } else {
      this.formApp.reset('', { emitEvent: true });
    }
  }

  private buildFormComOptions(orgsSelected: string[], appSelected: string, comSelected: string): void {
    if (appSelected) {
      this.optionsCom = this.getOptionsComByOrgsApp(orgsSelected, appSelected);
    } else {
      this.optionsCom = this.allCom;
    }
    if (comSelected && this.optionsCom.includes(comSelected)) {
      this.formCom.reset(comSelected, { emitEvent: true });
    } else {
      this.formCom.reset('', { emitEvent: true });
    }
  }

  private buildFormDocOptions(comSelected: string, docSelected: string): void {
    this.optionsDoc = [
      {
        value: '',
        columns: [
          { label: 'Document', value: '' },
          { label: 'Désignation', value: '' },
        ],
      },
      ...this.allDoc
        .filter(item => !comSelected || item.codcom === comSelected)
        .map(({ coddoc, libfic }) => ({
          value: coddoc,
          columns: [
            { label: 'Document', value: coddoc },
            { label: 'Désignation', value: libfic },
          ],
        }))
        .sort((a, b) => a.value.localeCompare(b.value)),
    ];
    if (docSelected && this.optionsDoc.some(item => item.value === docSelected)) {
      this.formDoc.reset(docSelected, { emitEvent: true });
    } else {
      this.formDoc.reset('', { emitEvent: true });
    }
  }

  private getOptionsAppByOrgs(orgsSelected: string[]): string[] {
    const appSet = new Set<string>();
    for (const item of this.allOrgAppCom) {
      if (orgsSelected.includes(item.codorg)) {
        appSet.add(item.codapp);
      }
    }
    return [...appSet].sort((a, b) => a.localeCompare(b));
  }

  private getOptionsComByOrgsApp(orgsSelected: string[], appSelected: string): string[] {
    const comSet = new Set<string>();
    for (const item of this.allOrgAppCom) {
      const matchOrg = orgsSelected.length === ZERO || orgsSelected.includes(item.codorg);
      const matchApp = item.codapp === appSelected;
      if (matchOrg && matchApp) {
        comSet.add(item.codcom);
      }
    }
    return [...comSet].sort((a, b) => a.localeCompare(b));
  }

  lister() {
    const formData = this.form.getRawValue();
    this.selectedOrgs = [];
    SharedUtil.extractSelectedOrgs(formData[this.formName.ORGANISME], this.selectedOrgs);
    const data: SearchDocDematerialiseInterface = {
      date: this.datePipe.transform(
        formData[this.formName.DATE]['year'] + '-' + formData[this.formName.DATE]['month'] + '-' + formData[this.formName.DATE]['day'],
        'yyyy-MM-dd'
      ),
      codorgs: this.selectedOrgs.length ? this.selectedOrgs : null,
      coddoc: formData[this.formName.DOCUMENT] ? formData[this.formName.DOCUMENT] : null,
      typact: formData[this.formName.TYPE] ? formData[this.formName.TYPE] : null,
      docsta: formData[this.formName.STATUT] ? formData[this.formName.STATUT] : null,
      codapp: formData[this.formName.APPLICATION] ? formData[this.formName.APPLICATION] : null,
      codcom: formData[this.formName.COMMANDE] ? formData[this.formName.COMMANDE] : null,
    };
    this.applyEvent.emit(data);
  }

  isFormValid() {
    return this.form.valid;
  }
}
