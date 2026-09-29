import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableauFaqService } from './service/tableau-faq.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { AddType } from '@app/models/enums/add-type';
import { PopupFaqComponent } from '@app/admin/contenu/popup-help/onglets/faq/popup/popup-faq.component';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { StatusColumnHandlerService } from '@app/admin/contenu/services/status-column-handler.service';
import { FaqNotification, GetNotificationInterface } from '@app/models/notification';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { NotificationsRefreshService } from '@app/shared/services/notifications-refresh.service';
import { ApolloQueryResult } from 'apollo-client';

interface FaqData {
  id: number;
  path: string;
  pathLabel: string;
  pathOrder: number;
  question: string;
  answer: string | null;
  status: 'draft' | 'enabled' | 'disabled';
  viewCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  exchanges: Array<{
    id: number;
    author: string;
    message: string;
    createdAt: string;
  }>;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  standalone: false,
})
export class FaqComponent implements OnInit, OnDestroy {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  overlayLoadingTemplate = '<span></span>';

  rowData: FaqData[] = [];
  pathLabels: Map<string, string> = new Map();
  pathOrder: Map<string, number> = new Map();
  faqNotifications: FaqNotification[] = [];

  columnDefs: ColDef[];
  gridApi: GridApi;
  gridColumnApi: GridApi;

  addType = AddType.MODAL;

