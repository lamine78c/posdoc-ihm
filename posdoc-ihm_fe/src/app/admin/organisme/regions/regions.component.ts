import { Component, inject, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ApiAdelaideRegionService } from 'src/app/services/api-adelaide-region.service';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauRegionService } from './service/tableau-region.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';
import { ApolloQueryResult } from 'apollo-client';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';

@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class RegionsComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreRegionTotal;
  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.ORGANISMES.REGION;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauRegionService: TableauRegionService,
    private readonly apiAdelaideService: ApiAdelaideRegionService,
    private readonly noteService: NotesService,
    private readonly generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // Colonnes du tableau
    this.columnDefs = this.tableauRegionService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauRegionService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllRegions().pipe(take(1)).subscribe((result: ApolloQueryResult<AllRegionsInterface>) => {
        if (!this.nombreRegionTotal) this.nombreRegionTotal = result.data.allRegions.length;
        this.rowData = result.data.allRegions;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let region = [...editedRow][ZERO][ONE];
    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (region.newRow) {
      region.newRow = null;
      Object.keys(region)
        .filter(key => region[key] === null)
        .forEach(e => delete region[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createRegion(region).subscribe({
          next: () => {
            this.noteService.show({
              title: 'La région a été ajoutée avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);

            this.asynchronousErrors$.next(errors);
            this.nombreRegionTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            region.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(region)
        .filter(key => region[key] === null)
        .forEach(e => delete region[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateRegion(region).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'La région "' + (data as any).updateRegion.code + '" a été mise à jour avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.asynchronousErrors$.next(errors);
          },
          error: error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
            this.setError(ONE, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    }
  }

  onDeleteRow(event: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    this.subscriptions.push(
      this.apiAdelaideService.deleteRegions(event.map(e => e.code)).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == ONE ? 'La region a été supprimé avec succès' : 'Les regions ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreRegionTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
          this.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
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

  /**
   * exporter les données au format pdf ou excel
   * @param event type de fichier a exporter PDF ou Excel
   */
  export(event: any) {
    const title = 'Liste des Régions';
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
