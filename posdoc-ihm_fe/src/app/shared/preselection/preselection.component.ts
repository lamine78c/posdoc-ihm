import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { initExemplaireByFilterQuery } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AutoUnsubscribe } from '../decorators/auto-unsubscribe.decorator';
import { getFormIndex, getFormName } from '../utils/Constants';
import { SessionDataSearchService } from '../utils/session-data-search.service';
import SharedUtil from '../utils/SharedUtil';
import {
  FichierCodficRefImprimeCodeProdInterface,
  SearchAppByEnvOrgDataInterface,
  SearchComByEnvOrgAppDataInterface,
  SearchOrgByEnvDataInterface,
} from '@app/models/fichier';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { ApolloQueryResult } from '@apollo/client';
import { AllOrganismeDtoInterface } from '@app/models/organisme';
import CustomValidators from '../utils/CustomValidators';
import { ArrayUtil } from '../utils/ArrayUtil';

@Component({
  selector: 'app-preselection',
  templateUrl: './preselection.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class PreselectionComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() applicationOptions = [];
  @Input() commandeOptions = [];
  @Input() fichierListOptions = [];
  @Input() fichierOptions: { value: string | number; columns: { label: string; value: string | number }[] }[] = [];
  @Input() isWithoutCommandeOptions = false;
  @Input() isWithoutFichierOptions = false;
  @Input() isEnvOptionsInitialized = false;
  @Input() isOrgOptionsInitialized = false;
  @Input() isFicInList = false;

  isSearchDisabled = false;

  /**
   * valider le formulaire de preselection
   */
  @Output() validerEvent = new EventEmitter<any>();

  @Output() organismeChangeEvent = new EventEmitter<any>();

  @Output() selectedEnvironnements: EventEmitter<string[]> = new EventEmitter();

  formEnv: FormGroup;
  formApp: FormControl;
  formOrg: FormGroup;
  formCom: FormControl;
  formFic: FormControl;

  formName = getFormName();
  indexForm = getFormIndex();
  subscriptions: Subscription[] = [];

  // param pour les pages distributions qui ont des traitements du formulaire en commun
  @Input() isDistribution = false;
  distributionListOfOldSelectedOrganismesCode: string[] = [];
  distributionOldSelectedApplication;
  private selectedEnvsTimeoutId: ReturnType<typeof setTimeout>;
  private distributionValueChangeOrgTimeoutId: ReturnType<typeof setTimeout>;

  private readonly sessionDataSearchService = inject(SessionDataSearchService);
  private readonly apiAdelaideDistributionService = inject(ApiAdelaideDistributionService);
  private readonly filterSharedDataService = inject(FilterSharedDataService);
  private readonly apiAdelaideFichierService = inject(ApiAdelaideFichierService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormGroup;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormControl;
    // traitements pour les pages distributions
    if (this.isDistribution) {
      this.distributionGetOptionsEnvs();
      this.distributionValueChangeEnv();
      this.distributionValueChangeApp();
      this.distributionValueChangeCom();
    }

    this.getSelectedEnvironnements();
    this.subscriptions.push(this.filterSharedDataService.getData().subscribe(isDisabled => (this.isSearchDisabled = isDisabled)));
  }

  onChangeOrganisme(elements: any): void {
    const selectedEnvs: string[] = this.getSelectedEnvs();
    const selectedOrgs: string[] = Object.values(elements).map((e: any) => e.title);
    const param = { selectedEnvs: selectedEnvs, selectedOrgs: selectedOrgs };
    if (this.isDistribution) {
      // traitements pour les pages distributions
      this.distributionValueChangeOrg(param);
    } else {
      // sinon, envoyer le résultat au parent
      this.organismeChangeEvent.emit(param);
    }
  }

  valider() {
    this.sessionDataSearchService.updateDataSearchToSession(this.form.getRawValue());
    this.validerEvent.emit();
  }

  isFormValid() {
    return this.formEnv.valid && this.formOrg.valid && this.isFormApplicationValid() && this.isFormCommandeValid() && this.isFormFichierValid();
  }

  isFormApplicationValid(): boolean {
    return this.formApp.valid && this.applicationOptions.includes(this.formApp.value);
  }

  isFormCommandeValid(): boolean {
    return this.formCom?.valid || this.isWithoutCommandeOptions;
  }

  isFormFichierValid(): boolean {
    return this.formFic?.valid || this.isWithoutFichierOptions;
  }

  getSelectedEnvs() {
    const envs = this.formEnv.value;
    return Object.keys(envs).filter(k => envs[k]);
  }

  onChangeEnvironnement() {
    this.getSelectedEnvironnements();
  }

  getSelectedEnvironnements() {
    this.selectedEnvsTimeoutId = setTimeout(() => {
      if (this.isEnvOptionsInitialized) {
        const selectedEnvs = this.getSelectedEnvs();
        this.selectedEnvironnements.emit(selectedEnvs);
      }
    }, 500);
  }

  /** traitements pour les pages distributions */

  // get liste environnements
  distributionGetOptionsEnvs() {
    this.subscriptions.push(
      this.apiAdelaideFichierService
        .getDistinctEnvironnements()
        .pipe(
          switchMap(result => {
            return of(result);
          })
        )
        .subscribe((result: ApolloQueryResult<{ getDistinctEnvsFromFichier: string[] }>) => {
          result.data.getDistinctEnvsFromFichier.forEach(envCode => this.formEnv.addControl(envCode, new FormControl(false, null)));
          this.isEnvOptionsInitialized = true;
          this.getSelectedEnvironnements();
        })
    );
  }

  // écouter les changements sur la liste environnements
  distributionValueChangeEnv() {
    this.formEnv.valueChanges
      .pipe(
        switchMap(elm => {
          const selectedEnvs = Object.keys(elm).filter(k => elm[k]);
          return this.apiAdelaideFichierService.getDistinctOrgsByEnvs(this.apiAdelaideFichierService.getSearchFichierFilterQuery(selectedEnvs));
        })
      )
      .subscribe((result: ApolloQueryResult<SearchOrgByEnvDataInterface>) => {
        const organismes = result.data.getDistOrgByEnvFromFichier;
        const allOrgReg = result.data.allOrganismes as [AllOrganismeDtoInterface];
        SharedUtil.getOrgFormByOrgData(this.formOrg, organismes, allOrgReg, false, this.distributionListOfOldSelectedOrganismesCode);
        const param = { selectedOrgs: this.distributionListOfOldSelectedOrganismesCode };
        this.isOrgOptionsInitialized && this.distributionValueChangeOrg(param);
        this.isOrgOptionsInitialized = true;
      });
  }

  // écouter les changements sur la liste organismes
  distributionValueChangeOrg(event) {
    const selectedEnvs = event.selectedEnvs ? event.selectedEnvs : this.getSelectedEnvs();
    this.distributionListOfOldSelectedOrganismesCode = event.selectedOrgs;
    this.applicationOptions = [];
    if (!!selectedEnvs.length && !!event.selectedOrgs.length) {
      this.subscriptions.push(
        this.apiAdelaideFichierService
          .getDistAppsByEnvOrg(this.apiAdelaideFichierService.getSearchFichierFilterQuery(selectedEnvs, event.selectedOrgs))
          .pipe(
            switchMap(data => {
              return of(data);
            })
          )
          .subscribe((result: ApolloQueryResult<SearchAppByEnvOrgDataInterface>) => {
            this.applicationOptions = result.data.getDistAppByEnvOrgFromFichier;
            this.formApp.reset(this.distributionOldSelectedApplication, { emitEvent: true });
          })
      );
    } else {
      this.formApp.reset(false, { emitEvent: true });
    }

    this.distributionValueChangeOrgTimeoutId = setTimeout(() => {
      // pouvoir requêter sans rentrer une commande si une seule région est sélectionnée
      if (ArrayUtil.isSelectedOrgsInOneRegion(this.formOrg.getRawValue())) {
        this.formCom.setValidators([]);
      } else {
        this.formCom.setValidators([CustomValidators.required()]);
      }
      this.formCom.updateValueAndValidity();
    });
  }

  // écouter les changements sur la liste applications
  distributionValueChangeApp() {
    this.subscriptions.push(
      this.formApp.valueChanges
        .pipe(
          switchMap(selectedApp => {
            const selectedEnvs = this.getSelectedEnvs();
            const selectedOrgs = [];
            const rawOrg = this.formOrg.value;
            SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
            this.distributionOldSelectedApplication = selectedApp;
            return this.apiAdelaideFichierService.getDistComsByEnvOrgApp(
              this.apiAdelaideFichierService.getSearchFichierFilterQuery(selectedEnvs, selectedOrgs, selectedApp)
            );
          })
        )
        .subscribe((result: ApolloQueryResult<SearchComByEnvOrgAppDataInterface>) => {
          this.commandeOptions = result.data.getDistComByEnvOrgAppFromFichier;
          const selectedCom = this.formCom.value;
          if (!this.commandeOptions.includes(selectedCom)) {
            this.formCom.reset(false, { emitEvent: true });
          } else {
            this.formCom.reset(selectedCom, { emitEvent: true });
          }
        })
    );
  }

  // écouter les changements sur la liste commandes
  distributionValueChangeCom() {
    this.subscriptions.push(
      this.formCom.valueChanges
        .pipe(
          switchMap(() => {
            const selectedEnvs = this.getSelectedEnvs();
            const selectedOrgs = [];
            const rawOrg = this.formOrg.value;
            SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
            const selectedApp = this.formApp.value;
            const selectedCom = this.formCom.value;
            return this.apiAdelaideDistributionService.getDistFicsByEnvOrgAppCom(
              initExemplaireByFilterQuery(selectedEnvs, selectedOrgs, selectedApp, selectedCom, null)
            );
          })
        )
        .subscribe(result => {
          this.fichierOptions = [
            {
              value: '',
              columns: [
                { label: 'Fichier', value: '' },
                { label: 'Code Prd', value: '' },
                { label: 'Imprimé', value: '' },
              ],
            },
            ...result.data.getDistFicByEnvOrgAppComFromExemplaire.map((fichierInfo: FichierCodficRefImprimeCodeProdInterface) => ({
              value: fichierInfo.codfic,
              columns: [
                { label: 'Fichier', value: fichierInfo.codfic },
                { label: 'Code Prd', value: fichierInfo.codeProd },
                { label: 'Imprimé', value: fichierInfo.refImprime },
              ],
            })),
          ];
          this.formFic.reset('', { emitEvent: true });
        })
    );
  }

  ngOnDestroy(): void {
    clearTimeout(this.selectedEnvsTimeoutId);
    clearTimeout(this.distributionValueChangeOrgTimeoutId);
  }
}
