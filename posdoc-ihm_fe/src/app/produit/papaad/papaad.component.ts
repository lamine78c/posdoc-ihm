import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { PapaadIds } from '@app/models/papaad';
import { ApiAdelaidePapaadService } from '@app/services/api-adelaide-papaad.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, PAPAAD_FORMAT_DEFAUT, PAPAAD_TYPEHAS_DEFAUT, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { MutationResult } from 'apollo-angular';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { CreatePapaadInterface } from './model/papaad';
import { TableauPapaadService } from './service/tableau-papaad.service';
@Component({
  selector: 'app-papaad',
  templateUrl: './papaad.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class PapaadComponent implements OnInit, OnDestroy {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = []; //DATA_TABLEAU_MODIFIABLE;

  nombrePapaadTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;
  subscriptions: Subscription[] = [];

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.PAPAAD;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauPapaadService = inject(TableauPapaadService);
  private readonly apiAdelaideService = inject(ApiAdelaidePapaadService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly noteService = inject(NotesService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll),
    };
    if (this.gridOptions.selectionColumnDef) {
      this.gridOptions.selectionColumnDef.pinned = 'left';
    }
    // Colonnes du tableau
    this.columnDefs = this.tableauPapaadService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauPapaadService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllPapaad().pipe(take(1)).subscribe((papaads: any) => {
        this.nombrePapaadTotal ??= papaads.data.allPapaads.length;
        this.rowData = papaads.data.allPapaads;

        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const papaad = [...editedRow][ZERO][ONE];
    papaad.typeHas = papaad.typeHas ?? PAPAAD_TYPEHAS_DEFAUT;
    papaad.format = papaad.format ?? PAPAAD_FORMAT_DEFAUT;
    if (papaad.newRow) {
      papaad.newRow = null;
      Object.keys(papaad)
        .filter(key => papaad[key] === null)
        .forEach(e => delete papaad[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createPapaad(papaad).subscribe({
          next: (data: MutationResult<CreatePapaadInterface>) => {
            this.noteService.show({
              title: 'Le papaad "' + data.data.createPapaad.codeCommande + ' ' + data.data.createPapaad.codeFichier + '" a été créé avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => {
              if (node.data.hasOwnProperty('newRow')) {
                delete node.data.newRow;
              }
            });
            this.nombrePapaadTotal = SharedUtil.getNumberTotalRows(this.gridApi);
            this.asynchronousErrors$.next(errors);
          },
          error: error => {
            papaad.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(papaad)
        .filter(key => papaad[key] === null)
        .forEach(e => delete papaad[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updatePapaad(papaad).subscribe(
          ({ data }) => {
            this.noteService.show({
              title:
                'Le papaad "' +
                (data as any).updatePapaad.codeCommande +
                ' ' +
                (data as any).updatePapaad.codeFichier +
                '" a été mis à jour avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.asynchronousErrors$.next(errors);
          },
          error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          }
        )
      );
    }
  }

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const deletesDTO: PapaadIds[] = event.map(e => {
      return {
        codeCommande: e.codeCommande,
        codeFichier: e.codeFichier,
        codeNotif: e.codeNotif,
      };
    });
    this.subscriptions.push(
      this.apiAdelaideService.deletePapaads(deletesDTO).subscribe(
        () => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == ONE ? 'Le papaad a été supprimé avec succès' : 'Les papaads ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombrePapaadTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
          this.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
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

  ngOnDestroy(): void {
    this.noteService.removeAllStatic();
  }

  export(event: any) {
    const title = 'Liste des Papaads';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title, { columnDefs: columnDefs, pageOrientation: 'landscape' });
  }
}
