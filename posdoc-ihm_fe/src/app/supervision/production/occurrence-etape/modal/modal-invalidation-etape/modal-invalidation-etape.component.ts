import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuData } from '../../models/occurrence-etape-interfaces';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InvalidationEtapePayload } from '../../models/invalidation-etape-models';
import { LoginService } from '@acoss/prisme-angular-intranet';
import { ApiInvalidationEtapeService } from '../../service/api-invalidation-etape.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { FORMID_OCCURRENCES_ETAPES } from '@app/shared/utils/Constants_formid';

@Component({
  selector: 'app-modal-invalidation-etape',
  templateUrl: './modal-invalidation-etape.component.html',
  standalone: false,
})
export class ModalInvalidationEtapeComponent implements OnInit {
  @Input() menuData: MenuData;
  @Output() passEntry = new EventEmitter<any>();
  modalTitle: string;

  constructor(
    public activeModal: NgbActiveModal,
    private loginService: LoginService,
    private noteService: NotesService,
    private apiInvalidationEtapeService: ApiInvalidationEtapeService
  ) {}

  ngOnInit(): void {
    this.modalTitle = "Invalidation de l'étape " + this.menuData.codcom + this.menuData.codfic + '-' + this.menuData.etat;
  }

  invalideGenEtpEtLiens() {
    let params = new InvalidationEtapePayload();
    params.idetap = this.menuData.idetap;
    params.user = this.getUtilisateur();
    params.formid = FORMID_OCCURRENCES_ETAPES;

    this.apiInvalidationEtapeService.invalideGenEtpEtLiens(params).subscribe(
      (result: any) => {
        let erreur = result.data.invalideGenEtpEtLiens.erreur;
        if (erreur) {
          this.noteService.show({
            title: `Echec de l\'invalidation de l'étape : ${erreur} `,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        } else {
          this.noteService.show({
            title: "L'étape a été invalidée avec succès",
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.passEntry.emit({ validation: true });
        }
      },
      error => {
        this.noteService.show({
          title: `Echec de l\'invalidation de l'étape : ${error.message} `,
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
