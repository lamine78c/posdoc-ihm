import { Component, inject, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { GenerateFileService } from 'src/app/services/generate-file.service';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauEnvironnementService } from './service/tableau-environnement.service';
import { ApiAdelaideEnvironnementService } from '@app/services/api-adelaide-environnement.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-environnement',
  templateUrl: './environnement.component.html',
  styleUrls: ['./environnement.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class EnvironnementComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreEnvironnementTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.ENVIRONNEMENTS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauEnvironnementService: TableauEnvironnementService,
    private readonly apiAdelaideService: ApiAdelaideEnvironnementService,
    private readonly generateFileService: GenerateFileService,
    private readonly noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.columnDefs = this.tableauEnvironnementService.getColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableauEnvironnementService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllEnvironnement().pipe(take(1)).subscribe(data => {
        if (!this.nombreEnvironnementTotal) this.nombreEnvironnementTotal = (data as any).data.allEnvironnements.length;
        this.rowData = (data as any).data.allEnvironnements;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    const environnement = [...editedRow][ZERO][ONE];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (environnement.newRow) {
      environnement.newRow = null;
      Object.keys(environnement)
        .filter(key => environnement[key] === null)
        .forEach(e => delete environnement[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createEnvironnement(environnement).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'L\'environnement "' + (data as any).createEnvironnement.code + '" a été créé avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
            this.asynchronousErrors$.next(errors);
            this.nombreEnvironnementTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            environnement.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
            this.setError(ONE, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(environnement)
        .filter(key => environnement[key] === null)
        .forEach(e => delete environnement[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateEnvironnement(environnement).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'L\'environnement "' + (data as any).updateEnvironnement.code + '" a été mis à jour avec succès',
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

  onDeleteRow(event) {
    this.subscriptions.push(
      this.apiAdelaideService.deleteEnvironnements(event.map(e => e.code)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.nombreEnvironnementTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          this.noteService.show({
            title: event.length == ONE ? "L'environnement a été supprimé avec succès" : 'Les environnements ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          //TODO voir pour renvoyer l'erreur à l'interface
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
    const title = 'Liste des Environnements';
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
