import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ApiFacturationDetailleeService } from '@app/services/api-adelaide/suivi/api-facturation-detaillee.service';
import { DatePipe } from '@angular/common';
import { DistinctEnvOrgAppSiteClientTarifInterface } from '@app/models/suivi/facturation-detaillee-interface';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-search-facturation-detaillee',
  templateUrl: './search-facturation-detaillee.component.html',
  styleUrls: ['./search-facturation-detaillee.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchFacturationDetailleeComponent implements OnInit {
  form: FormGroup;
  allOrganismes: any;
  optionsEnv = [];
  optionsApp = [];
  optionsSite = [];
  optionsCommande = [];
  optionsFichier = [];
  allOrgReg;
  allOrganismesByTypeR;
  allClients = [];
  allTarifs = [];
  FORMAT_TO_TRANSFORM: string = 'yyyy-MM-dd';
  dfiexpFinMinDate: NgbDateStruct;
  subscriptions: Subscription[] = [];

  @Output() applySearchEvent = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private apiFacturationDetailleeService: ApiFacturationDetailleeService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setFormOptions();
  }

  initForm(): void {
    this.form = this.fb.group({
      dfiexpDeb: ['', CustomValidators.required()],
      dfiexpFin: ['', CustomValidators.required()],
      codorgs: this.fb.group({}),
      codclis: this.fb.group({}),
      typtars: this.fb.group({}),
      codenv: [''],
      codapp: [''],
      codcom: [''],
      codfic: [''],
      codsit: [''],
      totaux: [''],
    });

    this.initDfiexpFin();
  }

  initDfiexpFin() {
    this.subscriptions.push(
      this.form.get('dfiexpDeb').valueChanges.subscribe(value => {
        if (value) {
          this.form.get('dfiexpFin').setValue(value);
          this.dfiexpFinMinDate = value;
        }
      })
    );
  }

  setFormOptions() {
    this.subscriptions.push(
      this.apiFacturationDetailleeService.getDistinctEnvOrgAppSiteClientTarif().pipe(take(1)).subscribe(response => {
        const data = (response?.data || {}) as DistinctEnvOrgAppSiteClientTarifInterface;
        this.optionsEnv = [...new Set(data.findCodeEnv?.map((e: any) => e.code) || [])];
        this.optionsApp = [...new Set(data.findCodeApp?.map((e: any) => e.code) || [])];
        this.optionsSite = [...new Set(data.allSitesCNP?.map((e: any) => e.code) || [])];
        this.allClients = [...new Set(data.allClients?.map((e: any) => e.code) || [])];
        this.allTarifs = [...new Set(data.findTyptarFromGentar?.map((e: any) => e.typtar) || [])];
        this.allOrgReg = data.allOrganismes || [];
        this.allOrganismesByTypeR = data.findCodeOrganismesByTypeR || [];
        this.setClientOptions();
        this.setTarifOptions();
        this.setOrganismeOptions();
      })
    );
  }

  setClientOptions() {
    let clientForm = this.form.get('codclis') as FormGroup;
    Object.keys(clientForm.controls).forEach(key => clientForm.removeControl(key, { emitEvent: false }));
    clientForm.reset(false, { emitEvent: true });
    this.allClients.forEach(i => {
      clientForm.addControl(i as string, new FormControl(false, null), { emitEvent: false });
    });
  }

  setTarifOptions() {
    let tarifForm = this.form.get('typtars') as FormGroup;
    Object.keys(tarifForm.controls).forEach(key => tarifForm.removeControl(key, { emitEvent: false }));
    tarifForm.reset(false, { emitEvent: true });
    this.allTarifs.forEach(i => {
      tarifForm.addControl(i as string, new FormControl(false, null), { emitEvent: false });
    });
  }

  setOrganismeOptions() {
    const orgForm = this.form.get('codorgs') as FormGroup;
    const organismes = this.allOrganismesByTypeR.map(e => e.code);
    SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
  }

  valider() {
    const data = this.form.getRawValue();
    data.dfiexpDeb = data.dfiexpDeb
      ? this.datePipe.transform(data.dfiexpDeb['year'] + '-' + data.dfiexpDeb['month'] + '-' + data.dfiexpDeb['day'], this.FORMAT_TO_TRANSFORM)
      : null;
    data.dfiexpFin = data.dfiexpFin
      ? this.datePipe.transform(data.dfiexpFin['year'] + '-' + data.dfiexpFin['month'] + '-' + data.dfiexpFin['day'], this.FORMAT_TO_TRANSFORM)
      : null;

    this.applySearchEvent.emit(data);
  }

  isFormValid() {
    return this.form.valid;
  }
}
