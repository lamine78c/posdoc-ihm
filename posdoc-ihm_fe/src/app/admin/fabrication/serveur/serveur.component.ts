import { Component, inject, OnInit } from '@angular/core';

import { ApiAdelaideServeurService } from '../../../services/api-adelaide-serveur.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { TableauServeurService } from './service/tableau-serveur.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-serveur',
  templateUrl: './serveur.component.html',
  styleUrls: ['./serveur.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ServeurComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  addType = AddType.INLINE_ROW;

  nombreServeurTotal;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.FABRICATION.SERVEURS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauServeurService: TableauServeurService,
    private readonly apiAdelaideService: ApiAdelaideServeurService,
    private readonly generateFileService: GenerateFileService,
    private readonly noteService: NotesService,
    private readonly formatterService: FormattersService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // Colonnes du tableau
    this.columnDefs = this.tableauServeurService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauServeurService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

      this.subscriptions.push(
        this.apiAdelaideService.getAllServers().pipe(take(1)).subscribe((servers: any) => {
          if (!this.nombreServeurTotal) this.nombreServeurTotal = servers.data.allServers.length;
          this.rowData = servers.data.allServers.map(server => ({
            ...server,
            teste: this.formatterService.lookupValue(this.tableauServeurService.testeMapping, server.teste),
            actif: this.formatterService.lookupValue(this.tableauServeurService.etatMapping, server.actif),
          }));
          this.gridApi.setGridOption('loading', false);
        })
      );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    let serveur = [...editedRow][0][1];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (serveur.newRow) {
      serveur.newRow = null;
      Object.keys(serveur)
        .filter(key => serveur[key] === null)
        .forEach(e => delete serveur[e]);
      serveur.actif = serveur.actif == 'Actif';
      serveur.teste = serveur.teste == 'Testé';
      this.subscriptions.push(
        this.apiAdelaideService.createServer(serveur).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le serveur "' + (data as any).createServer.code + '" a été créé avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
            this.nombreServeurTotal = SharedUtil.getNumberTotalRows(this.gridApi);
            this.asynchronousErrors$.next(errors);
          },
          error: error => {
            serveur.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(serveur)
        .filter(key => serveur[key] === null)
        .forEach(e => delete serveur[e]);
      serveur.actif = serveur.actif == 'Actif';
      serveur.teste = serveur.teste == 'Testé';
      this.subscriptions.push(
        this.apiAdelaideService.updateServer(serveur).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le serveur "' + (data as any).updateServer.code + '" a été mis à jour avec succès',
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

  onDeleteRow(event) {
    this.subscriptions.push(
      this.apiAdelaideService.deleteServers(event.map(e => e.code)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'Le serveur a été supprimé avec succès' : 'Les serveurs ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreServeurTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {},
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
    const title = 'Liste des serveurs';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title, {
      action: 'fgColor',
      column: [
        { index: 6, texte: 'Inactif', color: 'FF9999' },
        { index: 6, texte: 'Actif', color: 'FF99FF99' },
      ],
    });
  }
}
