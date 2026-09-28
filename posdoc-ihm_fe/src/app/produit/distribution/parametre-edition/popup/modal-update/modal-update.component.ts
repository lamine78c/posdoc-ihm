import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, debounceTime, Observable, Subscription, take } from 'rxjs';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import {
  ParamsEnvOrgsAppInterface,
  RessourceDataInterface,
  RessourceInterface,
} from '@app/models/gestion-fichier-edition/parametre-edition/params-env-orgs-app-interface';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { PermissionService } from '@app/services/permission/permission.service';
import { DELAI_VALUE_CHANGE, ONE, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-modal-update',
  templateUrl: './modal-update.component.html',
  styleUrls: ['./modal-update.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ModalUpdateComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() selectedNodes: any;
  @Input() siteOptions$: Observable<string[]>;
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };
  @Input() allRessources;
  @Input() allOrganismes;
  @Input() codeOrgOGUR: string;
  @Output() updateMasse = new EventEmitter<RessourceDataInterface>();
  @Output() updateMasseEtat = new EventEmitter<boolean>();
  @Output() updateMasseMessage = new EventEmitter<string>();
  @Output() updateMasseSite = new EventEmitter<string>();

  form: FormGroup;
  formEtat: FormGroup;
  formMessage: FormGroup;
  formSite: FormGroup;
  ressourceOptionsPayload: ParamsEnvOrgsAppInterface;
  selectedEnvs: string[] = [];
  selectedFics: string[] = [];
  ressourcesLength: number;
  ressources: RessourceInterface[] = [];

  // Subjects pour stocker les options
  gammeOptionsSubject = new BehaviorSubject<string[]>([]);
  ressourceOptionsSubject = new BehaviorSubject<string[]>([]);
  destinataireOptionsSubject = new BehaviorSubject<string[]>([]);

  // Exposer les Observables pour le | async dans le template
  gammeOptions$: Observable<string[]> = this.gammeOptionsSubject.asObservable();
  ressourceOptions$: Observable<string[]> = this.ressourceOptionsSubject.asObservable();
  destinataireOptions$: Observable<string[]> = this.destinataireOptionsSubject.asObservable();

  subscriptions: Subscription[] = [];

  selectedGamme: string;
  adminExemplaires: string[] = [];
  isOngletEtatActif = false;
  isOngletRessourceActif = true;
  isOngletMessageActif = false;
  isOngletSiteActif = false;
  errorFormSite = false;
  msgErrorFormSite;
  showFormRessource = true;
  showFormSite = true;
  showFormEtat = true;
  showFormMessage = true;
  msgErrorOngletRessource;
  msgErrorOngletSite;
  msgErrorOngletEtat;
  msgErrorOngletMessage;

  constructor(
    private fb: FormBuilder,
    private apiAdelaideDistributionService: ApiAdelaideDistributionService,
    private servicePerm: PermissionService
  ) {}

  ngOnInit(): void {
    this.initConditions();
    this.initFormRessource();
    this.initFormEtat();
    this.initFormMessage();
    this.initFormSite();
  }

  initConditions() {
    if (this.selectedNodes) {
      this.selectedEnvs = [...new Set(this.selectedNodes.map(node => node.data.codenv) as string[])];
      this.selectedFics = [...new Set(this.selectedNodes.map(node => node.data.codfic) as string[])];
      if (this.selectedEnvs.length > ONE) {
        this.msgErrorOngletRessource = "La modification de masse n'est pas possible si plusieurs environnements sont sélectionnés.";
        this.showFormRessource = false;
        this.msgErrorOngletMessage = this.msgErrorOngletRessource;
        this.showFormMessage = false;
      }
      if (this.selectedFics.length > ONE) {
        this.msgErrorOngletSite = "La modification de masse n'est pas possible si plusieurs fichiers sont sélectionnés.";
        this.showFormSite = false;
      }
    }
    if (!this.servicePerm.hasProfileAdmin()) {
      this.getAdminExemplaires();
    }
  }

  initFormRessource() {
    this.form = this.fb.group({
      codgam: ['', CustomValidators.required()],
      codres: ['', CustomValidators.required()],
      coddes: [''],
    });
    this.loadRessources();
  }

  initFormEtat() {
    this.formEtat = this.fb.group({
      etat: [false],
    });
  }

  initFormMessage() {
    this.formMessage = this.fb.group({
      ficatt: [''],
    });
  }

  initFormSite() {
    this.formSite = this.fb.group({
      site: ['', CustomValidators.required()],
    });
    this.onChangeSite();
  }

  onChangeSite() {
    this.subscriptions.push(
      this.formSite
        .get('site')
        .valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE))
        .subscribe(siteSelected => this.checkRessourceFromSite(siteSelected))
    );
  }

  checkRessourceFromSite(siteSelected) {
    this.errorFormSite = false;
    this.msgErrorFormSite = '';
    let noChange = true;
    let noRessource = false;
    if (siteSelected && this.selectedNodes) {
      this.selectedNodes.forEach(rowNode => {
        if (rowNode.data.codsit !== siteSelected) {
          noChange = false;
        }
        if (!this.isRessourceDispo(rowNode.data, siteSelected)) {
          noRessource = true;
        }
      });
      if (noChange) {
        this.errorFormSite = true;
        this.msgErrorFormSite = "Aucune modification n'est détectée";
      } else if (noRessource) {
        this.errorFormSite = true;
        this.msgErrorFormSite = "Vous ne pouvez pas poursuivre la modification de votre sélection, car certaines ressources n'existent pas.";
      }
      if (this.errorFormSite) {
        this.formSite.get('site').setErrors({
          isError: true,
          message: this.msgErrorFormSite,
        });
      }
    }
  }

  private isRessourceDispo(row, siteSelected) {
    return this.allRessources.find(
      res => this.isRessourceExist(row, res, siteSelected) && (this.servicePerm.hasProfileAdmin() || res.profil !== 'A')
    );
  }

  private isRessourceExist(row, res, siteSelected) {
    return (
      row.codenv === res.codeEnvironnement &&
      row.codapp === res.codeApplication &&
      row.codgam === res.codeGamme &&
      row.codres === res.codeRessource &&
      [this.codeOrgOGUR, row.codorg].includes(res.codeOrganisme) &&
      siteSelected === res.codeSite
    );
  }

  private loadRessources() {
    if (this.showFormRessource) {
      this.getRessourcesByCodeEnvOrgsApp();
      this.getCodeDestinatairesByCodeOrgs();
    }
  }

  private getRessourcesByCodeEnvOrgsApp() {
    this.getRessourceOptionsPayload();
    this.subscriptions.push(
      this.apiAdelaideDistributionService.getRessourcesByCodeEnvOrgsApp(this.ressourceOptionsPayload).pipe(take(1)).subscribe(response => {
        this.ressources = response.data.getRessourcesByCodeEnvOrgsApp;
        this.gammeOptionsSubject.next([...new Set(this.ressources.map(ressource => ressource.codgam))].sort((a, b) => a.localeCompare(b)));
        this.ressourcesLength = this.ressources.length;
        if (this.ressourcesLength === ZERO) {
          this.msgErrorOngletRessource = "La modification de masse n'est pas possible pour des exemplaires de périmètre différent.";
          this.showFormRessource = false;
        }
      })
    );
  }

  private getCodeDestinatairesByCodeOrgs() {
    this.subscriptions.push(
      this.apiAdelaideDistributionService.getCodeDestinatairesByCodeOrgs(this.ressourceOptionsPayload.codorgs).pipe(take(1)).subscribe(response => {
        const destinataires = response.data.getCodeDestinatairesByCodeOrgs;
        this.destinataireOptionsSubject.next([...new Set(destinataires)].sort((a, b) => a.localeCompare(b)));
      })
    );
  }

  private getRessourceOptionsPayload(): ParamsEnvOrgsAppInterface {
    const selectedNodes = this.selectedNodes ? this.selectedNodes : [];

    this.ressourceOptionsPayload = {
      codenv: this.selectedEnvs[ZERO],
      codorgs: [...new Set(selectedNodes.map(node => node.data.codorg) as string[])],
      codapp: [...new Set(selectedNodes.map(node => node.data.codapp) as string)].shift(),
      isProfilAdmin: this.servicePerm.hasProfileAdmin(),
    };

    return this.ressourceOptionsPayload;
  }

  private getAdminExemplaires(): void {
    if (this.selectedNodes) {
      this.adminExemplaires = this.selectedNodes
        .filter(node => node.data.isAdmin)
        .map(node => `${node.data.codorg}-${node.data.codeProd}-${node.data.codfic}-${node.data.codgam}-${node.data.codsit}-${node.data.codres}`);
      if (this.adminExemplaires.length > ZERO) {
        this.msgErrorOngletRessource = 'Vous ne pouvez pas modifier les exemplaires suivants :';
        this.showFormRessource = false;
        this.msgErrorOngletSite = this.msgErrorOngletRessource;
        this.showFormSite = false;
        this.msgErrorOngletEtat = this.msgErrorOngletRessource;
        this.showFormEtat = false;
      }
    }
  }

  onGammeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedGamme = target.value.split(':')[ONE]?.trim();

    this.updateFilteredOptions();
  }

  private updateFilteredOptions() {
    if (this.selectedGamme !== null) {
      const filteredRessources = this.ressources.filter(ressource => ressource.codgam === this.selectedGamme).map(ressource => ressource.codres);
      this.ressourceOptionsSubject.next([...new Set(filteredRessources)].sort((a, b) => a.localeCompare(b)));
    }
  }

  toEditEtat() {
    this.isOngletEtatActif = true;
    this.isOngletRessourceActif = false;
    this.isOngletMessageActif = false;
    this.isOngletSiteActif = false;
  }

  toEditRessource() {
    this.isOngletEtatActif = false;
    this.isOngletRessourceActif = true;
    this.isOngletMessageActif = false;
    this.isOngletSiteActif = false;
  }

  toEditMessage() {
    this.isOngletEtatActif = false;
    this.isOngletRessourceActif = false;
    this.isOngletMessageActif = true;
    this.isOngletSiteActif = false;
  }

  toEditSite() {
    this.isOngletEtatActif = false;
    this.isOngletRessourceActif = false;
    this.isOngletMessageActif = false;
    this.isOngletSiteActif = true;
  }

  updateMasseExemplaire() {
    if (this.isFormValid()) {
      const ressourceData: RessourceDataInterface = this.form.getRawValue();
      this.updateMasse.emit(ressourceData);
    }
  }

  updateEtat() {
    this.updateMasseEtat.emit(this.formEtat.get('etat').value);
  }

  updateMessage() {
    this.updateMasseMessage.emit(this.formMessage.get('ficatt').value);
  }

  updateSite() {
    this.updateMasseSite.emit(this.formSite.get('site').value);
  }

  isFormValid() {
    return this.form.valid;
  }

  closePopup() {
    this.modalRef.close();
  }
}
