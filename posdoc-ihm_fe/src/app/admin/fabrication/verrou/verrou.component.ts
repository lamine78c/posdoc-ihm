import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ApiAdelaideVerrouService } from 'src/app/services/api-adelaide-verrou.service';
import { TableauVerrouService } from './service/tableau-verrou.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-verrou',
  templateUrl: './verrou.component.html',
  styleUrls: ['./verrou.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class VerrouComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreVerrouTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.FABRICATION.VERROUS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauVerrouService: TableauVerrouService,
    private apiAdelaideService: ApiAdelaideVerrouService,
    private generateFileService: GenerateFileService,
    private noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);

    // Colonnes du tableau
    this.columnDefs = this.tableauVerrouService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauVerrouService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllVerrous().pipe(take(1)).subscribe(data => {
        if (!this.nombreVerrouTotal) this.nombreVerrouTotal = (data as any).data.allVerrous.length;
        this.rowData = (data as any).data.allVerrous;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.deleteVerrous(event.map(e => e.code)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'Le verrou a été supprimé avec succès' : 'Les verrous  ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreVerrouTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  onSaveEdition(editedRow: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    let verrou = [...editedRow][0][1];
    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (verrou.newRow) {
      verrou.newRow = null;
      Object.keys(verrou)
        .filter(key => verrou[key] === null)
        .forEach(e => delete verrou[e]);
      this.subscriptions.push(
        this.apiAdelaideService.createVerrou(verrou).subscribe({
        next: ({ data }) => {
          this.noteService.show({
            title: 'Le verrou ' + (data as any).createVerrou.code + ' a été avec créé succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
          this.asynchronousErrors$.next(errors);
          this.nombreVerrouTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          verrou.newRow = true;
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
        })
      );
    } else {
      Object.keys(verrou)
        .filter(key => verrou[key] === null)
        .forEach(e => delete verrou[e]);
      this.subscriptions.push(
        this.apiAdelaideService.updateVerrou(verrou).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le verrou ' + (data as any).updateVerrou.code + ' a été mis à jour avec succès',
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
    const title = 'Liste des verrous';
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