  private readonly auth = AUTH.ADMINISTRATION.CONTENU.FAQ;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canModifyPermPosition = this.auth[KEY_MODIFIER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauFaqService = inject(TableauFaqService);
  private readonly modalService = inject(NgbModal);
  private readonly noteService = inject(NotesService);
  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly notificationsRefreshService = inject(NotificationsRefreshService);
  private readonly statusColumnHandler = inject(StatusColumnHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private redrawRowsTimeoutId: ReturnType<typeof setTimeout>;

  constructor() {
    // Empty constructor
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.loadPathLabels();
    this.loadFaqNotifications();
    this.notificationsRefreshService.refresh$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadFaqNotifications());
    this.columnDefs = this.tableauFaqService.getColumnDefs(false);
    this.statusHandler();
  }

  private statusHandler() {
    this.statusColumnHandler.setupStatusColumnHandler(this.columnDefs, this, {
      draftValue: 'draft',
      enabledValue: 'enabled',
      disabledValue: 'disabled',
      draftLabel: 'Brouillon',
      enabledLabel: 'Activé',
      disabledLabel: 'Désactivé',
      allowDraftChanges: false,
    });
  }

  onActivateDraft(param: any, oldStatus: string, newStatus: string) {
    this.onChangeStatus(param, oldStatus, newStatus);
  }

  onChangeStatus(param: any, oldStatus: string, newStatus: string) {
    this.statusColumnHandler.changeStatus(
      param,
      oldStatus,
      newStatus,
      (id, status) => this.apiAdelaideContenuService.updateFaqStatus(id, status),
      () => this.loadFaqData(),
      `Le statut de la FAQ "${param.data.question.substring(0, 50)}..." a été mis à jour avec succès`
    );
  }

  private loadPathLabels() {
    this.apiAdelaideContenuService
      .getAllPathComplet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        result.data.getAllPathComplet.forEach((item: any, index: number) => {
          this.pathLabels.set(item.path, item.libelle);
          this.pathOrder.set(item.path, index);
        });
      });
  }

  private loadFaqNotifications() {
    this.apiAdelaideFaqService.getNotificationsCount().subscribe((result: ApolloQueryResult<GetNotificationInterface>) => {
      this.faqNotifications = result.data.getNotification;

      // Forcer le rafraîchissement du style des lignes
      if (this.gridApi) {
        this.gridApi.redrawRows();
      }
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

    // Définir la fonction getRowClass pour appliquer le style aux lignes notifiées
    this.gridOptions.getRowClass = params => {
      if (params.data && this.faqNotifications.some(notif => notif.faq.id === params.data.id)) {
        return 'notified-row';
      }
      return undefined;
    };

    this.overlayNoRowsTemplate = this.tableauFaqService.getOverlayNoRowsTemplate();
  }

  private loadFaqData() {
    this.apiAdelaideContenuService
      .searchAllFaq()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.rowData = this.mapFaqsToRowData(result.data.searchAllFaq);
        // Forcer le rafraîchissement des styles de lignes après le chargement des données
        if (this.gridApi && this.faqNotifications.length > 0) {
          this.redrawRowsTimeoutId = setTimeout(() => this.gridApi.redrawRows(), 100);
        }
      });
  }

  private mapFaqsToRowData(faqs: any[]): FaqData[] {
    return faqs.map(faq => ({
      id: faq.id,
      path: faq.path,
      pathLabel: this.pathLabels.get(faq.path) || faq.path,
      pathOrder: this.pathOrder.get(faq.path) ?? 999999,
      question: faq.question,
      answer: faq.answer,
      status: faq.status === 'ENABLED' ? 'enabled' : faq.status === 'DISABLED' ? 'disabled' : 'draft',
      viewCount: faq.viewCount,
      createdBy: faq.createdBy,
      createdAt: faq.createdAt,
      updatedBy: faq.updatedBy,
      updatedAt: faq.updatedAt,
      exchanges: faq.exchanges || [],
    }));
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.loadFaqData();
  }

  addRow() {
    const modalRef = this.modalService.open(PopupFaqComponent, { size: 'lg', backdrop: false, windowClass: 'faq-modal-fixed' });
    modalRef.result
      .then(data => {
        this.apiAdelaideContenuService
          .createFaq(data)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: result => {
              this.noteService.show({
                title: 'La FAQ "' + data.question + '" a été créée avec succès',
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
              this.rowData = this.mapFaqsToRowData(result.data.createFaq);
              this.notificationsRefreshService.notifyRefresh();
            },
            error: error => {
              this.noteService.show({
                title: 'Erreur lors de la création de la FAQ',
                classname: 'note-erreur',
                category: ToastCategoryEnum.ERROR,
              });
              console.error('Erreur lors de la création de la FAQ:', error);
            },
          });
      })
      .catch(() => {});
  }

  edit(params: any) {
    const selectedData = this.rowData.find(faq => faq.id === params.data.id);
    if (!selectedData) return;

    const modalRef = this.modalService.open(PopupFaqComponent, { size: 'lg', backdrop: false, windowClass: 'faq-modal-fixed' });
    modalRef.componentInstance.id = selectedData.id;
    modalRef.componentInstance.path = selectedData.path;
    modalRef.componentInstance.question = selectedData.question;
    modalRef.componentInstance.answer = selectedData.answer || '';
    modalRef.componentInstance.createdBy = selectedData.createdBy || '';
    modalRef.componentInstance.createdAt = selectedData.createdAt || '';
    modalRef.componentInstance.status = selectedData.status;
    modalRef.componentInstance.exchanges = selectedData.exchanges || [];

    modalRef.result
      .then(data => {
        const updatePayload = {
          path: data.path,
          question: data.question,
          answer: data.answer,
        };
        this.apiAdelaideContenuService
          .updateFaq(selectedData.id, updatePayload)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.noteService.show({
                title: 'La FAQ "' + data.question + '" a été modifiée avec succès',
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
              // Recharger toutes les données pour inclure les échanges mis à jour
              this.loadFaqData();
              this.notificationsRefreshService.notifyRefresh();
            },
            error: error => {
              this.noteService.show({
                title: 'Erreur lors de la modification de la FAQ',
                classname: 'note-erreur',
                category: ToastCategoryEnum.ERROR,
              });
              console.error('Erreur lors de la modification de la FAQ:', error);
            },
          });
      })
      .catch(() => {
        // Recharger les données même si la modale est fermée sans sauvegarder
        // car des échanges peuvent avoir été ajoutés
        this.loadFaqData();
      });
  }

  onDeleteRows(event: FaqData[]) {
    event.forEach(faq => {
      this.apiAdelaideContenuService
        .deleteFaq(faq.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.gridApi.applyTransaction({ remove: [faq] });
            this.noteService.show({
              title:
                event.length === 1
                  ? `La question FAQ "${faq.question.substring(0, 50)}..." a été supprimée avec succès`
                  : 'Les questions FAQ ont été supprimées avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.redrawRows();
            this.notificationsRefreshService.notifyRefresh();
          },
          error: error => {
            this.noteService.show({
              title: 'Erreur lors de la suppression de la FAQ : ' + (error.message || 'Erreur inconnue'),
              classname: 'note-erreur',
              category: ToastCategoryEnum.ERROR,
            });
          },
        });
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.redrawRowsTimeoutId);
  }
}
