import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ApiAdelaideGammeService } from 'src/app/services/api-adelaide-gamme.service';
import { GenerateFileService } from 'src/app/services/generate-file.service';
import { TableauGammeService } from './service/tableau-gamme.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { concatMap } from 'rxjs/operators';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';

export interface ColumnDef {
  id: string;
  suppressSorting: boolean;
  suppressFilter: boolean;
}

@Component({
  selector: 'app-gamme',
  templateUrl: './gamme.component.html',
  styleUrls: ['./gamme.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class GammeComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreGammeTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: ColDef[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  verrouData$: BehaviorSubject<any> = new BehaviorSubject([]);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.FABRICATION.GAMMES;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauGammeService: TableauGammeService,
    private readonly apiAdelaideService: ApiAdelaideGammeService,
    private readonly generateFileService: GenerateFileService,
    private readonly noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // Colonnes du tableau
    this.columnDefs = this.tableauGammeService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauGammeService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codeVerrou').cellRendererParams.selectData = this.verrouData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService
        .getAllGammes()
        .pipe(
          concatMap(data => {
            if (!this.nombreGammeTotal) this.nombreGammeTotal = (data as any).data.allGammes.length;
            this.rowData = (data as any).data.allGammes;
            return this.apiAdelaideService.getAllSelectConfig();
          }),
          take(1)
        )
        .subscribe(data => {
          this.verrouData$.next((data as any).data.allVerrous.map(o => ({ value: o.code, text: o.code })).sort((a, b) => a.text.localeCompare(b.text)));
          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    let gamme = [...editedRow][0][1];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (gamme.newRow) {
      gamme.newRow = null;
      Object.keys(gamme)
        .filter(key => gamme[key] === null)
        .forEach(e => delete gamme[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createGamme(gamme).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'La gamme "' + (data as any).createGamme.code + '" a été créée avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
            this.nombreGammeTotal = SharedUtil.getNumberTotalRows(this.gridApi);
            this.asynchronousErrors$.next(errors);
          },
          error: error => {
            gamme.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(gamme)
        .filter(key => gamme[key] === null)
        .forEach(e => delete gamme[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateGamme(gamme).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'La gamme "' + (data as any).updateGamme.code + '" a été mise à jour avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.asynchronousErrors$.next(errors);
          },
          error: error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    }
  }

  /**
   * suppression d'un ou plusieur elements
   * @param event liste des element a supprimer
   */
  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.deleteGammes(event.map(e => e.code)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'La gamme a été supprimée avec succès' : 'Les gammes ont été supprimées avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreGammeTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
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
    const title = 'Liste des gammes';
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
