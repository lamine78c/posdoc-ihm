import { Component, inject, Input } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideActionService } from '@app/services/api-adelaide-action.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DateUtil } from '@app/shared/utils/DateUtil';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subscription, take } from 'rxjs';
import { SearchActionUtilisateurByQueryResult } from '../model/search-action-utilisateur-by-query';
import { TableauActionDetailsService } from '../service/tableau-action-details.service';

@Component({
  selector: 'app-details-action-utilisateur',
  standalone: false,
  templateUrl: './details-action-utilisateur.component.html',
  styleUrl: './details-action-utilisateur.component.scss',
})
@AutoUnsubscribe
export class DetailsActionUtilisateurComponent {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() title: string;
  @Input() rowData: SearchActionUtilisateurByQueryResult;
  @Input() codulo: number;

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  details = [];
  subscriptions: Subscription[] = [];
  apiAdelaideService = inject(ApiAdelaideActionService);
  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauService = inject(TableauActionDetailsService);
  datulo = '';

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      rowHeight: 83,
    };
    this.columnDefs = this.tableauService.getColumnDefs();
    this.datulo = DateUtil.formatDateToDDMMYYYYHHMMSS(this.rowData.datulo);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.getDetailByCodulo();
  }

  getDetailByCodulo() {
    this.subscriptions.push(
      this.apiAdelaideService
        .searchHistoryByCodulo(this.codulo)
        .pipe(take(1))
        .subscribe(data => {
          this.details = data.data.findHistoryByCodulo;
        })
    );
  }
}
