import { Component, inject } from '@angular/core';
import { DeleteExemplaire } from '@app/models/deleteExemplaire';
import { Exemplaire } from '@app/models/exemplaire';
import { ParametreEditionColonneComponent } from '@app/produit/distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { FetchResult } from 'apollo-link';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';

@Component({
  selector: 'app-action-renderer-add-exemplaire',
  standalone: true,
  templateUrl: './action-renderer-add-exemplaire.component.html',
  imports: [],
  styleUrls: ['./action-renderer-add-exemplaire.component.scss'],
})
export class ActionRendererAddExemplaireComponent implements ICellRendererAngularComp {
  params: any;
  exemplaireExists: boolean;
  resourceExistsInOtherSite: boolean;
  hasProfil = false;

  private readonly permissionsService = inject(PermissionService);
  private readonly apiDistributionService = inject(ApiAdelaideDistributionService);
  private readonly modalService: NgbModal = inject(NgbModal);
  private readonly noteService: NotesService = inject(NotesService);

  canRemoveParamEditionRessource: boolean = this.permissionsService.hasPermission(
    AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.supprimer
  );
  canAddParamEditionRessource: boolean = this.permissionsService.hasPermission(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.ajouter);

  agInit(params: ICellRendererParams<any, any>): void {
    this.params = params;
    const codorg = this.params.data.codorg ?? '';
    const genericOrg = this.params.genericOrg ?? '';
    const resource = this.params.resource;
    this.exemplaireExists = resource?.exemplaireExists;
    this.hasProfil = !!resource?.hasProfil || (resource?.codorg !== genericOrg && resource?.codorg !== codorg);

    this.resourceExistsInOtherSite =
      this.params.data.ressources?.some(
        (res: any) => res.exemplaireExists && res.codres === resource?.codres && res.codgam === resource?.codgam && res.codsit !== resource?.codsit
      ) || false;
  }

  refresh(_params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  onAddExemplaireClick(): void {
    if (this.hasProfil) {
      return;
    }
    const createExemplaire: Exemplaire = {
      codenv: this.params.data.codenv,
      codorg: this.params.data.codorg,
      codapp: this.params.data.codapp,
      codcom: this.params.data.codcom,
      codfic: this.params.data.codfic,
      codgam: this.params.resource?.codgam,
      numexe: null,
      codsit: this.params.resource?.codsit,
      codres: this.params.resource?.codres,
      coddes: null,
      nbrexe: 1,
      exeact: true,
    };
    this.apiDistributionService.createExemplaire(createExemplaire).subscribe({
      next: () => {
        const parentComponent: ParametreEditionColonneComponent = this.params.context.componentParent;
        if (parentComponent) {
          parentComponent.listExemplairesByResource(parentComponent.requestParams$.getValue());
        }
        this.noteService.show({
          title: `L'exemplaire a été créé avec succès`,
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
      },
      error: error => {
        this.noteService.show({
          title: error.graphQLErrors[0].message,
          classname: 'note-erreur',
          category: ToastCategoryEnum.ERROR,
        });
      },
    });
  }

  onDeleteExemplaireClick(): void {
    if (this.hasProfil) {
      return;
    }
    const deleteExemplaire = {
      codenv: this.params.data.codenv,
      codorg: this.params.data.codorg,
      codapp: this.params.data.codapp,
      codcom: this.params.data.codcom,
      codfic: this.params.data.codfic,
      codgam: this.params.resource?.codgam,
      numexe: null,
      codres: this.params.resource?.codres,
      codsit: this.params.resource?.codsit,
    };
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.messages = [
      "Suppression d'un exemplaire",
      "Vous êtes sur le point de supprimer l'exemplaire",
      'Vous êtes sur le point de supprimer les exemplaires',
    ];
    const toDelete = `${deleteExemplaire.codenv} - ${deleteExemplaire.codorg} - ${deleteExemplaire.codapp} - ${deleteExemplaire.codcom} - ${deleteExemplaire.codfic} - ${deleteExemplaire.codgam}/${deleteExemplaire.codsit}/${deleteExemplaire.codres}`;
    modalRef.componentInstance.rowDataArray = [toDelete];
    modalRef.dismissed.pipe(first()).subscribe((numButton: number) => {
      if (numButton === NUM_FIRST_BTN_MODAL) {
        this.apiDistributionService.deleteExemplaire(deleteExemplaire).subscribe((result: FetchResult<DeleteExemplaire>) => {
          const parentComponent: ParametreEditionColonneComponent = this.params.context.componentParent;
          if (parentComponent && result.data.deleteExemplaire.ok) {
            parentComponent.listExemplairesByResource(parentComponent.requestParams$.getValue());
            this.noteService.show({
              title: `L'exemplaire ${toDelete} a été supprimé avec succès`,
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
          }
        });
      }
    });
  }
}
