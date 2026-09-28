import { Component, inject, Input, OnInit } from '@angular/core';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subscription, take } from 'rxjs';
import { ParamsPopupFichiers } from '../../models/params-fichiers-interface';
import { SearchFacturationsByFichierInput } from '../../models/search-facturations-by-fic-interface';
import { TableauFacturationFichierMassifieService } from './service/tableau-facturation-fichier-massifie.service';

@Component({
  selector: 'app-facturation-fichier',
  templateUrl: './facturation-fichier.component.html',
  styleUrls: ['./facturation-fichier.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class FacturationFichierComponent implements OnInit {
  facturations = [];
  fichiersMas = [];
  @Input() params: ParamsPopupFichiers;
  error;
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  subscriptions: Subscription[] = [];
  private readonly apiAdelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauFacturationFichierMassifieService = inject(TableauFacturationFichierMassifieService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.loadFacturations();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  initGridOptions() {
    this.gridOptions = {
      rowHeight: 30,
      groupSelectsChildren: true,
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      autoGroupColumnDef: {
        headerName: '',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        maxWidth: 35,
        enableGrouping: true,
      } as ExtendedColDef,
      suppressAggFuncInHeader: true,
    };
    this.columnDefs = this.tableauFacturationFichierMassifieService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauFacturationFichierMassifieService.getOverlayNoRowsTemplate();
  }

  loadFacturations() {
    const input: SearchFacturationsByFichierInput = {
      codenv: this.params.codenv,
      codorg: this.params.codorg,
      codapp: this.params.codapp,
      codfic: this.params.codfic,
      codcom: this.params.codcom,
      numcom: this.params.numcom,
      percod: this.params.percod,
    };
    this.subscriptions.push(
      this.apiAdelaideOccurenceApplicationService.searchFacturationsByFichier(input).pipe(take(1)).subscribe({
        next: result => {
          this.facturations = result.data.searchFacturationsByFichier.facturations;
          this.fichiersMas = result.data.searchFacturationsByFichier.fichiersMas ?? [];
        },
        error: () => {
          this.error = 'Une erreur est survenue';
        },
      })
    );
  }
}
