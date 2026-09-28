import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideCereusService } from '@app/services/api-adelaide-cereus.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subscription, take } from 'rxjs';
import { TableauCereusService } from './service/tableau-cereus.service';

@Component({
  selector: 'app-cereus',
  templateUrl: './cereus.component.html',
  styleUrls: ['./cereus.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class CereusComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];

  nombreFluxTotal;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  toastCategoryEnum: typeof ToastCategoryEnum = ToastCategoryEnum;

  options = [
    { value: 'pliDetail', text: 'Occurences de dca_pli_dtail_production' },
    { value: 'fluxProd', text: 'Flux de production à rejouer' },
  ];

  form: FormGroup;

  subscriptions: Subscription[] = [];

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauClientService: TableauCereusService,
    private apiAdelaideService: ApiAdelaideCereusService,
    private generateFileService: GenerateFileService,
    private noteService: NotesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      dateProduction: [null, null],
      typeDonnees: ['pliDetail'],
      switch: ['', null],
    });

    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.gridOptions.suppressDragLeaveHidesColumns = true;

    // Colonnes du tableau
    this.columnDefs = this.tableauClientService.getColumnDefs();
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauClientService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllProductionFlux().pipe(take(1)).subscribe(data => {
        if (!this.nombreFluxTotal) this.nombreFluxTotal = (data as any).data.allProductionFlux.length;
        this.rowData = (data as any).data.allProductionFlux;
        if (!this.nombreFluxTotal) {
          this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
        }
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onDeleteRow(event) {
    this.subscriptions.push(
      this.apiAdelaideService.deleteProductionFlux(event.map(e => e.id)).subscribe(
        ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'Le Flux a été supprimé avec succès' : 'Les Flux ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          //TODO voir pour renvoyer l'erreur à l'interface
        }
      )
    );
  }

  /**
   * Ajoute les erreurs dans la map
   */
  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  export(event: any) {
    const title = 'Liste des flux';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }
}
