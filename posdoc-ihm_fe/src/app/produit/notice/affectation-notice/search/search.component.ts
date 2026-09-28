import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PopupErreurComponent } from '@app/admin/popup/popup-erreur/popup-erreur.component';
import { NUM_SECOND_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { FicPrdImpInterface } from '@app/models/gestion-fichier-edition/notices/notfic';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE, getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { DataService } from '@app/shared/utils/data.service';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription, take } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-affectation-notice',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchComponent implements OnInit {
  form: FormGroup;
  allOrganismes: any;
  orgsSelected = [];
  optionsNot = [];
  optionsEnv = [];
  optionsApp = [];
  optionsCom = [];
  optionsFic: { value: string | number; columns: { label: string; value: string | number }[] }[] = [];

  formName = getFormName();
  indexForm = getFormIndex();

  isOrgOptionsInitialized = false;

  formNot: FormControl;
  formEnv: FormControl;
  formOrg: FormGroup;
  formApp: FormControl;
  formCom: FormControl;
  formFic: FormControl;
  formImp: FormControl;

  subscriptions: Subscription[] = [];
  @Output() applySearchEvent = new EventEmitter<any>();
  @Input() isPopupAjout = false;
  @Input() isAffNot = false;
  @Input() isNotFic = false;
  @Input() isSomeChangeNotSubmited = false;

  private readonly fb = inject(FormBuilder);
  private readonly apiAdelaideFichierService = inject(ApiAdelaideFichierService);
  private readonly apiNoticeService = inject(ApiNoticesService);
  private readonly dataService = inject(DataService);
  private readonly modalService = inject(NgbModal);
  private readonly sessionDataSearchService = inject(SessionDataSearchService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.isAffNot) {
      this.getNotices();
      this.onChangeNotice();
      // relance la recherche après l'ajout
      this.handlerUpdateSearchData();
    }
    this.getEnvInFic();
    this.onChangeEnv();
    this.onChangeApp();
    this.onChangeCom();
  }

  handlerUpdateSearchData() {
    this.subscriptions.push(this.dataService.getTransferedData().subscribe(data => !!data?.relanceSearchAffNot && this.relanceSearchAffNot()));
  }

  relanceSearchAffNot() {
    this.lister();
  }

  initializeForm() {
    this.form = this.fb.group({
      notice: this.getValidatorFormNot(),
      [this.formName.ENVIRONNEMENT]: this.getValidatorFormEnv(),
      [this.formName.ORGANISME]: this.getValidatorFormOrg(),
      [this.formName.APPLICATION]: this.getValidatorFormApp(),
      [this.formName.COMMANDE]: [''],
      [this.formName.FICHIER]: [''],
      [this.formName.REFIMPRIME]: [''],
    });

    this.formNot = this.form.get('notice') as FormControl;
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormControl;
    this.formImp = this.form.get(this.formName.REFIMPRIME) as FormControl;
  }

  getValidatorFormNot() {
    return ['', this.isAffNot ? CustomValidators.required() : null];
  }

  getValidatorFormEnv() {
    return ['', this.isPopupAjout || this.isNotFic ? CustomValidators.required() : null];
  }

  getValidatorFormOrg() {
    return new FormGroup({}, this.isPopupAjout || this.isNotFic ? { validators: CustomValidators.oneRequired() } : {});
  }

  getValidatorFormApp() {
    return ['', this.isPopupAjout || this.isNotFic ? CustomValidators.required() : null];
  }

  getNotices() {
    this.subscriptions.push(
      this.apiNoticeService.getOnlyActiveNotices().pipe(take(1)).subscribe(data => {
        this.optionsNot = (data as any).data.allActiveNotices.map(e => e.codnot).sort((a, b) => a.localeCompare(b));
      })
    );
  }

  onChangeNotice() {
    // transmets la notice sélectionnée au parent
    this.subscriptions.push(
      this.formNot.valueChanges.subscribe(notice =>
        this.dataService.setDataToTransfer({
          selectedNotice: notice,
        })
      )
    );
  }

  getEnvInFic() {
    this.subscriptions.push(
      this.apiAdelaideFichierService.getDistinctEnvironnements().pipe(take(1)).subscribe(data => {
        this.optionsEnv = (data as any).data.getDistinctEnvsFromFichier;
        this.allOrganismes = (data as any).data.allOrganismes;
      })
    );
  }

  onChangeEnv() {
    this.subscriptions.push(
      this.formEnv.valueChanges
        .pipe(
          switchMap(env => {
            return !!env ? this.apiAdelaideFichierService.getDistinctOrgsNoMasByEnvs(this.getSearchFichierFilterQuery([env])) : of(null);
          })
        )
        .subscribe((data: any) => {
          const organismes = !!data ? data.data.getDistOrgNoMasByEnvFromFichier : [];
          // filtrer les organismes selectionnéés par la nouvelle liste
          this.orgsSelected = this.orgsSelected.filter((e: any) => organismes.includes(e.title));
          const orgForm = this.formOrg;
          // affichage avec les organismes selectionnéés
          SharedUtil.getOrgFormByOrgData(
            orgForm,
            organismes,
            this.allOrganismes,
            false,
            this.orgsSelected.map((e: any) => e.title)
          );
          this.isOrgOptionsInitialized && this.onChangeOrganisme(this.orgsSelected);
          this.isOrgOptionsInitialized = true;
        })
    );
  }

  onChangeOrganisme(event) {
    this.orgsSelected = event;
    const env = this.formEnv.value;
    const orgs = Object.values(event).map((e: any) => e.title);
    if (!!env && !!orgs.length) {
      this.subscriptions.push(
        this.apiAdelaideFichierService.getDistAppsByEnvOrg(this.getSearchFichierFilterQuery([env], orgs)).pipe(take(1)).subscribe(data => {
          this.optionsApp = (data as any).data.getDistAppByEnvOrgFromFichier;
          const app = this.formApp.value;
          if (!!app && this.optionsApp.includes(app)) {
            this.formApp.reset(app, { emitEvent: true });
          } else {
            this.formApp.reset('', { emitEvent: true });
          }
        })
      );
    } else {
      this.optionsApp = [];
      this.formApp.reset('', { emitEvent: true });
    }
  }

  isFormValid() {
    // mettre commande ou imprimé en obligatoire pour le popup d'ajout
    return this.isPopupAjout ? this.form.valid && (!!this.formCom.value || !!this.formImp.value) : this.form.valid;
  }

  lister() {
    if (this.isSomeChangeNotSubmited) {
      const modalWarning = this.modalService.open(PopupErreurComponent);
      modalWarning.componentInstance.messages = [
        'Changement non sauvegardé',
        'Des modifications non enregistrées ont été détectées.',
        'Êtes-vous sûr de vouloir relancer la recherche ?',
      ];
      modalWarning.result.catch(error => {
        if (error == NUM_SECOND_BTN_MODAL) {
          this.send();
        }
      });
    } else {
      this.send();
    }
  }

  send() {
    const data = this.form.getRawValue();
    // supprime les valeurs doublons, vides, nulls et undefined
    data[this.formName.FICHIER] = [...new Set(data[this.formName.FICHIER])].filter(codfic => !!codfic);
    // enregistrer les valeurs dans la session
    this.sessionDataSearchService.updateDataSearchToSession(data);
    // formatter les valeurs et envoyer
    this.applySearchEvent.emit(this.formatDataBeforeSend(data));
  }

  formatDataBeforeSend(data) {
    const cloneData = { ...data };
    const selectedOrgs: string[] = [];
    SharedUtil.extractSelectedOrgs(cloneData[this.formName.ORGANISME], selectedOrgs);
    cloneData[this.formName.ORGANISME] = !!selectedOrgs.length ? selectedOrgs : null;
    cloneData[this.formName.ENVIRONNEMENT] = !!cloneData[this.formName.ENVIRONNEMENT] ? cloneData[this.formName.ENVIRONNEMENT] : null;
    cloneData[this.formName.APPLICATION] = !!cloneData[this.formName.APPLICATION] ? cloneData[this.formName.APPLICATION] : null;
    cloneData[this.formName.COMMANDE] = !!cloneData[this.formName.COMMANDE] ? '%' + cloneData[this.formName.COMMANDE] + '%' : null;
    cloneData[this.formName.FICHIER] = !!cloneData[this.formName.FICHIER]?.length ? cloneData[this.formName.FICHIER] : null;
    cloneData[this.formName.REFIMPRIME] = !!cloneData[this.formName.REFIMPRIME] ? '%' + cloneData[this.formName.REFIMPRIME] + '%' : null;
    return cloneData;
  }

  getSearchFichierFilterQuery(codenvs: string[], codorgs?: string[], codapp?: string, codcom?: string) {
    return {
      codenvs: codenvs,
      codorgs: codorgs ?? [],
      codapp: codapp ?? '',
      codcom: codcom ?? '',
    };
  }

  onChangeApp() {
    this.subscriptions.push(
      this.formApp.valueChanges
        .pipe(
          switchMap(app => {
            const env = this.formEnv.value;
            const orgs = Object.values(this.orgsSelected).map((e: any) => e.title);
            return !!env && orgs.length > 0 && !!app
              ? this.apiAdelaideFichierService.getDistComsByEnvOrgApp(this.getSearchFichierFilterQuery([env], orgs, app))
              : of(null);
          })
        )
        .subscribe(data => {
          this.optionsCom = !!data ? (data as any).data.getDistComByEnvOrgAppFromFichier : [];
          const com = this.formCom.value;
          if (!!com && this.optionsCom.find(opt => opt.includes(com))) {
            this.formCom.reset(com, { emitEvent: true });
          } else {
            this.formCom.reset('', { emitEvent: true });
          }
        })
    );
  }

  onChangeCom() {
    this.subscriptions.push(
      this.formCom.valueChanges
        .pipe(
          debounceTime(DELAI_VALUE_CHANGE),
          switchMap(com => {
            const env = this.formEnv.value;
            const orgs = Object.values(this.orgsSelected).map((e: any) => e.title);
            const app = this.formApp.value;
            return !!env && orgs.length > 0 && !!app && !!com
              ? this.apiAdelaideFichierService.findFicPrdImpByEnvOrgAppCom(this.findFicPrdImpByEnvOrgAppComQuery(env, orgs, app, com))
              : of(null);
          })
        )
        .subscribe(data => {
          const result = !!data ? data.data.findFicPrdImpByEnvOrgAppCom : [];
          this.optionsFic = result.map((fichierInfo: FicPrdImpInterface) => ({
            value: fichierInfo.codfic,
            columns: [
              { label: 'Fichier', value: fichierInfo.codfic },
              { label: 'Code Prd', value: fichierInfo.codprd },
              { label: 'Imprimé', value: fichierInfo.refimp },
            ],
          }));
          // supprime les valeurs doublons, vides, nulls, undefined et n'garder que les valeurs qui sont existe dans l'option
          const fics = [...new Set(this.formFic.value)].filter(codfic => !!codfic && this.optionsFic.find(opt => opt.value === codfic));
          this.formFic.reset(!!fics.length ? fics : null, { emitEvent: true });
        })
    );
  }

  findFicPrdImpByEnvOrgAppComQuery(codenv: string, codorgs: string[], codapp: string, codcom: string) {
    return {
      codenv: codenv,
      codorgs: codorgs,
      codapp: codapp,
      codcom: '%' + codcom + '%',
    };
  }
}
