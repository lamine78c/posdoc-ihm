import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DistFicByEnvOrgAppComFromExemplaireInterface,
  FichierCodficRefImprimeCodeProdInterface,
  SearchOrgByEnvDataInterface,
  SearchAppByEnvOrgDataInterface,
  SearchComByEnvOrgAppDataInterface
} from '@app/models/fichier';
import { initExemplaireByFilterQuery } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { getFormIndex, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { ParametreEditionColonneSearchFilter } from '../../../model/parametre-edition-search-filter';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import { ApolloQueryResult } from '@apollo/client';
import { AllOrganismeDtoInterface } from '@app/models/organisme';
import { DataRessource, SearchRessourceByEnvOrgApComFicInterface } from '@app/exploitation-editique/reedition/reedition-produit/model/data-ressource';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';

@Component({
  selector: 'app-search-parametre-edition-colonne',
  templateUrl: './search-parametre-edition-colonne.component.html',
  styleUrls: ['./search-parametre-edition-colonne.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SearchParametreEditionColonneComponent implements OnInit {
  subscriptions: Subscription[] = [];

  optionsEnv$: Observable<string[]>;
  optionsApp$: Observable<string[]>;
  optionsCom$: Observable<string[]>;
  optionsFic$: Observable<{ value: string; columns: { label: string; value: string }[] }[]>;
  selectedOrgs$: BehaviorSubject<string[]> = new BehaviorSubject([]);
  optionsRes: string[] = [];
  selectedEnv: string;
  selectedOrgs: string[];
  selectedApp: string;
  selectedCom: string;
  selectedFics: string[] = [];
  selectedRes: string[];

  form: FormGroup;
  formEnv: FormControl;
  formOrg: FormGroup;
  formApp: FormControl;
  formCom: FormControl;
  formFic: FormControl;
  formRes: FormGroup;

  formName = getFormName();
  indexForm = getFormIndex();

  isEnvOptionsInitialized = false;
  isOrgOptionsInitialized = false;
  isMaxResourcesReached = false;

  @Output()
  applySearchEvent = new EventEmitter<ParametreEditionColonneSearchFilter>();

  private readonly fb = inject(FormBuilder);
  private readonly apiAdelaideDistributionService = inject(ApiAdelaideDistributionService);
  private readonly sessionDataSearchService = inject(SessionDataSearchService);
  private readonly apiAdelaideFichierService = inject(ApiAdelaideFichierService);

  constructor() {
    // Do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.initFormOptions();
  }

  initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: ['', CustomValidators.required()],
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.COMMANDE]: ['', CustomValidators.required()],
      [this.formName.FICHIER]: [[], CustomValidators.oneRequired()],
      ressources: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      ressourcesAbsentes: [true],
      message: [''],
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormControl;
    this.formRes = this.form.get('ressources') as FormGroup;
  }

  initFormOptions(): void {
    this.initFormEnvOptions();
    this.initFormOrgOptions();
    this.initFormAppOptions();
    this.initFormComOptions();
    this.initFormFicOptions();
    this.initRessourceOptions();
  }

  initFormEnvOptions(): void {
    this.optionsEnv$ = this.apiAdelaideFichierService
      .getDistinctEnvironnements()
      .pipe(
        take(1),
        map((result: ApolloQueryResult<{ getDistinctEnvsFromFichier: string[] }>) => result.data.getDistinctEnvsFromFichier),
      );
  }

  initFormOrgOptions(): void {
    this.subscriptions.push(
      this.formEnv.valueChanges
        .pipe(
          switchMap(env => {
            this.selectedEnv = env;
            return this.apiAdelaideFichierService.getDistinctOrgsByEnvs(this.apiAdelaideFichierService.getSearchFichierFilterQuery([this.selectedEnv]));
          })
        )
        .subscribe((result: ApolloQueryResult<SearchOrgByEnvDataInterface>) => {
          const organismes = result.data.getDistOrgByEnvFromFichier;
          const allOrgReg = result.data.allOrganismes as [AllOrganismeDtoInterface];
          SharedUtil.getOrgFormByOrgData(this.formOrg, organismes, allOrgReg, false);
          this.isOrgOptionsInitialized = true;
        })
    );
  }

  initFormAppOptions(): void {
    this.optionsApp$ = this.selectedOrgs$.pipe(
      switchMap((selectedOrgs: string[]) => {
        this.selectedOrgs = selectedOrgs;
        return this.apiAdelaideFichierService.getDistAppsByEnvOrg(this.apiAdelaideFichierService.getSearchFichierFilterQuery([this.selectedEnv], selectedOrgs));
      }),
      map((result: ApolloQueryResult<SearchAppByEnvOrgDataInterface>) => result.data.getDistAppByEnvOrgFromFichier),
      tap(optionsApp => {
        if (optionsApp.includes(this.selectedApp)) {
          this.formApp.reset(this.selectedApp, { emitEvent: true });
        } else {
          this.formApp.reset(null, { emitEvent: true });
        }
      }),
      startWith([])
    );
  }

  initFormComOptions(): void {
    this.optionsCom$ = this.formApp.valueChanges.pipe(
      switchMap(selectedApp => {
        if (selectedApp) {
          this.selectedApp = selectedApp;
        }
        return this.apiAdelaideFichierService.getDistComsByEnvOrgApp(this.apiAdelaideFichierService.getSearchFichierFilterQuery([this.selectedEnv], this.selectedOrgs, selectedApp));
      }),
      map((result: ApolloQueryResult<SearchComByEnvOrgAppDataInterface>) => result.data.getDistComByEnvOrgAppFromFichier),
      tap(optionsCom => {
        if (optionsCom.includes(this.selectedCom)) {
          this.formCom.setValue(this.selectedCom, { emitEvent: true });
        } else {
          this.formCom.setValue(null, { emitEvent: true });
        }
      }),
      startWith([])
    );
  }

  initFormFicOptions(): void {
    this.optionsFic$ = this.formCom.valueChanges.pipe(
      switchMap(selectedCom => {
        if (selectedCom) {
          this.selectedCom = selectedCom;
        }
        return this.apiAdelaideDistributionService.getDistFicsByEnvOrgAppCom(
          initExemplaireByFilterQuery([this.selectedEnv], this.selectedOrgs, this.selectedApp, selectedCom, null)
        );
      }),
      map((result: ApolloQueryResult<DistFicByEnvOrgAppComFromExemplaireInterface>) => {
        return [
          ...result.data.getDistFicByEnvOrgAppComFromExemplaire.map((fichierInfo: FichierCodficRefImprimeCodeProdInterface) => ({
            value: fichierInfo.codfic,
            columns: [
              { label: 'Fichier', value: fichierInfo.codfic },
              { label: 'Code Prd', value: fichierInfo.codeProd },
              { label: 'Imprimé', value: fichierInfo.refImprime },
            ],
          })),
        ];
      }),
      tap(optionsFic => {
        if (optionsFic.length === 0) {
          this.formFic.setValue([], { emitEvent: true });
        } else {
          const selectableFics = this.selectedFics.filter(fic => optionsFic.find(option => option.value === fic));
          this.formFic.setValue(selectableFics, { emitEvent: true });
        }
      }),
      startWith([])
    );
  }

  initRessourceOptions(): void {
    this.subscriptions.push(
      this.formFic.valueChanges
        .pipe(
          switchMap((selectedFics: string[]) => {
            if (selectedFics && selectedFics.length > 0) {
              this.selectedFics = selectedFics;
            }
            return this.apiAdelaideDistributionService.getDistRessourceByEnvOrgAppComFic(
              initExemplaireByFilterQuery([this.selectedEnv], this.selectedOrgs, this.selectedApp, this.selectedCom, selectedFics)
            );
          }),
          map((result: ApolloQueryResult<SearchRessourceByEnvOrgApComFicInterface>) => result.data.getDistRessourceByEnvOrgAppComFicFromExemplaire)
        )
        .subscribe((data: DataRessource[]) => {
          this.optionsRes.forEach(option => this.formRes.removeControl(option));
          this.formRes.reset(null, { emitEvent: false });
          data.forEach(res => {
            const option = `${res.codgam}/${res.codsit}/${res.codres}`;
            this.optionsRes.push(option);
            this.formRes.addControl(option, new FormControl(false, null));
          });
        })
    );
  }

  onChangeOrganisme(elements: any) {
    this.selectedOrgs$.next(Object.values(elements).map((e: any) => e.title));
  }

  onChangeResource(selectedResources): void {
    this.selectedRes = selectedResources.map(res => res.title);
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  valider(): void {
    const data: ParametreEditionColonneSearchFilter = this.form.getRawValue();
    this.sessionDataSearchService.updateDataSearchToSession(data);

    data.organisme = this.selectedOrgs;
    data.ressources = this.selectedRes;
    data.message = data.message === '' ? null : data.message;
    this.applySearchEvent.emit(data);
  }
}
