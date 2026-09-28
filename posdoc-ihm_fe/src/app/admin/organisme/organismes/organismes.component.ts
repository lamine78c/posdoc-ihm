import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ApiAdelaideOrganismeService } from 'src/app/services/api-adelaide-organisme.service';
import { TableauOrganismeService } from './service/tableau-organisme.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { concatMap } from 'rxjs/operators';
import { AddType } from '@app/models/enums/add-type';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

export interface Organisme {
  code: string;
  libelle: string;
  adresse1: string;
  adresse2: string;
  adresse3: string;
  adresse4: string;
  type: string;
  codeRegion: string;
  codeSite: string;
}

export interface Creteria {
  column: string;
  value: string;
  operation: string;
}

export interface SortInput {
  column: string;
  direction: string;
}

@Component({
  selector: 'app-organismes',
  templateUrl: './organismes.component.html',
  styleUrls: ['./organismes.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class OrganismesComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreTotal;
  addType = AddType.INLINE_ROW;
  columnDefs: ColDef[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  siteData$: BehaviorSubject<any> = new BehaviorSubject([]);
  regionData$: BehaviorSubject<any> = new BehaviorSubject([]);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.ORGANISMES.ORGANISME;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauOrganismeService: TableauOrganismeService,
    private readonly apiAdelaideService: ApiAdelaideOrganismeService,
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
    this.columnDefs = this.tableauOrganismeService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauOrganismeService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codeRegion').cellRendererParams.selectData = this.regionData$;
    this.columnDefs.find(colDef => colDef.field === 'codeSite').cellRendererParams.selectData = this.siteData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService
        .getAllOrganismes()
        .pipe(
          concatMap(data => {
            if (!this.nombreTotal) this.nombreTotal = (data as any).data.allOrganismes.length;
            this.rowData = (data as any).data.allOrganismes;
            return this.apiAdelaideService.getAllSelectConfig();
          }),
          take(1)
        )
        .subscribe(data => {
          this.regionData$.next((data as any).data.allRegions.map(o => ({ value: o.code, text: o.code })).sort((a, b) => a.text.localeCompare(b.text)));
          this.siteData$.next((data as any).data.allSitesCNP.map(o => ({ value: o.code, text: o.code })).sort((a, b) => a.text.localeCompare(b.text)));
          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  onSaveEdition(editedRow: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    const organisme = [...editedRow][ZERO][ONE];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (organisme.newRow) {
      organisme.newRow = null;
      Object.keys(organisme)
        .filter(key => organisme[key] === null)
        .forEach(e => delete organisme[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createOrganisme(organisme).subscribe({
          next: () => {
            this.noteService.show({
              title: "L'organisme a été ajoutée avec succès",
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);

            this.asynchronousErrors$.next(errors);
            this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            organisme.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
            this.setError(ONE, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(organisme)
        .filter(key => organisme[key] === null)
        .forEach(e => delete organisme[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateOrganisme(organisme).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'L\'organisme "' + (data as any).updateOrganisme.code + '" a été mis à jour avec succès',
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
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    this.subscriptions.push(
      this.apiAdelaideService.deleteOrganismes(event.map(e => e.code)).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == ONE ? "L'organisme a été supprimé avec succès" : 'Les organismes  ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
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
    const title = 'Liste des Organismes';
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
