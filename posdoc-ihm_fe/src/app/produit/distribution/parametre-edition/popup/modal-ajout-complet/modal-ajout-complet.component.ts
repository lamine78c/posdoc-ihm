import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Exemplaire } from '@app/models/exemplaire';
import { initSearchByEnvsOrgsAppProfilInput } from '@app/models/payload/search-by-envs-orgs-app-profil';
import { initSearchOrgByEnvAppComFicsInput } from '@app/models/payload/search-org-by-env-app-com-fics';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { ApiAdelaideDestinataireService } from '@app/services/api-adelaide-destinataire.service';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE, getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription, take } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-modal-ajout-complet',
  templateUrl: './modal-ajout-complet.component.html',
  styleUrls: ['./modal-ajout-complet.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ModalAjoutCompletComponent implements OnInit {
  @Input() title: string;
  @Input() selectedValues;
  @Output() passEntry = new EventEmitter<any>();

  form: FormGroup;
  optionsEnv = [];
  optionsApp = [];
  optionsCom = [];
  optionsFic = [];
  optionsDes = [];

  formName = getFormName();

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formCom: FormControl;
  formFic: FormGroup;
  formDes: FormControl;
  formCop: FormControl;
  formRes: FormGroup;
  formEtat: FormControl;
  formMsg: FormControl;

  allOrgReg: [{ code: string; codeRegion: string; codeSite?: string; libelle?: string }];
  allDestOrg: [{ code: string; codeOrg: string }];
  codeOrgOGUR;
  ressourcesList = [];
  subscriptions: Subscription[] = [];
  isInitWithSelectedValues = false;

  private readonly fb = inject(FormBuilder);
  public readonly activeModal = inject(NgbActiveModal);
  private readonly apiCommandeService = inject(ApiAdelaideCommandeService);
  private readonly apiDestinataireService = inject(ApiAdelaideDestinataireService);
  private readonly apiFichierService = inject(ApiAdelaideFichierService);
  private readonly apiAdelaideDistibutionService = inject(ApiAdelaideDistributionService);
  private readonly apiAdelaideParametreService = inject(ApiAdelaideParametreService);
  private readonly noteService = inject(NotesService);
  private readonly permissionService = inject(PermissionService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.getAllConfig();
    this.getOptApp();
    this.onChangeApp();
    this.onChangeEnv();
    this.onChangeCom();
    this.onChangeFic();
  }

  initForm(): void {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: [''],
      [this.formName.ORGANISME]: this.fb.group({}),
      [this.formName.APPLICATION]: [''],
      [this.formName.COMMANDE]: [''],
      [this.formName.FICHIER]: this.fb.group({}),
      destinataire: [''],
      copies: [1],
      ressources: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      etat: [true],
      message: [''],
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormGroup;
    this.formDes = this.form.get('destinataire') as FormControl;
    this.formCop = this.form.get('copies') as FormControl;
    this.formRes = this.form.get('ressources') as FormGroup;
    this.formEtat = this.form.get('etat') as FormControl;
    this.formMsg = this.form.get('message') as FormControl;
  }

  getAllConfig() {
    this.subscriptions.push(
      this.apiDestinataireService.getConfigDestinataire().pipe(take(1)).subscribe(data => {
        this.allOrgReg = (data as any).data.allOrganismes;
        this.allDestOrg = (data as any).data.findAllCodeDestinsAndCodeOrg;
      })
    );
    this.subscriptions.push(
      this.apiAdelaideParametreService.getCodeOrgOGUR().pipe(take(1)).subscribe(data => (this.codeOrgOGUR = (data as any).data.getCodeOrgOGUR))
    );
  }

  getOptApp() {
    this.subscriptions.push(
      this.apiCommandeService.getDistinctApplications().pipe(take(1)).subscribe(data => {
        this.optionsApp = (data as any).data.getDistinctApplications;
        const selectedApp = !!this.selectedValues[this.formName.APPLICATION] ? this.selectedValues[this.formName.APPLICATION] : null;
        if (selectedApp && this.optionsApp.includes(selectedApp)) {
          this.formApp.reset(selectedApp, { emitEvent: true });
        } else {
          this.formApp.reset(false, { emitEvent: true });
        }
      })
    );
  }

  onChangeApp() {
    this.subscriptions.push(
      this.formApp.valueChanges
        .pipe(
          switchMap(app => {
            return !!app ? this.apiCommandeService.getDistinctEnvsByApp(app) : of(null);
          })
        )
        .subscribe(data => {
          this.optionsEnv = !!data ? (data as any).data.getDistinctEnvsByApp : [];
          let selectedEnv = this.formEnv.value;
          if (this.selectedValues[this.formName.ENVIRONNEMENT].length > 0 && !this.isInitWithSelectedValues) {
            selectedEnv = this.selectedValues[this.formName.ENVIRONNEMENT][0];
          }
          if (this.optionsEnv.includes(selectedEnv)) {
            this.formEnv.reset(selectedEnv, { emitEvent: true });
          } else {
            this.formEnv.reset(false, { emitEvent: true });
          }
        })
    );
  }

  onChangeEnv() {
    this.subscriptions.push(
      this.formEnv.valueChanges
        .pipe(
          switchMap(env => {
            return !!env ? this.apiCommandeService.getDistinctCommByAppEnv(this.formApp.value, env) : of(null);
          })
        )
        .subscribe(data => {
          this.optionsCom = !!data ? (data as any).data.getDistinctCommByAppEnv : [];
          let selectedCom = this.formCom.value;
          if (!!this.selectedValues[this.formName.COMMANDE] && !this.isInitWithSelectedValues) {
            selectedCom = this.selectedValues[this.formName.COMMANDE];
          }
          if (this.optionsCom.includes(selectedCom)) {
            this.formCom.reset(selectedCom, { emitEvent: true });
          } else {
            this.formCom.reset(false, { emitEvent: true });
          }
        })
    );
  }

  onChangeCom() {
    this.subscriptions.push(
      this.formCom.valueChanges
        .pipe(
          switchMap(com => {
            return !!com ? this.apiFichierService.getExistedFichiers([this.formEnv.value], this.formApp.value, com, null) : of(null);
          })
        )
        .subscribe(data => {
          // remove les fichiers en doublons
          this.optionsFic = !!data
            ? [...new Set((data as any).data.getExistedFichiers.map(e => e.codeFich))].sort((a: string, b: string) => a.localeCompare(b))
            : [];
          // get sélected fichiers
          let selectedFics = this.getSelectedFic();
          if (!!this.selectedValues[this.formName.FICHIER] && !this.isInitWithSelectedValues) {
            selectedFics = [this.selectedValues[this.formName.FICHIER]];
          }
          // update fichier form with value selected
          Object.keys(this.formFic.controls).forEach(key => this.formFic.removeControl(key, { emitEvent: false }));
          this.formFic.reset(false, { emitEvent: false });
          this.optionsFic.forEach(codeFic =>
            this.formFic.addControl(codeFic, new FormControl(selectedFics.includes(codeFic), null), { emitEvent: false })
          );
          this.formFic.updateValueAndValidity({ emitEvent: true });
        })
    );
  }

  getSelectedFic(): string[] {
    const rawFic = this.formFic.value;
    return Object.keys(rawFic).filter(k => rawFic[k]);
  }

  onChangeFic() {
    this.subscriptions.push(
      this.formFic.valueChanges
        .pipe(
          debounceTime(DELAI_VALUE_CHANGE),
          switchMap(fic => {
            return !!fic
              ? this.apiFichierService.getOrgByEnvAppComFics(
                  initSearchOrgByEnvAppComFicsInput(this.formEnv.value, this.formApp.value, this.formCom.value, this.getSelectedFic())
                )
              : of(null);
          })
        )
        .subscribe(data => {
          const orgs = !!data ? (data as any).data.getOrgByEnvAppComFics : [];
          const orgForm = this.formOrg;
          // get selected organismes
          let selectedOrgs = [];
          orgs.length && SharedUtil.extractSelectedOrgs(orgForm.value, selectedOrgs);
          if (orgs.length > 0 && this.selectedValues[this.formName.ORGANISME].length > 0 && !this.isInitWithSelectedValues) {
            selectedOrgs = this.selectedValues[this.formName.ORGANISME].filter(org => orgs.includes(org));
          }
          // update organismes form
          SharedUtil.getOrgFormByOrgData(orgForm, orgs, this.allOrgReg, false, selectedOrgs);
          this.onChangeOrganisme(selectedOrgs.map(org => ({ title: org })));
          this.isInitWithSelectedValues = true;
        })
    );
  }

  getDestinatairesByOrgs(orgs: string[]) {
    this.optionsDes = SharedUtil.getDestinataireEnIntersection(this.allDestOrg, orgs);
    const selectedDes = this.formDes.value;
    if (this.optionsDes.includes(selectedDes)) {
      this.formDes.reset(selectedDes, { emitEvent: true });
    } else {
      this.formDes.reset(false, { emitEvent: true });
    }
  }

  onChangeOrganisme(event) {
    if (event.length) {
      const orgs = event.map(e => e.title);
      this.getDestinatairesByOrgs(orgs);
      this.subscriptions.push(
        this.apiFichierService
          .getRessourcesGam(
            initSearchByEnvsOrgsAppProfilInput([this.formEnv.value], orgs, this.formApp.value, this.permissionService.hasProfileAdmin())
          )
          .pipe(take(1))
          .subscribe((result: any) => {
            this.ressourcesList = result.data.getRessourcesGam.sort(
              (a, b) =>
                a.codeGamme.localeCompare(b.codeGamme) || a.codeRessource.localeCompare(b.codeRessource) || a.codeSite.localeCompare(b.codeSite)
            );
            const resForm = this.formRes;
            Object.keys(resForm.controls).forEach(key => resForm.removeControl(key, { emitEvent: false }));
            resForm.reset(false, { emitEvent: false });
            this.ressourcesList.forEach(oRes => {
              const key = oRes.codeGamme + '/' + oRes.codeSite + '/' + oRes.codeRessource;
              resForm.addControl(key, new FormControl(false, null), { emitEvent: false });
            });
            resForm.updateValueAndValidity({ emitEvent: true });
          })
      );
    } else {
      this.optionsDes = [];
      this.formDes.reset(false, { emitEvent: true });
      const resForm = this.formRes;
      Object.keys(resForm.controls).forEach(key => resForm.removeControl(key, { emitEvent: false }));
      resForm.reset(false, { emitEvent: true });
    }
  }

  isFormValid() {
    return this.form.valid;
  }

  getSelectedRessrouces() {
    const optionsRessource = this.formRes.value;
    const selectedRes: string[] = [];
    Object.keys(optionsRessource).forEach(r => {
      if (optionsRessource[r]) {
        const rtb = r.split('/');
        const cdGam = rtb[0] ? rtb[0] : null;
        const cdSit = rtb[1] ? rtb[1] : null;
        const cdRes = rtb[2] ? rtb[2] : null;
        this.ressourcesList.forEach(rle => {
          if (rle.codeGamme === cdGam && rle.codeSite === cdSit && rle.codeRessource === cdRes) {
            selectedRes.push(rle);
          }
        });
      }
    });
    return selectedRes;
  }

  // ne créer que les exemplaires avec ressources et son organisme attaché(ou organisme général)
  getCreatesDTO(): Exemplaire[] {
    const toCreatesDTO: Exemplaire[] = [];
    const formValues = this.form.getRawValue();
    const selectedFics = this.getSelectedFic();
    const selectedRessources = this.getSelectedRessrouces();
    const selectedDes = !!formValues.destinataire ? formValues.destinataire : null; // uniformer les retours de vide null undefined false etc. à null
    const selectedOrgs: string[] = [];
    const rawOrg = formValues[this.formName.ORGANISME];
    SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
    selectedOrgs.forEach(org => {
      selectedRessources
        .filter(
          (rowRes: any) =>
            [this.codeOrgOGUR, org].includes(rowRes.codeOrganisme) && this.allOrgReg.find(e => e.code == org).codeSite == rowRes.codeSite
        )
        .forEach((rowRes: any) => {
          // create with multi selected fichiers
          selectedFics.forEach(codeFic => {
            toCreatesDTO.push(
              new Exemplaire(
                formValues[this.formName.ENVIRONNEMENT],
                org,
                formValues[this.formName.APPLICATION],
                formValues[this.formName.COMMANDE],
                codeFic,
                rowRes.codeGamme,
                null,
                rowRes.codeSite,
                rowRes.codeRessource,
                selectedDes,
                formValues.copies,
                formValues.etat
              )
            );
          });
        });
    });
    return toCreatesDTO;
  }

  passBack() {
    const toCreatesDTO = this.getCreatesDTO();
    const message = this.formMsg.value;
    this.subscriptions.push(
      this.apiAdelaideDistibutionService.createExemplaires(toCreatesDTO, message).subscribe({
        next: data => {
          const nbrExemplaires = data.data.createExemplaires.length;
          let title;
          if (nbrExemplaires > 0) {
            title = nbrExemplaires + (nbrExemplaires > 1 ? ' exemplaires ont été créés avec succès' : ' exemplaire a été créé avec succès');
          } else {
            title = "Aucun exemplaire n'a été créé";
          }
          this.noteService.show({
            title: title,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.passEntry.emit({ nbrExemplaires: nbrExemplaires });
          this.activeModal.close();
        },
        error: error => {
          this.noteService.show({
            title: error.graphQLErrors[0].message,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        },
      })
    );
  }

  closePopup() {
    this.activeModal.close();
  }
}
