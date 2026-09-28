import { Component, inject, Input, OnInit } from '@angular/core';
import { ApiMassificationsService } from '@app/services/api-adelaide/supervision/production/details/api-massifications.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { TableauDetailsMassificationOccurrenceEtapeService } from '../service/tableau-details-massification-occurrence-etape.service';
import { MenuData } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-details-massification-occurrence-etape',
  templateUrl: './details-massification-occurrence-etape.component.html',
  styleUrls: ['./details-massification-occurrence-etape.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DetailsMassificationOccurrenceEtapeComponent implements OnInit {
  @Input() paramData: MenuData;

  gridOptions: GridOptions;
  columnDefs: ColDef[];
  rowData: any = [];
  subscriptions: Subscription[] = [];

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly apiMassificationsService = inject(ApiMassificationsService);
  private readonly tableauDetailsMassificationOccurrenceEtapeService = inject(TableauDetailsMassificationOccurrenceEtapeService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.columnDefs = this.tableauDetailsMassificationOccurrenceEtapeService.getColumnDefs();
    this.getOccurrenceEtapeDetailsMassification();
  }

  getOccurrenceEtapeDetailsMassification(): void {
    const payload = {
      codenv: this.paramData.codenv,
      codorg: this.paramData.codorg,
      codapp: this.paramData.codapp,
      percod: this.paramData.percod,
      codcom: this.paramData.codcom,
      numcom: this.paramData.numcom,
      codfic: this.paramData.codfic,
    };
    this.subscriptions.push(
      this.apiMassificationsService
        .getDetailsMassificationOccurrenceEtape(payload)
        .pipe(take(1))
        .subscribe((result: any) => {
          this.rowData = result.data.findDetailsMassificationForOccurrenceEtape;
          this.rowData = this.rowData.map(e => {
            e.codenv_codorg_codapp = e.codenv + '-' + e.codorg + '-' + e.codapp;
            e.codcom_codfic_numcom = e.codcom + e.codfic + '-' + this.paramData.numcom;
            return e;
          });
        })
    );
  }
}
