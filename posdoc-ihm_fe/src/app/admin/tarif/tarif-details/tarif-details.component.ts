import { Component, inject } from '@angular/core';
import { ApiAdelaideTarifService } from '@app/services/api-adelaide-tarif.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AddType } from '@app/models/enums/add-type';
import { BehaviorSubject, of, Subscription, take } from 'rxjs';
import { ExtendedICellRendererParams, TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauTarifService } from '@app/admin/tarif/service/tableau-tarif.service';
import { switchMap } from 'rxjs/operators';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, TARIF_NUMBER, ZERO } from '@app/shared/utils/Constants';
import { TarifDetail } from '@app/models/tarif';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-tarif-details',
  templateUrl: './tarif-details.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class TarifDetailsComponent implements ICellRendererAngularComp {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  params;
  type;

  addType = AddType.INLINE_ROW;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  subscriptions: Subscription[] = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.TARPOS;
  canPermPosition = this.auth.detail;
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly apiAdelaideService: ApiAdelaideTarifService,
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauTarifService: TableauTarifService,
    private readonly noteService: NotesService
  ) {}

  agInit(params: ExtendedICellRendererParams): void {
    this.rowData = params.data.detail;
    this.type = params.data.type;
    if (!this.type) {
      this.canPermPosition = -ONE;
    }
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.gridOptions.floatingFiltersHeight = ZERO;
    this.params = params;
    this.columnDefs = this.tableauTarifService.getDetailColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableauTarifService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.getData();
  }

  getData(): void {
    if (this.type) {
      this.subscriptions.push(
        this.apiAdelaideService
          .getTarifByType(this.type)
          .pipe(
            switchMap(result => {
              return of(result);
            }),
            take(1)
          )
          .subscribe((tarifs: { data: TarifDetail }) => {
            this.rowData = tarifs.data.getTarifsById;
          })
      );
    } else {
      this.rowData = [];
    }
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    if (editedRow.size > 0) {
      const tarif = [...editedRow][ZERO][ONE];

      const cleanTarif = (row: any) => {
        Object.keys(row)
          .filter(key => tarif[key] === null)
          .forEach(e => delete row[e]);
      };

      if (tarif.newRow) {
        this.createTarpos(tarif, cleanTarif, errors);
      } else {
        this.updateTarpos(cleanTarif, tarif, errors);
      }
    }
  }

  private updateTarpos(cleanTarif: (row: any) => void, tarif, errors: Map<number, TableAsynchronousError[]>) {
    cleanTarif(tarif);
    tarif.dateDebut = SharedUtil.formatDate(tarif.dateDebut);
    if (tarif.dateFin) {
      tarif.dateFin = SharedUtil.formatDate(tarif.dateFin);
    }
    this.subscriptions.push(
      this.apiAdelaideService.updateTarif(tarif).subscribe({
        next: data => {
          this.showSuccessNotification(`Le tarif "${data.data.updateTarif.type}" a été mis à jour avec succès`);
          this.getData();
          this.asynchronousErrors$.next(errors);
        },
        error: error => {
          this.handleGraphQLError(error, errors);
        },
      })
    );
  }

  private createTarpos(tarif, cleanTarif: (row: any) => void, errors: Map<number, TableAsynchronousError[]>) {
    tarif.newRow = null;
    cleanTarif(tarif);
    tarif.type = this.type;
    tarif.numero = TARIF_NUMBER;
    tarif.dateDebut = SharedUtil.formatDate(tarif.dateDebut);
    if (tarif.dateFin) {
      tarif.dateFin = SharedUtil.formatDate(tarif.dateFin);
    }

    this.subscriptions.push(
      this.apiAdelaideService.createTarif(tarif).subscribe({
        next: data => {
          this.showSuccessNotification(`Le tarif "${data.data.createTarif.type}" a été créé avec succès`);
          this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
          this.getData();
          this.asynchronousErrors$.next(errors);
        },
        error: error => {
          tarif.newRow = true;
          this.handleGraphQLError(error, errors);
        },
      })
    );
  }

  onDeleteRow(event: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const deleteTarifs = event.map(e => {
      return { type: e.type, numero: e.numero };
    });

    this.subscriptions.push(
      this.apiAdelaideService
        .deleteTarifs(deleteTarifs)
        .pipe(
          switchMap(result => {
            return of(result);
          })
        )
        .subscribe({
          next: () => {
            this.gridApi.applyTransaction({ remove: event });
            this.gridApi.redrawRows();
            this.showSuccessNotification(event.length === ONE ? 'Le tarif a été supprimé avec succès' : 'Les tarifs ont été supprimés avec succès');
          },
          error: error => {
            this.handleGraphQLError(error, errors);
          },
        })
    );
  }

  private handleGraphQLError(error: any, errors: Map<number, TableAsynchronousError[]>) {
    const err: TableAsynchronousError = {
      isError: true,
      message: error.graphQLErrors?.[ZERO]?.message ?? 'Erreur inconnue',
      id: null,
    };
    this.setError(ONE, err, errors);
    this.asynchronousErrors$.next(errors);
  }

  private showSuccessNotification(message: string) {
    this.noteService.show({
      title: message,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  refresh(): boolean {
    return false;
  }
}
