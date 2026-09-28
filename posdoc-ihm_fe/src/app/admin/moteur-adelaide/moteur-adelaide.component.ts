import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauParamsAdelaideService } from './service/tableau-params-adelaide.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AddType } from '@app/models/enums/add-type';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-moteur-adelaide',
  templateUrl: './moteur-adelaide.component.html',
  styleUrls: ['./moteur-adelaide.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class MoteurAdelaideComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreParamAdelaideTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.MOTEUR_ADELAIDE;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauParamsAdelaideService: TableauParamsAdelaideService,
    private readonly apiAdelaideService: ApiAdelaideParametreService,
    private readonly generateFileService: GenerateFileService,
    private readonly noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.columnDefs = this.tableauParamsAdelaideService.getColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableauParamsAdelaideService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllParamsAdelaide().pipe(take(1)).subscribe(data => {
        if (!this.nombreParamAdelaideTotal) {
          this.nombreParamAdelaideTotal = (data as any).data.allParametres.length;
        }
        this.rowData = (data as any).data.allParametres;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    const moteurAdelaide = [...editedRow][ZERO][ONE];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (moteurAdelaide.newRow) {
      moteurAdelaide.newRow = null;
      Object.keys(moteurAdelaide)
        .filter(key => moteurAdelaide[key] === null)
        .forEach(e => delete moteurAdelaide[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createParamAdelaide(moteurAdelaide).subscribe({
        next: ({ data }) => {
          this.noteService.show({
            title: 'Le paramètre Adélaïde "' + (data as any).createParametre.code + '" a été créé avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
          this.asynchronousErrors$.next(errors);
          this.nombreParamAdelaideTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          moteurAdelaide.newRow = true;
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
          this.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
        },
        })
      );
    } else {
      Object.keys(moteurAdelaide)
        .filter(key => moteurAdelaide[key] === null)
        .forEach(e => delete moteurAdelaide[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateParamAdelaide(moteurAdelaide).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le paramètre Adélaïde "' + (data as any).updateParametre.code + '" a été mis à jour avec succès',
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

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.deleteParamAdelaide(event.map(e => e.code)).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.nombreParamAdelaideTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          this.noteService.show({
            title: event.length == ONE ? 'Le paramètre Adelaïde a été supprimé avec succès' : 'Les paramètres Adelaïde ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  /**
   * exporter les données au format pdf ou excel
   * @param event type de fichier a exporter PDF ou Excel
   */
  export(event: any) {
    const title = 'Liste des paramètres du moteur Adelaïde';
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
