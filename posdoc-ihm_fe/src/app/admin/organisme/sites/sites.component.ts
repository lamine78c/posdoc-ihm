import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { concatMap } from 'rxjs/operators';
import { ApiAdelaideSiteService } from 'src/app/services/api-adelaide-site.service';
import { TableauSiteService } from './service/tableau-site.service';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SitesComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];
  addType = AddType.INLINE_ROW;
  nombreSiteTotal;

  subscriptions: Subscription[] = [];

  columnDefs: ColDef[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  ressourceData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.ORGANISMES.SITE;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauRegionService: TableauSiteService,
    private readonly apiAdelaideService: ApiAdelaideSiteService,
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

    this.columnDefs.find(colDef => colDef.field === 'organismeMassification').floatingFilterComponentParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'organismeMassification').cellRendererParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'ressourceDelestage').cellRendererParams.selectData = this.ressourceData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService
        .getAllSitesCNP()
        .pipe(
          concatMap(data => {
            if (!this.nombreSiteTotal) this.nombreSiteTotal = (data as any).data.allSitesCNP.length;
            this.rowData = (data as any).data.allSitesCNP;
            this.organismeData$.next((data as any).data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
            return this.apiAdelaideService.getAllSelectConfig();
          }),
          take(1)
        )
        .subscribe(data => {
          this.ressourceData$.next(
            ([...new Map((data as any).data.allRessources.map(item => [item['code'], item])).values()] as any)
              .map(o => ({ value: o.code, text: o.code }))
              .sort((a, b) => a.text.localeCompare(b.text))
          );
          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  onSaveEdition(editedRow: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const site = [...editedRow][ZERO][ONE];
    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (site.newRow) {
      site.newRow = null;
      Object.keys(site)
        .filter(key => site[key] === null)
        .forEach(e => delete site[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createSite(site).subscribe({
          next: () => {
            this.noteService.show({
              title: 'Le site a été ajouté avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);

            this.asynchronousErrors$.next(errors);
            this.nombreSiteTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            site.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
            this.setError(ONE, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(site)
        .filter(key => site[key] === null)
        .forEach(e => delete site[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateSite(site).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le site "' + (data as any).updateSiteCNP.code + '" a été mis à jour avec succès',
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
      this.apiAdelaideService.deleteSites(event.map(e => e.code)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == ONE ? 'Le site a été supprimé avec succès' : 'Les sites ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreSiteTotal = SharedUtil.getNumberTotalRows(this.gridApi);
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
    const title = 'Liste des Sites';
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
