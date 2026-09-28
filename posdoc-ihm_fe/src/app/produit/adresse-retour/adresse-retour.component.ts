import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { DeleteAdresseRetourInput } from '@app/models/adresseRetour';
import { AddType } from '@app/models/enums/add-type';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { ModalAddAdressComponent } from './modal/modal-add-adress/modal-add-adress.component';
import { TableauAdresseRetourService } from './service/tableau-adresse-retour.service';
import { DetailAdresseRetourComponent } from '@app/produit/adresse-retour/detail-adresse-retour/detail-adresse-retour.component';
import { CommunicationAdresseRetourService } from '@app/produit/adresse-retour/service/communication-adresse-retour.service';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-adresse-retour',
  templateUrl: './adresse-retour.component.html',
  standalone: false,
})
export class AdresseRetourComponent implements OnInit, OnDestroy {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  columnDefs: ColDef[];
  rowData: any[] = [];
  allAdressesRetourId: any = [];

  addType = AddType.INLINE_ROW;

  gridApi: GridApi;
  gridColumnApi: GridApi;
  nombreTotal;
  params: GridReadyEvent;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  organismes: any = [];
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  applications: any = [];
  subscriptions: Subscription[] = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.ADRESSES_RETOUR;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauAdresseRetourService: TableauAdresseRetourService,
    private readonly apiAdelaideAdresseRetourService: ApiAdelaideAdresseRetourService,
    private readonly noteService: NotesService,
    private readonly generateFileService: GenerateFileService,
    private readonly modalService: NgbModal,
    private readonly communicationAdresseRetourService: CommunicationAdresseRetourService
  ) {}

  ngOnInit(): void {
    // Colonnes du tableau
    this.columnDefs = this.tableauAdresseRetourService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauAdresseRetourService.getOverlayNoRowsTemplate();
    this.columnDefs.find(colDef => colDef.field === 'codeOrganisme').cellRendererParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'codeOrganisme').floatingFilterComponentParams.selectData = this.organismeData$;
    this.initGridOptions();
    this.rowAddedIndetail();
  }

  initGridOptions(): void {
    // Configuration générale du tableau
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll),
    };
    this.gridOptions.masterDetail = true;
    this.gridOptions.detailRowAutoHeight = false;
    this.gridOptions.detailRowHeight = 350;

    this.gridOptions.detailCellRenderer = DetailAdresseRetourComponent;
  }

  rowAddedIndetail() {
    this.subscriptions.push(
      this.communicationAdresseRetourService.triggerMethod$.subscribe(() => {
        this.appelServiceApi();
      })
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.appelServiceApi();
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    if ([...editedRow].length > ZERO) {
      const adresseRetour = [...editedRow][ZERO][ONE];
      this.cleanAdresseRetourData(adresseRetour);

      if (adresseRetour.newRow) {
        this.createAdresseRetour(adresseRetour, errors);
      } else {
        this.updateAdresseRetour(adresseRetour, errors);
      }
    }
  }

  private cleanAdresseRetourData(adresseRetour: any) {
    delete adresseRetour.collapse;
    delete adresseRetour.codeRegion;
    delete adresseRetour.detail;
  }

  private removeNullProperties(obj: any) {
    Object.keys(obj)
      .filter(key => obj[key] === null)
      .forEach(key => delete obj[key]);
  }

  private createAdresseRetour(adresseRetour: any, errors: Map<number, TableAsynchronousError[]>) {
    adresseRetour.newRow = null;
    this.removeNullProperties(adresseRetour);

    this.subscriptions.push(
      this.apiAdelaideAdresseRetourService.createAdressesRetour([adresseRetour]).subscribe(
        ({ data }) => {
          this.handleCreateSuccess(data, errors);
        },
        error => {
          this.handleCreateError(adresseRetour, error, errors);
        }
      )
    );
  }

  private handleCreateSuccess(data: any, errors: Map<number, TableAsynchronousError[]>) {
    this.noteService.show({
      title: 'L\'adresse retour "' + (data as any).createAdressesRetour[ZERO].code + '" a été créée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });

    this.gridApi.forEachNode(node => {
      if (node.data.hasOwnProperty('newRow')) {
        node.data.collapse = '';
        node.data.detail = [];
        node.data.codeRegion = SharedUtil.getCodeRegionByCodeOrg(this.organismes, node.data.codeOrganisme);
        delete node.data.newRow;
      }
    });

    this.asynchronousErrors$.next(errors);
    this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
  }

  private handleCreateError(adresseRetour: any, error: any, errors: Map<number, TableAsynchronousError[]>) {
    adresseRetour.newRow = true;
    const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
    this.setError(1, err, errors);
    this.asynchronousErrors$.next(errors);
  }

  private updateAdresseRetour(adresseRetour: any, errors: Map<number, TableAsynchronousError[]>) {
    this.removeNullProperties(adresseRetour);
    const cleanedData = this.prepareUpdateData(adresseRetour);

    this.subscriptions.push(
      this.apiAdelaideAdresseRetourService.updateAdresseRetour(cleanedData).subscribe(
        ({ data }) => {
          this.handleUpdateSuccess(data, errors);
        },
        error => {
          this.handleUpdateError(error, errors);
        }
      )
    );
  }

  private prepareUpdateData(adresseRetour: any) {
    const cleanedData = Object.assign({}, adresseRetour);
    delete cleanedData['collapse'];
    delete cleanedData['detail'];
    delete cleanedData['fichiers'];
    delete cleanedData['codeRegion'];
    return cleanedData;
  }

  private handleUpdateSuccess(data: any, errors: Map<number, TableAsynchronousError[]>) {
    this.noteService.show({
      title: 'L\'adresse retour "' + (data as any).updateAdresseRetour.code + '" a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    this.asynchronousErrors$.next(errors);
  }

  private handleUpdateError(error: any, errors: Map<number, TableAsynchronousError[]>) {
    const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
    this.setError(1, err, errors);
    this.asynchronousErrors$.next(errors);
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
    const title = 'Liste des adresses retour';
    const { headers, fields, headersDetail, fieldsDetail } = this.prepareExportColumns();
    const rowDataVide: any[] = fields.map(() => null);
    const rowDetailDataVide: any[] = fieldsDetail.map(() => null);
    const { dataExcel, dataPDF, nbrRows } = this.collectExportData(fields, fieldsDetail, rowDataVide, rowDetailDataVide);

    this.generateExportFile(event.type, dataExcel, dataPDF, headers, headersDetail, title, nbrRows);
  }

  private prepareExportColumns() {
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const columnDefsDetail: (ColDef | ColGroupDef)[] = this.tableauAdresseRetourService
      .getDetailColumnDefs(this.isColSelectAll)
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);

    return {
      headers: columnDefs.map((columnDef: ColDef) => columnDef.headerName),
      headersDetail: columnDefsDetail.map((columnDef: ColDef) => columnDef.headerName),
      fields: columnDefs.map((columnDef: ColDef) => columnDef.field),
      fieldsDetail: columnDefsDetail.map((columnDef: ColDef) => columnDef.field),
    };
  }

  private collectExportData(fields: any[], fieldsDetail: any[], rowDataVide: any[], rowDetailDataVide: any[]) {
    const dataExcel: any[] = [];
    const dataPDF: any[] = [];
    let nbrRows = 0;

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      const rowData = fields.map(fieldName => (node.data[fieldName] !== '' ? node.data[fieldName] : null));

      if (node.data['detail']?.length) {
        this.processNodeWithDetails(node, rowData, fieldsDetail, rowDataVide, dataExcel, dataPDF);
      } else {
        dataExcel.push([...rowData, ...rowDetailDataVide]);
        dataPDF.push([...rowData, ...rowDetailDataVide]);
      }
      nbrRows++;
    });

    return { dataExcel, dataPDF, nbrRows };
  }

  private processNodeWithDetails(node: any, rowData: any[], fieldsDetail: any[], rowDataVide: any[], dataExcel: any[], dataPDF: any[]) {
    let isfirstlinePDF = true;

    node.data['detail'].forEach(dn => {
      const rowDataDetail = fieldsDetail.map(key => (dn[key] !== '' ? dn[key] : null));
      dataExcel.push([...rowData, ...rowDataDetail]);

      if (isfirstlinePDF) {
        dataPDF.push([...rowData, ...rowDataDetail]);
        isfirstlinePDF = false;
      } else {
        dataPDF.push([...rowDataVide, ...rowDataDetail]);
      }
    });
  }

  private generateExportFile(type: string, dataExcel: any[], dataPDF: any[], headers: any[], headersDetail: any[], title: string, nbrRows: number) {
    const allHeaders = [...headers, ...headersDetail];

    if (type === 'exportAsPDF') {
      this.generateFileService.generatePDFFile(dataPDF, allHeaders, title, {
        pageOrientation: 'landscape',
        withDetail: true,
        nombreTotal: nbrRows,
      });
    } else if (type === 'exportAsExcel') {
      this.generateFileService.generateExcelFile(dataExcel, allHeaders, title, { nombreTotal: nbrRows });
    }
  }

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const deletesDTO = this.buildDeleteDTOs(event);

    this.subscriptions.push(
      this.apiAdelaideAdresseRetourService.deleteAdressesRetour(deletesDTO).subscribe(
        ({ data }) => {
          this.handleDeleteSuccess(event);
        },
        error => {
          this.handleDeleteError(error, errors);
        }
      )
    );
  }

  private buildDeleteDTOs(event: any[]): DeleteAdresseRetourInput[] {
    return event.map(app => {
      const adresseRetourId: DeleteAdresseRetourInput = new DeleteAdresseRetourInput();
      adresseRetourId.codeOrganisme = app.codeOrganisme;
      adresseRetourId.code = app.code;
      return adresseRetourId;
    });
  }

  private handleDeleteSuccess(event: any[]) {
    this.gridApi.applyTransaction({ remove: event });
    this.gridApi.redrawRows();

    const successMessage = event.length == 1
      ? "L'adresse retour a été supprimée avec succès"
      : 'Les adresses retour ont été supprimées avec succès';

    this.noteService.show({
      title: successMessage,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
  }

  private handleDeleteError(error: any, errors: Map<number, TableAsynchronousError[]>) {
    const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
    this.setError(ONE, err, errors);
    this.asynchronousErrors$.next(errors);
  }

  appelServiceApi() {
    this.subscriptions.push(
      this.apiAdelaideAdresseRetourService.getAllAdressesRetour().pipe(take(1)).subscribe(data => {
        this.processApiResponse(data);
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  private processApiResponse(data: any) {
    const responseData = (data as any).data;
    this.nombreTotal = responseData.allAdressesRetour.length;
    this.allAdressesRetourId = [];

    this.organismes = responseData.allOrganismes;
    this.applications = responseData.allApplications;

    this.updateOrganismeData(responseData.allOrganismes);
    this.rowData = this.transformAdressesRetourData(responseData.allAdressesRetour);
  }

  private updateOrganismeData(allOrganismes: any[]) {
    // récuperer les données organismes pour le select d'ajout et pour le filtre du tableau
    this.organismeData$.next(
      allOrganismes
        //.map(o => ({value: o.code, text: o.code, codeRegion: o.codeRegion}))
        .sort((a, b) => a.code.localeCompare(b.code))
    );
  }

  private transformAdressesRetourData(adressesRetour: any[]): any[] {
    return adressesRetour.map(e => {
      e.collapse = '';
      e.detail = e.fichiers !== null ? e.fichiers : [];
      delete e.fichiers;
      e.codeRegion = SharedUtil.getCodeRegionByCodeOrg(this.organismes, e.codeOrganisme);
      this.allAdressesRetourId.push({ code: e.code, codeOrganisme: e.codeOrganisme });
      return e;
    });
  }

  openPopupAjoutEnMasse(): void {
    const modalRef = this.modalService.open(ModalAddAdressComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.organismes = this.organismes;
    modalRef.componentInstance.applications = this.applications;
    modalRef.componentInstance.allAdressesRetourId = this.allAdressesRetourId;
    modalRef.componentInstance.passEntry.subscribe(receivedEntry => {
      if (receivedEntry) {
        this.appelServiceApi();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
