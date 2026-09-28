import { LoginService } from '@acoss/prisme-angular-intranet';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MenuData } from '../../models/occurrence-etape-interfaces';
import { ValidationEtapePayload } from '../../models/validation-etape-models';
import { ApiValidationEtapeService } from '../../service/api-validation-etape.service';
import { FORMID_OCCURRENCES_ETAPES } from '@app/shared/utils/Constants_formid';

@Component({
  selector: 'app-modal-validation-etape',
  templateUrl: './modal-validation-etape.component.html',
  styleUrls: ['./modal-validation-etape.component.scss'],
  standalone: false,
})
export class ModalValidationEtapeComponent implements OnInit {
  @Input() menuData: MenuData;
  @Output() passEntry = new EventEmitter<any>();
  modalTitle: string;

  constructor(
    public activeModal: NgbActiveModal,
    private loginService: LoginService,
    private noteService: NotesService,
    private apiValidationEtapeService: ApiValidationEtapeService
  ) {}

  ngOnInit(): void {
    this.modalTitle = "Validation de l'étape " + this.menuData.codcom + this.menuData.codfic + '-' + this.menuData.etat;
  }

  valideStep() {
    let params = new ValidationEtapePayload();
    params.idetap = this.menuData.idetap;
    params.user = this.getUtilisateur();
    params.formid = FORMID_OCCURRENCES_ETAPES;

    this.apiValidationEtapeService.valideEtape([params]).subscribe(
      result => {
        let erreur = (result as any).data.valideGenEtp.erreur;
        if (erreur) {
          this.noteService.show({
            title: `Echec de la validation de l'étape : ${erreur} `,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        } else {
          this.noteService.show({
            title: "L'étape a été validée avec succès",
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.passEntry.emit({ validation: true });
        }
      },
      error => {
        this.noteService.show({
          title: `Echec de la validation de l'étape : ${error.message} `,
          classname: 'note-erreur',
          category: ToastCategoryEnum.ERROR,
        });
      }
    );
  }

  getUtilisateur() {
    return this.loginService.getIdentifiantUtilisateur();
  }
}
