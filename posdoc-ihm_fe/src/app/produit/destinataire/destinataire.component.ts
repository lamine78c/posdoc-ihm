import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { Destinataire } from '@app/models/destinataire';
import { DestinataireId } from '@app/models/destinataireId';
import { AddType } from '@app/models/enums/add-type';
import { ApiAdelaideDestinataireService } from '@app/services/api-adelaide-destinataire.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PopupFormulaireCreationComponent } from './popup/popup-formulaire-creation/popup-formulaire-creation.component';
import { TableauDestinataireService } from './service/tableau-destinataire.service';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-destinataire',
  templateUrl: './destinataire.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class DestinataireComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  modalRef: NgbModalRef;

  subscriptions: Subscription[] = [];

  rowData: any = [];
  columnDefs: ColDef[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  params: any;
  nombreTotal;
  addType = AddType.INLINE_ROW;
  organismes: any = [];

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.DESTINATAIRES;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauDestinataireService: TableauDestinataireService,
    private apiAdelaideDestinataireService: ApiAdelaideDestinataireService,
    private generateFileService: GenerateFileService,
    private noteService: NotesService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // Colonnes du tableau
    this.columnDefs = this.tableauDestinataireService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauDestinataireService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codeOrg').floatingFilterComponentParams.selectData = this.organismeData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.appelServiceApi();
  }

  appelServiceApi() {
    this.subscriptions.push(
      this.apiAdelaideDestinataireService.getAllDestinataires().pipe(take(1)).subscribe(data => {
        this.nombreTotal = (data as any).data.allDestinataires.length;
        let rowsData: any = [];
        rowsData = (data as any).data.allDestinataires;
        let organWithRegion = (data as any).data.allOrganismes;
        this.rowData = rowsData.map(e => {
          e.codeRegion = organWithRegion.filter(n => n.code == e.codeOrg)[0].codeRegion;
          return e;
        });
        this.organismeData$.next(
          organWithRegion
            //.map(o => ({value: o.code, text: o.libelle, codeRegion: o.codeRegion}))
            .sort((a, b) => a.code.localeCompare(b.code))
        );
        this.organismes = organWithRegion
          //.map(o => ({value: o.code, text: o.libelle, codeRegion: o.codeRegion}))
          .sort((a, b) => a.code.localeCompare(b.code));
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let row = [...editedRow][0][1];
    if (row.newRow) {
    } else {
      this.subscriptions.push(
        this.apiAdelaideDestinataireService.updateDestinataire(new Destinataire(row.code, row.codeOrg, row.libelle, row.refPri)).subscribe(
          ({ data }) => {
            this.noteService.show({
              title: 'Le destinataire ' + (data as any).updateDestinataire.code + ' a été mis à jour avec succès',
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
    this.subscriptions.push(
      this.apiAdelaideDestinataireService.deleteDestinataires(event.map(e => new DestinataireId(e.code, e.codeOrg))).subscribe(
        ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'Le destinataire a été supprimé avec succès' : 'Les destinataires ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
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

  export(event: any) {
    const title = 'Liste des destinataires';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.map((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.map((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  openPopup(event): void {
    const modalRef = this.modalService.open(PopupFormulaireCreationComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.organismes = this.organismes;
    modalRef.componentInstance.passEntry.subscribe(receivedEntry => {
      if (receivedEntry) {
        this.appelServiceApi();
      }
    });
  }
}
