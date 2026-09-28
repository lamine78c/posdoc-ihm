import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, UntypedFormArray, AbstractControl } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { Commande } from '@app/models/commande';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { DataService } from '@app/shared/utils/data.service';
import { Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, ONE_HUNDRED_FIFTY, ONE_THOUSAND, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-add-commande-modal',
  templateUrl: './add-commande-modal.component.html',
  styleUrls: ['./add-commande-modal.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class AddCommandeModalComponent implements OnInit, OnDestroy {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  /**   * Titre de la popup   */
  @Input() title: string;
  /**   * Label et icône du premier bouton (En partant de la droite)   * Champ optionnel, sera affiché par défaut "Confirmer"   */
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  /**   * Label et icône du premier bouton (En partant de la droite)   * Champ optionnel, sera affiché par défaut "Abandonner"   */
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };
  /**   * Validité du formulaire, désactive le premier bouton si faux.   * Champ optionnel   */
  @Input() isFormValid = true;
  /**   * afficher le popup compléter */
  @Input() isCompleteStep = false;

  @Input() selectedNode: any;
  @Input() commandes: any = [];

  @Output() passEntry = new EventEmitter<any>();

  showSpinner: boolean;
  formGroup: FormGroup = new FormGroup({});
  orgGroup: FormGroup = new FormGroup({});
  regionsList: any = [];
  organismesReg: any = [];
  regions: any[];
  applications: any[];
  filtredApplications: any[];
  filtredApplicationsByApp: any[];
  organismes: any[];
  size = ONE_THOUSAND;
  labelWidth = ONE_HUNDRED_FIFTY;
  organismesSelected: any[] = [];
  createCommandesNumber = ONE;

  subscriptions: Subscription[] = [];

  errorForm: string;
  environnementsList: { value: string; text: string }[] = [];
  applicationsList: { value: string; text: string }[] = [];
  codeEnvironnement = '';
  formArrayApp: UntypedFormArray = new UntypedFormArray([]);
  codeApplication = '';
  commandeSelected: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiAdelaideCommandeService: ApiAdelaideCommandeService,
    private readonly noteService: NotesService,
    private readonly dataService: DataService,
    private readonly filterSharedDataService: FilterSharedDataService
  ) {}

  ngOnInit(): void {
    const serverData = this.dataService.getServerData();
    if (!!serverData && serverData.action === 'add') {
      this.regions = serverData.regions;
      this.applications = serverData.applications;
      this.environnementsList = serverData.environnements;
      this.organismes = serverData.organismes;
    } else {
      this.subscriptions.push(
        this.apiAdelaideCommandeService.getAPIsForAddCommande().pipe(take(1)).subscribe((api: any) => {
          this.regions = api.data.allRegions;
          this.applications = api.data.allApplications;
          this.environnementsList = api.data.allEnvironnementsInApplication.map(e => ({
            value: e.code,
            text: e.code,
          }));
          this.organismes = api.data.allOrganismes;
          // Update the data in the service after both requests are complete
          this.dataService.setServerData({
            action: 'add',
            regions: this.regions,
            applications: this.applications,
            environnements: this.environnementsList,
            organismes: this.organismes,
          });
        })
      );
    }

    this.formGroup = this.fb.group({
      commande: [
        { value: this.isCompleteStep ? this.selectedNode.data.code : '', disabled: this.isCompleteStep },
        CustomValidators.lenghtValidation(4, 4),
      ],
      designation: [
        { value: this.isCompleteStep ? this.selectedNode.data.libelle : '', disabled: this.isCompleteStep },
        CustomValidators.lenghtValidation(1, 50),
      ],
      environnements: [this.codeEnvironnement, CustomValidators.required()],
      applications: [this.codeApplication, CustomValidators.required()],
    });
    this.formArrayApp = this.fb.array([this.fb.group({})]);
    if (this.selectedNode) {
      const data = this.selectedNode.data;
      const commande: Commande = new Commande(data.code, data.libelle, data.codenv, data.codorg, data.codapp);
      this.commandeSelected = commande;
    }

    this.subscriptions.push(
      this.formGroup.get('commande').valueChanges.subscribe(() => !!this.codeApplication && this.getRegions())
    );
  }

  getOrganismesControl(): AbstractControl<any, any> {
    if (!this.codeEnvironnement || !this.codeApplication) {
      return new FormGroup({});
    }
    return this.orgGroup;
  }

  getRegions() {
    this.orgGroup = new FormGroup({});
    this.regionsList = this.regions.map(r => r.libelle);

    const organismes: any[] = this.organismes.filter(o => this.filtredApplications.some(a => a.codeOrganisation == o.code));

    const listOfCommandesWithTheSameEntry: any[] = this.commandes.filter(
      c =>
        organismes.some(o => o.code == c.codorg) &&
        c.codapp == this.codeApplication &&
        c.codenv == this.codeEnvironnement &&
        c.code == this.formGroup.get('commande').value
    );

    this.organismesReg = organismes.filter(o => !listOfCommandesWithTheSameEntry.some(c => c.codorg == o.code));

    SharedUtil.getOrgFormByOrgData(
      this.orgGroup,
      organismes.map(o => o.code),
      this.organismesReg,
      false
    );
  }

  getApplicationsByEnvs(codeEnv?: string) {
    this.filtredApplicationsByApp = this.applications.filter(application => application.codeEnvironnement == codeEnv);
    SharedUtil.getUniqueListAsObservable(
      this.applications.filter(application => application.codeEnvironnement == codeEnv),
      'code'
    ).subscribe(applicationsCode => (this.applicationsList = applicationsCode.map(code => ({ value: code, text: code }))));
  }

  onChangeApplication(code) {
    this.codeApplication = code;
    this.filtredApplications = this.filtredApplicationsByApp.filter(application => application.code == code);
    if (!code) {
      this.codeApplication = '';
    } else {
      this.getRegions();
    }
  }

  onChangeOrganisme(event) {
    this.organismesSelected = [];
    let elementSelectedList: any = [];
    elementSelectedList = event;
    elementSelectedList.forEach(element => {
      const elementCode = element.title.split('-', ONE);
      this.organismesSelected.push(elementCode[ZERO].replace(/\s/g, ''));
    });
  }

  onChangeEnvironnement(code) {
    this.applicationsList = [];
    this.codeEnvironnement = code;
    this.orgGroup = new FormGroup({});
    if (this.codeEnvironnement) {
      this.getApplicationsByEnvs(this.codeEnvironnement);
      !!this.codeApplication && this.onChangeApplication(this.codeApplication);
    }
  }

  getApplicationsControl(): any {
    if (this.codeApplication) {
      this.formGroup.patchValue({ applications: this.applicationsList.some(app => app.value == this.codeApplication) ? this.codeApplication : '' });
    }
    return this.formGroup.get('applications');
  }

  closePopup() {
    this.modalRef.close();
  }

  isOrganismeFormGroupValid(): boolean {
    return Object.values(this.orgGroup.controls)
      .flatMap((control: AbstractControl) => Object.values(control.value))
      .some((value: boolean) => value);
  }

  passBack() {
    this.errorForm = '';
    if (!this.isOrganismeFormGroupValid() || !this.formGroup.valid) {
      this.errorForm = "Le formulaire n'est pas valide veuillez remplir tous les champs";
      return;
    } else {
      this.showSpinner = true;
    }

    let codeCommande: string;
    let libelleCommande: string;
    if (this.isCompleteStep) {
      codeCommande = this.selectedNode.data.code;
      libelleCommande = this.selectedNode.data.libelle;
    } else if (!this.isCompleteStep) {
      codeCommande = this.formGroup.value['commande'];
      libelleCommande = this.formGroup.value['designation'];
    }
    const createDTO: Commande = new Commande(codeCommande, libelleCommande, this.codeEnvironnement, '', '');
    const createsDTO: any = [];
    let createdDTO: any = [];

    // to Commande entity
    this.organismesSelected.forEach(org => {
      createsDTO.push(new Commande(createDTO.code, createDTO.libelle, createDTO.codenv, org, this.codeApplication));
    });

    this.subscriptions.push(
      this.apiAdelaideCommandeService.createCommandes(createsDTO).subscribe({
        next: data => {
        // Relance la recherche sur l'écran 'Commande' avec les données de la nouvelle commande créée
        this.dataService.setDataToTransfer({
          environnement: this.codeEnvironnement,
          organisme: this.organismesSelected,
          application: this.codeApplication,
        });

        createdDTO = (data as any).data.createCommandes;
        this.createCommandesNumber = createdDTO.length;
        if (this.createCommandesNumber != 0) {
          this.modalRef.close();
        }

        this.passEntry.emit({ createCommandesNumber: this.createCommandesNumber, createdDTO: createdDTO });
        this.noteService.show({
          title:
            this.createCommandesNumber == ONE
              ? 'La commande "' +
                createdDTO[0].codenv +
                '-' +
                createdDTO[0].codorg +
                '-' +
                createdDTO[ZERO].codapp +
                '-' +
                createdDTO[ZERO].code +
                '" a été ajoutée avec succès'
              : this.createCommandesNumber + ' ' + 'commandes ont été ajoutées avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        this.showSpinner = false;
      },
        error: error => {
          this.errorForm = error.graphQLErrors[ZERO].message;
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.filterSharedDataService.updateData(false);
  }
}
