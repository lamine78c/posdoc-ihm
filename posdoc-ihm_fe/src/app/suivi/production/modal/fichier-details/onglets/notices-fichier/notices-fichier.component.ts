import { Component, inject, Input, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { TableauNoticesFichierService } from './service/tableau-notices-fichier.service';
import { map, Observable } from 'rxjs';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { ParamsPopupFichiers } from '../../models/params-fichiers-interface';
import { SearchNoticesOccurrenceApplicationQuery } from '../../models/search-notices-occ-app-interface';

@Component({
  selector: 'app-notices-fichier',
  templateUrl: './notices-fichier.component.html',
  styleUrls: ['./notices-fichier.component.scss'],
  standalone: false,
})
export class NoticesFichierComponent implements OnInit {
  @Input() params: ParamsPopupFichiers;

  gridOptions: GridOptions;
  columnDefs: ColDef[];
  rowData$: Observable<any[]>;
  overlayNoRowsTemplate: string;

  private readonly apiNoticesService: ApiNoticesService = inject(ApiNoticesService);
  private readonly tableauNoticesFichierService: TableauNoticesFichierService = inject(TableauNoticesFichierService);
  private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);

  ngOnInit(): void {
    this.initGridOptions();
    this.initColumnDefs();
    this.initRowData();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
  }

  private initColumnDefs() {
    this.columnDefs = this.tableauNoticesFichierService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauNoticesFichierService.getOverlayNoRowsTemplate();
  }

  private initRowData() {
    this.rowData$ = this.apiNoticesService
      .getNoticesOccurrenceApplication(this.getSearchNoticesOccurrenceApplicationQuery())
      .pipe(map(result => result.data.getNoticesOccurrenceApplication));
  }

  private getSearchNoticesOccurrenceApplicationQuery(): SearchNoticesOccurrenceApplicationQuery {
    return {
      codenv: this.params?.codenv,
      codorg: this.params?.codorg,
      codapp: this.params?.codapp,
      percod: this.params?.percod,
      codcom: this.params?.codcom,
      codfic: this.params?.codfic,
      numcom: this.params?.numcom,
    };
  }
}
