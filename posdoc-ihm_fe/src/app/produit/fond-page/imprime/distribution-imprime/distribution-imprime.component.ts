import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { TableauImprimeService } from '@app/produit/fond-page/imprime/service/tableau-imprime.service';
import { ApiAdelaideImprimeService } from '@app/services/api-adelaide-imprime.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PermissionService } from '@app/services/permission/permission.service';
import { ApolloQueryResult } from 'apollo-client';
import { AllImprimeInterface } from '../model/imprime.interface';

@Component({
  selector: 'app-distribution-imprime',
  templateUrl: './distribution-imprime.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class DistributionImprimeComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  listeDesTypesComposition: any;
  listeDesTypesCouleur: any;

  subscriptions: Subscription[] = [];

  rowData: any = [];

  nombreImprimesTotal: number;
  addType = AddType.INLINE_ROW;

  columnDefs: ColDef[];

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  typeCompositionData$: BehaviorSubject<any> = new BehaviorSubject([]);
  typeCouleurData$: BehaviorSubject<any> = new BehaviorSubject([]);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauImprimeService: TableauImprimeService,
    private apiAdelaideImprimeService: ApiAdelaideImprimeService,
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
    this.columnDefs = this.tableauImprimeService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauImprimeService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'typeComposition').cellRendererParams.selectData = this.typeCompositionData$;
    this.columnDefs.find(colDef => colDef.field === 'typeCouleur').cellRendererParams.selectData = this.typeCouleurData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // init data
    this.initDataGrid();
  }

  export(event: any) {
    const title = 'Liste des Imprimés';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.map((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.map((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title, { columnDefs: columnDefs });
  }

  initDataGrid(): void {
    // Show spinner
    this.gridApi.setGridOption('loading', true);
    this.subscriptions.push(
      this.apiAdelaideImprimeService
        .getAllImprimes()
        .pipe(take(1))
        .subscribe((imprimes: ApolloQueryResult<AllImprimeInterface>) => {
          this.listeDesTypesComposition = imprimes.data.allComposs;
          this.listeDesTypesCouleur = imprimes.data.allColimps;
          this.rowData = imprimes.data.allImprimes.map(row => ({
            ...row,
            typeComposition: imprimes.data.allComposs.filter(e => e.typmef == row.typeComposition)[0]?.libmef,
            typeCouleur: imprimes.data.allColimps.filter(e => e.typcol == row.typeCouleur)[0]?.libcol,
          }));
          this.nombreImprimesTotal = imprimes.data.allImprimes.length;

          this.typeCompositionData$.next(
            imprimes.data.allComposs.map(o => ({ value: o.libmef, text: o.libmef })).sort((a, b) => a.text.localeCompare(b.text))
          );
          this.typeCouleurData$.next(
            imprimes.data.allColimps.map(o => ({ value: o.libcol, text: o.libcol })).sort((a, b) => a.text.localeCompare(b.text))
          );

          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  lister(event: string): void {
    this.subscriptions.push(
      this.apiAdelaideImprimeService
        .getAllImprimes()
        .pipe(take(1))
        .subscribe((imprimes: ApolloQueryResult<AllImprimeInterface>) => {
          this.rowData = imprimes.data.allImprimes
            .filter(i => i.reference.toUpperCase().includes(event.toUpperCase()))
            .map(row => ({
              ...row,
              typeComposition: imprimes.data.allComposs.filter(e => e.typmef == row.typeComposition)[0]?.libmef,
              typeCouleur: imprimes.data.allColimps.filter(e => e.typcol == row.typeCouleur)[0]?.libcol,
            }));
        })
    );
  }

  onDeleteRow(event: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    this.subscriptions.push(
      this.apiAdelaideImprimeService.deleteImprimes(event.map(e => e.reference)).subscribe(
        ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? "L'imprimé a été supprimé avec succès" : 'Les imprimés ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreImprimesTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
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

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let imprime = [...editedRow][0][1];

    // si newRow, creation d'une nouvelle ligne, si non mise a jours
    if (imprime.newRow) {
      imprime.newRow = null;
      Object.keys(imprime)
        .filter(key => imprime[key] === null)
        .forEach(e => delete imprime[e]);
      // replace value of selected elements by key that need to be persisted into DB
      const newImprime = { ...imprime };
      newImprime.typeComposition = this.listeDesTypesComposition.filter(e => e.libmef === imprime.typeComposition).map(e => e.typmef)[0];
      newImprime.typeCouleur = this.listeDesTypesCouleur.filter(e => e.libcol === imprime.typeCouleur).map(e => e.typcol)[0];
      this.subscriptions.push(
        this.apiAdelaideImprimeService.createImprime(newImprime).subscribe(
          ({ data }) => {
            this.noteService.show({
              title: 'L\'imprimé "' + (data as any).createImprime.reference + '" a été créé avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
            this.asynchronousErrors$.next(errors);
            this.nombreImprimesTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error => {
            imprime.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          }
        )
      );
    } else {
      Object.keys(imprime)
        .filter(key => imprime[key] === null)
        .forEach(e => delete imprime[e]);
      // replace value of selected elements by key that need to be persisted into DB
      const updatedImprime = { ...imprime };
      updatedImprime.typeComposition = this.listeDesTypesComposition.filter(e => e.libmef === imprime.typeComposition).map(e => e.typmef)[0];
      updatedImprime.typeCouleur = this.listeDesTypesCouleur.filter(e => e.libcol === imprime.typeCouleur).map(e => e.typcol)[0];
      this.subscriptions.push(
        this.apiAdelaideImprimeService.updateImprime(updatedImprime).subscribe(
          ({ data }) => {
            this.noteService.show({
              title: 'L\'imprimé "' + (data as any).updateImprime.reference + '" a été mis à jour avec succès',
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
}
