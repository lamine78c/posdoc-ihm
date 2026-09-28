import { Component, inject, Input, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideDocumentDematerialiseService } from '@app/services/api-adelaide-docments-dematerialise.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { map, Observable } from 'rxjs';
import { DocDemOccurrenceApplication } from '../../models/doc-dem-occurrence-application-interface';
import { ParamsPopupFichiers } from '../../models/params-fichiers-interface';
import { TableauDocDematerialisesFichierService } from './service/tableau-doc-dematerialises-fichier.service';

@Component({
  selector: 'app-documents-dematerialises-fichier',
  templateUrl: './documents-dematerialises-fichier.component.html',
  styleUrls: ['./documents-dematerialises-fichier.component.scss'],
  standalone: false,
})
export class DocumentsDematerialisesFichierComponent implements OnInit {
  @Input() params: ParamsPopupFichiers;

  gridOptions: GridOptions;
  columnDefs: ColDef[];
  rowData$: Observable<DocDemOccurrenceApplication[]>;
  overlayNoRowsTemplate: string;

  private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauDocDematFichierService: TableauDocDematerialisesFichierService = inject(TableauDocDematerialisesFichierService);
  private readonly apiDocDematerialisesService: ApiAdelaideDocumentDematerialiseService = inject(ApiAdelaideDocumentDematerialiseService);

  ngOnInit(): void {
    this.initGridOptions();
    this.initColumnDefs();
    this.initRowData();
  }

  private initGridOptions(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
  }

  private initColumnDefs(): void {
    this.columnDefs = this.tableauDocDematFichierService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauDocDematFichierService.getOverlayNoRowsTemplate();
  }

  private initRowData(): void {
    this.rowData$ = this.apiDocDematerialisesService
      .getDocDematerialisesOccurrenceApplication(this.params)
      .pipe(map(result => result.data.getDocDemOccurrenceApplication));
  }
}
