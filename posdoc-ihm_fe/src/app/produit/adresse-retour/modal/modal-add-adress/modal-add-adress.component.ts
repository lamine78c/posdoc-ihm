import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, AbstractControl, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { AdresseRetourDTO } from '@app/models/adresseRetour';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, Subscription } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-modal-add-adress',
  templateUrl: './modal-add-adress.component.html',
  styleUrls: ['./modal-add-adress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
@AutoUnsubscribe
export class ModalAddAdressComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() organismes: any;
  @Input() applications: any;
  @Input() allAdressesRetourId: any = [];
  @Output() passEntry = new EventEmitter<any>();

  subscriptions: Subscription[] = [];

  labelWidth = 151;

  formGroup: UntypedFormGroup = new UntypedFormGroup({});
  orgGroup: UntypedFormGroup;
  envGroup: UntypedFormGroup;

  organismesSelected: any = [];
  organismesSelectedLast: any = [];
  applicationsList: { value: string; text: string }[] = [];

  environnementSelected: any = [];
  applicationSelected: string;
  applicationSelectedLast: string;
  codeAdresse: string;

  errorPass: string;
  createAdressesRetourNumber: number = 1;

  // Variable pour forcer la réinitialisation complète du composant liste-deroulante-hierarchisee
  showOrganismesComponent = true;

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly apiAdelaideAdresseService: ApiAdelaideAdresseRetourService = inject(ApiAdelaideAdresseRetourService);
  private readonly noteService: NotesService = inject(NotesService);
  private readonly filterSharedDataService: FilterSharedDataService = inject(FilterSharedDataService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    // do nothing
  }

  ngOnDestroy(): void {
    this.filterSharedDataService.updateData(false);
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      organismes: this.orgGroup,
      environnement: this.envGroup,
      application: [this.applicationSelected, null],
      codeAdresse: ['', CustomValidators.lenghtValidation(1, 8)],
      adresse1: ['', CustomValidators.lenghtValidation(0, 38)],
      adresse2: ['', CustomValidators.lenghtValidation(0, 38)],
      adresse3: ['', CustomValidators.lenghtValidation(0, 38)],
      adresse4: ['', CustomValidators.lenghtValidation(0, 38)],
    });

    this.getEnvironnements();
    this.getApplications();
    this.getOrganismes();
    this.subscriptions.push(
      this.formGroup
        .get('codeAdresse')
        .valueChanges.pipe(debounceTime(300))
        .subscribe(event => this.onChangeCodeAdresse(event))
    );
  }

  onChangeEnvironnement(event) {
    this.environnementSelected = event.map(e => e.title);
    this.getApplications();
    this.getOrganismes();
  }

  onChangeApplication(event) {
    this.applicationSelected = event;
    this.applicationSelectedLast = event;
    this.getOrganismes();
  }

  onChangeCodeAdresse(event) {
    this.codeAdresse = event;
    if (this.organismesSelected.length > 0) {
      this.organismesSelected = [];
      this.organismesSelectedLast = [];

      // Forcer la destruction complète du composant liste-deroulante-hierarchisee
      this.showOrganismesComponent = false;
      this.cdr.detectChanges();

      // Recréer le composant avec un nouveau formulaire vide
      setTimeout(() => {
        this.orgGroup = new UntypedFormGroup({});
        this.getOrganismes();
        this.showOrganismesComponent = true;
        this.cdr.detectChanges();
      }, 0);
    } else {
      this.getOrganismes();
    }
  }

  onChangeOrganisme(event) {
    this.organismesSelected = [];
    event.map(element => this.organismesSelected.push(element.title));
    this.organismesSelectedLast = this.organismesSelected;
  }

  getEnvironnements() {
    this.envGroup = new UntypedFormGroup({});
    this.environnementSelected = [];
    this.applications.map(app => {
      this.envGroup.addControl(app.codeEnvironnement, new UntypedFormControl(false, null));
    });
  }

  getApplications() {
    this.applicationsList = [];
    this.applicationSelected = undefined;
    if (this.environnementSelected.length > 0) {
      // get application liste selon environnements selectionnés
      this.applications.map(app => {
        if (
          this.environnementSelected.some(codeEnv => codeEnv == app.codeEnvironnement) &&
          !this.applicationsList.some(appList => appList.value == app.code)
        ) {
          this.applicationsList.push({ value: app.code, text: app.code });
        }
      });
      this.applicationsList.sort((a, b) => a.text.localeCompare(b.text));
      // automatise les applications selectionnées la dernière fois
      if (!!this.applicationSelectedLast && this.applicationsList.some(e => e.value === this.applicationSelectedLast)) {
        this.applicationSelected = this.applicationSelectedLast;
      }
    }
  }

  getOrganismes() {
    this.orgGroup = new UntypedFormGroup({});
    this.organismesSelected = [];
    if (this.environnementSelected.length > 0 && !!this.applicationSelected) {
      // get organisme liste selon environnements/applications selectionnés
      const organismes = this.organismes.filter(o =>
        this.applications.some(
          app =>
            o.code == app.codeOrganisation &&
            this.environnementSelected.some(codeEnv => codeEnv == app.codeEnvironnement) && // filtre avec environnement
            this.applicationSelected == app.code && // filtre avec application
            (!this.codeAdresse ||
              (!!this.codeAdresse && // filtre les organismes existes par codeAdresse
                !this.allAdressesRetourId.some(id => id.code == this.codeAdresse && id.codeOrganisme == app.codeOrganisation)))
        )
      );
      // // mise en forme organisme
      if (organismes.length > 0) {
        SharedUtil.getOrgFormByOrgData(this.orgGroup, [...new Set(organismes.map(item => item.code))] as string[], this.organismes, false);
        // automatise les organismes selectionnés la dernière fois
        if (this.organismesSelectedLast.length > 0) {
          this.organismesSelected = this.organismesSelectedLast.filter(orgSeled => organismes.some(o => o.code == orgSeled));
        }
        // mettre à true si l'organisme a été selectionné dans formulaire
        // ...à revoir si besoins
      }
    }
  }

  getEnvironnementsControl(): AbstractControl<any, any> {
    return this.envGroup;
  }
  getApplicationsControl(): AbstractControl<any, any> {
    if (!!this.applicationSelected) {
      this.formGroup.patchValue({ application: this.applicationSelected });
    }
    return this.formGroup.get('application');
  }
  getOrganismesControl(): AbstractControl<any, any> {
    if (!!this.organismesSelected) {
      this.formGroup.patchValue({ organisme: this.organismesSelected });
    }
    return this.orgGroup;
  }

  isFormValid() {
    this.orgGroup.setErrors(null);
    if (this.organismesSelected.length < 1) {
      this.orgGroup.setErrors({
        isError: true,
        message: 'Veuillez choisir les organismes à attacher.',
      });
    }
    return this.formGroup.valid && this.orgGroup.valid;
  }

  closePopup() {
    this.modalRef.close();
  }

  passBack() {
    this.errorPass = '';

    let createsDTO: any = [];
    let createdDTO: any = [];
    let adresseIdExist: any = [];
    let titleMsgOk: string = '';

    this.organismesSelected.map(org => {
      // check addresse existe
      this.allAdressesRetourId.filter(id => id.code == this.formGroup.value['codeAdresse'] && id.codeOrganisme == org)[0]
        ? adresseIdExist.push({ code: this.formGroup.value['codeAdresse'], codeOrganisme: org })
        : createsDTO.push(
            new AdresseRetourDTO(
              this.codeAdresse,
              org,
              this.formGroup.value['adresse1'],
              this.formGroup.value['adresse2'],
              this.formGroup.value['adresse3'],
              this.formGroup.value['adresse4']
            )
          );
    });

    this.subscriptions.push(
      this.apiAdelaideAdresseService.createAdressesRetour(createsDTO).subscribe({
        next: data => {
          createdDTO = (data as any).data.createAdressesRetour;
          this.createAdressesRetourNumber = createdDTO.length;
          if (this.createAdressesRetourNumber != 0) {
            this.modalRef.close();
          }

          titleMsgOk =
            this.createAdressesRetourNumber == 1
              ? "L'adresse retour a été ajoutée avec succès. "
              : this.createAdressesRetourNumber + ' ' + 'adresses retour ont été ajoutées avec succès.';
          if (createdDTO.length != createsDTO.length) {
            titleMsgOk += ' Les adresses retour existants ne sont pas modifiés.';
          }

          this.passEntry.emit(this.createAdressesRetourNumber);
          this.noteService.show({
            title: titleMsgOk,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          this.errorPass = error.graphQLErrors[0].message;
        },
      })
    );
  }
}
