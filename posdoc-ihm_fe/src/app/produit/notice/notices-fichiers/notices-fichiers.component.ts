import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { getFormName, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { SearchNoticesFichiers } from './model/search-notices-fichiers';
import { NoticesFichiersInterface } from './model/notices-fichiers-interface';
import { TableauComponent } from '@app/fullstack-components/tableau/components/tableau/tableau.component';
import { TableauNoticesFichiersService } from '../service/tableau-notices-fichiers.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NoticeDetailsModalComponent } from './notice-details-modal/notice-details-modal.component';

@Component({
  selector: 'app-notices-fichiers',
  templateUrl: './notices-fichiers.component.html',
  styleUrls: ['./notices-fichiers.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class NoticesFichiersComponent implements OnInit {
  @ViewChild(TableauComponent) tableauComponent!: TableauComponent;

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  rowData: NoticesFichiersInterface[] = [];
  totalNotices = ZERO;
  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  formName = getFormName();
  form: FormGroup;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly tableauNoticesFichiersService: TableauNoticesFichiersService,
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly apiNoticesService: ApiNoticesService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initGridOptions();
    this.columnDefs = this.tableauNoticesFichiersService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauNoticesFichiersService.getOverlayNoRowsTemplate();
  }

  initForm() {
    this.form = this.fb.group({});
  }

  initGridOptions() {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(false),
      onCellClicked: event => this.onCellClicked(event),
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.gridApi.setGridOption('loading', false);
  }

  lister(event) {
    const query = this.getQuerySearchFromEvent(event);

    this.gridApi?.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiNoticesService.findNoticesFichiers(query).pipe(take(1)).subscribe({
        next: result => {
          const data = result.data?.findNoticesFichiers || [];
          this.rowData = data.map(item => ({
            ...item,
            codenv_codorg_codapp: `${item.codenv}-${item.codorg}-${item.codapp}`,
            codcom_codfic: `${item.codcom}-${item.codfic}`,
            noticesString: item.notices ? item.notices.sort().join(', ') : '',
          }));

          this.totalNotices = this.rowData.length;
          this.gridApi?.setGridOption('loading', false);
        },
        error: error => {
          console.error('Erreur lors de la récupération des notices fichiers', error);
          this.rowData = [];
          this.totalNotices = ZERO;
          this.gridApi?.setGridOption('loading', false);
        },
      })
    );
  }

  getQuerySearchFromEvent(event): SearchNoticesFichiers {
    const query = new SearchNoticesFichiers();
    query.codenv = event[this.formName.ENVIRONNEMENT];
    query.codorg = event[this.formName.ORGANISME];
    query.codapp = event[this.formName.APPLICATION];
    query.codcom = event[this.formName.COMMANDE];
    query.codfic = event[this.formName.FICHIER];
    query.refimp = event[this.formName.REFIMPRIME];
    return query;
  }

  onCellClicked(event: CellClickedEvent): void {
    if (event.column.getColId() === 'codcom_codfic' && event.data) {
      this.openNoticeDetailsModal(event.data);
    }
  }

  openNoticeDetailsModal(rowData: NoticesFichiersInterface): void {
    const modalRef: NgbModalRef = this.modalService.open(NoticeDetailsModalComponent, {
      size: 'xl',
      backdrop: 'static',
      windowClass: 'notice-details-modal',
    });

    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.codenv = rowData.codenv;
    modalRef.componentInstance.codorg = rowData.codorg;
    modalRef.componentInstance.codapp = rowData.codapp;
    modalRef.componentInstance.codcom = rowData.codcom;
    modalRef.componentInstance.codfic = rowData.codfic;
    modalRef.componentInstance.fichierLabel = rowData.codcom_codfic;
  }
}
