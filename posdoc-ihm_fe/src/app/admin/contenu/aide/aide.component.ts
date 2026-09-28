import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableauAideService } from './service/tableau-aide.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupAideComponent } from '@app/admin/contenu/aide/popup/popup-aide.component';
import { ConfirmationPopupComponent } from '@app/admin/popup/confirmation-popup/confirmation-popup.component';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { HelpStatusType } from '@app/models/contenu-for-accueil';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { AddType } from '@app/models/enums/add-type';
import { PopupHelpComponent } from '@app/admin/contenu/popup-help/popup-help.component';
import { StatusColumnHandlerService } from '@app/admin/contenu/services/status-column-handler.service';

@Component({
  selector: 'app-aide',
  templateUrl: './aide.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class AideComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  overlayLoadingTemplate = '<span></span>';

  subscriptions: Subscription[] = [];

  rowData: any = [];
  pathLabels: Map<string, string> = new Map();
  pathOrder: Map<string, number> = new Map();

  columnDefs: ColDef[];
  gridApi: GridApi;
  gridColumnApi: GridApi;

  addType = AddType.MODAL;

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.CONTENU.AIDE;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canModifyPermPosition = this.auth[KEY_MODIFIER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauAideService = inject(TableauAideService);
  private readonly modalService = inject(NgbModal);
  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly noteService = inject(NotesService);
  private readonly statusColumnHandler = inject(StatusColumnHandlerService);

  constructor() {
    // Empty constructor
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.loadPathLabels();
    this.columnDefs = this.tableauAideService.getColumnDefs(false);
    this.statusColumnHandler.setupStatusColumnHandler(this.columnDefs, this, {
      draftValue: 'draft',
      enabledValue: 'enabled',
      disabledValue: 'disabled',
      draftLabel: 'Brouillon',
      enabledLabel: 'Activé',
      disabledLabel: 'Désactivé',
      allowDraftChanges: true,
    });
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(false);

    this.gridOptions.getRowId = (params: GetRowIdParams) => {
      return params.data.id;
    };

    this.gridOptions.suppressCellFocus = true;

    this.gridOptions.context = {
      componentParent: this,
    };

    this.overlayNoRowsTemplate = this.tableauAideService.getOverlayNoRowsTemplate();
  }

  private loadPathLabels() {
    this.subscriptions.push(
      this.apiAdelaideContenuService.getAllPathComplet().pipe(take(1)).subscribe(result => {
        result.data.getAllPathComplet.forEach((item: any, index: number) => {
          this.pathLabels.set(item.path, item.libelle);
          this.pathOrder.set(item.path, index);
        });
      })
    );
  }

  onActivateDraft(param: any, oldStatus: string, newStatus: string) {
    this.showActivateDraftConfirmation(param, oldStatus);
  }

  onChangeStatus(param: any, oldStatus: string, newStatus: string) {
    this.changeStateHelp(param, oldStatus);
  }

  private showActivateDraftConfirmation(param: any, oldStatus: string) {
    const hasEnabledForSamePath = this.checkEnabledExists(param.data.path, param.data.id);

    if (hasEnabledForSamePath) {
      const modalRef = this.modalService.open(ConfirmationPopupComponent);
      modalRef.componentInstance.rowsToDelete = [{ info: '' }];
      modalRef.componentInstance.rowsNotAuthorisedToBeDeleted = [];
      modalRef.componentInstance.idsLabel = ['info'];
      modalRef.componentInstance.messages = [
        'Activation d\'un brouillon',
        'Attention : Une aide activée existe déjà pour cette page. L\'activation de ce brouillon supprimera l\'aide activée existante. Voulez-vous continuer ?',
        '',
        '',
        '',
        '',
      ];

      this.subscriptions.push(
        modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
          if (numButton === NUM_FIRST_BTN_MODAL) {
            this.changeStateHelp(param, oldStatus);
          } else {
            // Annuler : remettre l'ancien statut dans le select
            param.node.data.status = oldStatus;
            param.api.redrawRows({ rowNodes: [param.node] });
          }
        })
      );
    } else {
      this.changeStateHelp(param, oldStatus);
    }
  }

  private checkEnabledExists(path: string, currentId: number): boolean {
    return this.rowData.some((aide) => aide.path === path && aide.status === 'enabled' && aide.id !== currentId);
  }

  private changeStateHelp(param: any, oldStatus: string) {
    this.subscriptions.push(
      this.apiAdelaideContenuService.changeStateHelp(param.data.id).subscribe({
        next: response => {
          this.rowData = [...this.mapAidesToRowData(response.data.changeStateHelp)];
          this.noteService.show({
            title: `L'état de l'aide pour la page [${param.data.pathLabel}] a été mis à jour avec succès`,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          param.node.data.status = oldStatus;
          param.api.redrawRows({ rowNodes: [param.node] });
          this.noteService.show({
            title: error.graphQLErrors?.[0]?.message || 'Erreur lors de la mise à jour de l\'état',
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        },
      })
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.loadAides();
  }

  private loadAides() {
    this.subscriptions.push(
      this.apiAdelaideContenuService.getAllAides().pipe(take(1)).subscribe(result => {
        this.rowData = this.mapAidesToRowData(result.data.searchAll);
      })
    );
  }

  private mapAidesToRowData(aides: any[]) {
    return aides.map((aide) => ({
      id: aide.id,
      path: aide.path,
      pathLabel: this.pathLabels.get(aide.path) || aide.path,
      pathOrder: this.pathOrder.get(aide.path) ?? 999999,
      message: aide.message,
      status: aide.state === HelpStatusType.ENABLED ? 'enabled' : aide.state === HelpStatusType.DISABLED ? 'disabled' : 'draft',
      created_at: aide.createdAt ? new Date(aide.createdAt) : null,
      updated_at: aide.updatedAt ? new Date(aide.updatedAt) : null,
      created_by: aide.createdBy || '',
      updated_by: aide.updatedBy || '',
    }));
  }

  addRow() {
    const modalRef = this.modalService.open(PopupAideComponent, { size: 'lg', backdrop: false });
    modalRef.result
      .then((data) => {
        const helpPayload = {
          path: data.path,
          message: data.message,
        };
        const pathLabel = this.pathLabels.get(data.path) || data.path;
        this.subscriptions.push(
          this.apiAdelaideContenuService.createAide(helpPayload).subscribe({
            next: (result) => {
              this.rowData = [...this.mapAidesToRowData(result.data.createHelp)];
              this.noteService.show({
                title: 'L\'aide contextuelle "' + pathLabel + '" a été créée avec succès',
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
            },
            error: (error) => {
              this.noteService.show({
                title: 'Erreur lors de la création de l\'aide contextuelle : ' + (error.message || 'Erreur inconnue'),
                classname: 'note-erreur',
                category: ToastCategoryEnum.ERROR,
              });
            },
          })
        );
      })
      .catch(() => {});
  }

  edit(params: any) {
    // Récupérer les données à jour depuis rowData
    const selectedData = this.rowData.find(aide => aide.id === params.data.id);
    if (!selectedData) return;

    const isActivated = selectedData.status === 'enabled';

    if (isActivated) {
      this.showEditActivatedConfirmation(selectedData);
    } else {
      this.openEditModal(selectedData);
    }
  }

  private showEditActivatedConfirmation(selectedData: any) {
    const hasDraftForSamePath = this.checkDraftExists(selectedData.path, selectedData.id);
    const detailMessage = hasDraftForSamePath
      ? 'Attention une page en brouillon existe déjà, cette action l\'écrasera. Voulez-vous continuer ?'
      : 'La modification créera un nouveau brouillon. Vous devrez l\'activer par la suite';

    const modalRef = this.modalService.open(ConfirmationPopupComponent);
    modalRef.componentInstance.rowsToDelete = [{ info: '' }];
    modalRef.componentInstance.rowsNotAuthorisedToBeDeleted = [];
    modalRef.componentInstance.idsLabel = ['info'];
    modalRef.componentInstance.firstButtonLabel = 'Faire la modification';
    modalRef.componentInstance.secondButtonLabel = 'Abandonner la modification';
    modalRef.componentInstance.messages = [
      'Modification d\'une aide activée',
      detailMessage,
      '',
      '',
      '',
      '',
    ];

    this.subscriptions.push(
      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          this.openEditModal(selectedData);
        }
      })
    );
  }

  private checkDraftExists(path: string, currentId: number): boolean {
    return this.rowData.some((aide) => aide.path === path && aide.status === 'draft' && aide.id !== currentId);
  }

  private openEditModal(selectedData: any) {
    const modalRef = this.modalService.open(PopupAideComponent, { size: 'lg', backdrop: false });
    modalRef.componentInstance.id = selectedData.id;
    modalRef.componentInstance.path = selectedData.path;
    modalRef.componentInstance.message = selectedData.message;

    modalRef.result
      .then((data) => {
        // Vérifier s'il existe un brouillon pour ce chemin
        const hasDraftForPath = this.rowData.some(
          aide => aide.path === data.path && aide.status === 'draft' && aide.id !== data.id
        );

        if (hasDraftForPath) {
          this.showSaveEditConfirmation(data, selectedData);
        } else {
          this.updateAide(data);
        }
      })
      .catch(() => {});
  }

  private showSaveEditConfirmation(data: any, selectedData: any) {
    const confirmModalRef = this.modalService.open(ConfirmationPopupComponent);
    confirmModalRef.componentInstance.rowsToDelete = [{ info: '' }];
    confirmModalRef.componentInstance.rowsNotAuthorisedToBeDeleted = [];
    confirmModalRef.componentInstance.idsLabel = ['info'];
    confirmModalRef.componentInstance.firstButtonLabel = 'Enregistrer';
    confirmModalRef.componentInstance.secondButtonLabel = 'Abandonner la modification';
    confirmModalRef.componentInstance.messages = [
      'Attention',
      'Un brouillon existe déjà pour cette page. L\'enregistrement écrasera le brouillon existant. Voulez-vous continuer ?',
      '',
      '',
      '',
      '',
    ];

    this.subscriptions.push(
      confirmModalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          this.updateAide(data);
        } else {
          // Rouvrir la modal d'édition avec les données modifiées si l'utilisateur annule
          const updatedData = { ...selectedData, path: data.path, message: data.message };
          setTimeout(() => this.openEditModal(updatedData), 100);
        }
      })
    );
  }

  private updateAide(data: any) {
    const helpPayload = {
      id: data.id,
      message: data.message,
    };
    const pathLabel = this.pathLabels.get(data.path) || data.path;
    this.subscriptions.push(
      this.apiAdelaideContenuService.updateAide(helpPayload).subscribe({
        next: (result) => {
          this.rowData = [...this.mapAidesToRowData(result.data.updateHelp)];
          this.noteService.show({
            title: 'L\'aide contextuelle "' + pathLabel + '" a été modifiée avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: (error) => {
          this.noteService.show({
            title: 'Erreur lors de la modification de l\'aide contextuelle : ' + (error.message || 'Erreur inconnue'),
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        },
      })
    );
  }

  onDeleteRows(event: any[]) {
    event.forEach(aide => {
      this.subscriptions.push(
        this.apiAdelaideContenuService.deleteAide(aide.id).subscribe({
          next: () => {
            this.gridApi.applyTransaction({ remove: [aide] });
            this.noteService.show({
              title: event.length === 1
                ? 'L\'aide "' + aide.pathLabel + '" a été supprimée avec succès'
                : 'Les aides contextuelles ont été supprimées avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.redrawRows();
          },
          error: (error) => {
            this.noteService.show({
              title: 'Erreur lors de la suppression de l\'aide contextuelle : ' + (error.message || 'Erreur inconnue'),
              classname: 'note-erreur',
              category: ToastCategoryEnum.ERROR,
            });
          },
        })
      );
    });
  }

  onPageClick(aideId: number) {
    const aideData = this.rowData.find(aide => aide.id === aideId);
    if (aideData) {
      const modalRef = this.modalService.open(PopupHelpComponent, { size: 'xl', backdrop: 'static' });
      modalRef.componentInstance.path = aideData.path;
      modalRef.componentInstance.aideMessage = aideData.message;
    }
  }
}
