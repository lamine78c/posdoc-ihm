import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { NoticeDetail } from '../model/notice-detail';
import { TableauNoticeDetailsService } from '../../service/tableau-notice-details.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-notice-details-modal',
  templateUrl: './notice-details-modal.component.html',
  styleUrls: ['./notice-details-modal.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class NoticeDetailsModalComponent implements OnInit {
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly apiNoticesService = inject(ApiNoticesService);
  private readonly tableauNoticeDetailsService = inject(TableauNoticeDetailsService);
  private readonly notesService = inject(NotesService);
  private readonly activeModal = inject(NgbActiveModal);

  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() codenv: string;
  @Input() codorg: string;
  @Input() codapp: string;
  @Input() codcom: string;
  @Input() codfic: string;
  @Input() fichierLabel: string;

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  noticeDetails: NoticeDetail[] = [];
  totalNotices = ZERO;
  isLoading = true;

  subscriptions: Subscription[] = [];

  constructor() {
    // No-op
  }

  ngOnInit(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(false);
    this.columnDefs = this.tableauNoticeDetailsService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauNoticeDetailsService.getOverlayNoRowsTemplate();
    this.loadNoticeDetails();
  }

  loadNoticeDetails(): void {
    const payload = {
      codenv: this.codenv,
      codorg: this.codorg,
      codapp: this.codapp,
      codcom: this.codcom,
      codfic: this.codfic,
    };

    this.subscriptions.push(
      this.apiNoticesService
        .findNoticeDetailsByFichier(payload)
        .pipe(take(1))
        .subscribe({
          next: result => {
            this.noticeDetails = (result.data?.findNoticeDetailsByFichier || []).map(detail => ({
              ...detail,
              portee: detail.portee?.endsWith('-') ? detail.portee.slice(0, -1) : detail.portee,
            }));
            this.totalNotices = this.noticeDetails.length;
            this.isLoading = false;
            if (this.gridApi) {
              this.gridApi.setGridOption('loading', false);
            }
          },
          error: error => {
            console.error('Erreur lors de la récupération des détails des notices', error);
            this.isLoading = false;
            if (this.gridApi) {
              this.gridApi.setGridOption('loading', false);
            }
            this.activeModal.close();
            this.notesService.show({
              title: error.message,
              classname: 'note-erreur',
              category: ToastCategoryEnum.ERROR,
            });
          },
        })
    );
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.setGridOption('loading', this.isLoading);
  }

  close(): void {
    this.activeModal.close();
  }
}
