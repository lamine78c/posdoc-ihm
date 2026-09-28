import { LoginService } from '@acoss/prisme-angular-intranet';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { PopupErreurComponent } from '@app/admin/popup/popup-erreur/popup-erreur.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ExtendedColDef, TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { NUM_FIRST_BTN_MODAL, NUM_SECOND_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { SearchBonTravailDtoInterface } from '@app/models/exploitation-editique/bon-travail/search-bon-travail-dto-interface';
import { SearchBonTravailPayloadInterface } from '@app/models/exploitation-editique/bon-travail/search-bon-travail-payload-interface';
import { ApiBonTravailService } from '@app/services/api-adelaide/exploitation-editique/bon-travail/api-bon-travail.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_MODIFIER_AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { TableauBonTravailService } from '@app/suivi/bon-travail/service/tableau-bon-travail.service';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CellValueChangedEvent, ColDef, GridApi, GridOptions, GridReadyEvent, IRowNode, RowDataUpdatedEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { BonTravailUpdateInput, UserInfoInput } from './model/bon-travail-update-models';
import { ApiBonTravailUpdateService } from './service/api-bon-travail-update.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { FORMID_BONS_TRAVAIL } from '@app/shared/utils/Constants_formid';

@Component({
  selector: 'app-bon-travail',
  templateUrl: './bon-travail.component.html',
  styleUrls: ['./bon-travail.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class BonTravailComponent implements OnInit {
  form: FormGroup;
  bonTravailData: SearchBonTravailDtoInterface[] = [];
  totalBonTravail = 0;
  totalPagefic = 0;
  bonTravailEnMasseUpdateInput: BonTravailUpdateInput[] = [];
  bonTravailSingleUpdateInput: BonTravailUpdateInput = null;
  lastSearchEvent: any;
  bonTravailUpdateResultat: any;

  gridOptions: GridOptions = {};
  columnDefs: ColDef[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  noDataMessage = '<b>Veuillez remplir le formulaire pour afficher les bons de travail</b>';
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  idsHighlight = [];
  isSingleChangeNotSubmited = false;
  private readonly auth = AUTH.SUIVI.BONS_TRAVAIL;
  canEditPermPosition = this.auth[KEY_MODIFIER_AUTH];
  hasEditPerm = false;
  isSearchDisabled = false;
  isSearching = false;
  subscriptions: Subscription[] = [];

  private readonly apiBonTravailService = inject(ApiBonTravailService);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauBonTravailService = inject(TableauBonTravailService);
  private readonly fb = inject(FormBuilder);
  private readonly apiBonTravailUpdateService = inject(ApiBonTravailUpdateService);
  private readonly loginService = inject(LoginService);
  private readonly datepipe = inject(DatePipe);
  private readonly noteService = inject(NotesService);
  private readonly modalService = inject(NgbModal);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly servicePerm = inject(PermissionService);
  private readonly filterSharedDataService = inject(FilterSharedDataService);
  private readonly popupConfirmationService = inject(PopupConfirmationService);
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.columnDefs = this.tableauBonTravailService.getColumnDefs(false, this.isColSelectAll);
    this.initForm();
    this.hasEditPerm = this.servicePerm.hasPermission(AUTH.SUIVI.BONS_TRAVAIL.modifier);
    this.subscriptions.push(this.filterSharedDataService.getData().subscribe(isDisabled => (this.isSearchDisabled = isDisabled)));
  }

  initForm() {
    this.form = this.fb.group({
      dateExp: [''],
      infos: [''],
    });
  }

  searchBonTravail(event: any) {
    if (this.isSomeChangeNotSubmited()) {
      const modalRef = this.modalService.open(PopupErreurComponent);
      modalRef.componentInstance.messages = [
        'Changement non sauvegardé',
        'Des modifications non enregistrées ont été détectées.',
        'Êtes-vous sûr de lancer la recherche ?',
      ];
      modalRef.result.catch(error => {
        if (error == NUM_SECOND_BTN_MODAL) {
          this.toSearchBonTravail(event);
        }
      });
    } else {
      this.toSearchBonTravail(event);
    }
  }

  toSearchBonTravail(event: any) {
    if (this.isSearching) {
      return;
    }
    this.isSearching = true;
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    this.lastSearchEvent = event;
    const payload = this.searchBonTravailPayload(event);

    this.subscriptions.push(
      this.apiBonTravailService.searchBonTravail(payload).pipe(take(1)).subscribe({
        next: result => {
          const responseData = result?.data?.searchBonTravail;
          const bonsTravail = responseData?.groupedBonTravail ?? [];
          const message = responseData?.message;

          if (message) {
            this.popupConfirmationService.popupTooManyResultsConfirmation(message);
            this.isSearching = false;
            return;
          }

          if (bonsTravail.length === 0) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
            this.bonTravailData = [];
            this.isSearching = false;
            return;
          }

          this.totalBonTravail = bonsTravail.length;
          this.bonTravailData = bonsTravail.map(e => {
            e.codfic_codcom_numcom = e.codcom + e.codfic + '-' + e.numcom;
            e.codapp_codorg_codenv = e.codenv + '-' + e.codorg + '-' + e.codapp;
            e.id = e.codenv + e.codorg + e.codapp + e.percod + e.codcom + e.numcom + e.codfic;
            e.dfiexp_old = e.dfiexp;
            e.inform_old = e.inform;
            return e;
          });

          this.removeAllChanges();
          this.isSearching = false;
        },
        error: () => {
          this.isSearching = false;
        },
      })
    );
  }

  searchBonTravailPayload(event: any): SearchBonTravailPayloadInterface {
    const rawOrg = event.codorg;
    const org: string[] = [];
    SharedUtil.extractSelectedOrgs(rawOrg, org);

    return {
      codenv: event.codenv ? event.codenv : null,
      codorg: org.length ? org : null,
      codapp: event.codapp ? event.codapp : null,
      percod: event.percod ? event.percod : null,
      codcom: event.codcom ? event.codcom : null,
      codfic: event.codfic ? event.codfic : null,
      codcli: event.codcli ? event.codcli : null,
      codbon: event.codbon ? event.codbon : null,
      codsit: event.codsit ? event.codsit : null,
      dappcrDeb: event.dappcrDeb ? event.dappcrDeb : null,
      dappcrFin: event.dappcrFin ? event.dappcrFin : null,
      dfiexpDeb: event.dfiexpDeb ? event.dfiexpDeb : null,
      dfiexpFin: event.dfiexpFin ? event.dfiexpFin : null,
      isDateEmpty: !!event.isDateEmpty,
      delmsp: event.delmsp ? event.delmsp : null,
    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridColumnApi = event.api;
  }

  export(event: any) {
    const noticesColumnCount = this.getNoticesColumnCount();
    const title = 'Bons de travail';
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs: { headerName: string; field: string }[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName && columnDef.field !== 'codsit')
      .map((col: ColDef) => ({
        headerName: col.headerName,
        field: col.field,
      }));
    const noticeCols = Array(noticesColumnCount)
      .fill(null)
      .map((_value, index) => ({
        headerName: `Notice ${index + 1}`,
        field: `notic${index + 1}`,
      }));
    columnDefs.push(...noticeCols);
    const headers: string[] = columnDefs.flatMap(columnDef => columnDef.headerName);
    const fields: string[] = columnDefs.flatMap(columnDef => columnDef.field);
    const data = [];
    const noticesColumns = Array(noticesColumnCount).fill(null);

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      this.createRow(node, fields, data, noticesColumns);
    });

    this.generateFileService[fileServiceMap[event.type]](data, headers, title, { columnDefs: columnDefs });
  }

  getNoticesColumnCount(): number {
    let columnCount = 0;
    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      if (node.data.libnot.length > columnCount) {
        columnCount = node.data.libnot.length;
      }
    });
    return columnCount;
  }

  createRow(node: IRowNode<any>, fields: any[], data: any[], noticesColumns: string[]) {
    const rowData = Array(fields.length + noticesColumns.length).fill(null);
    const nodeData = node.data;
    noticesColumns.splice(0, noticesColumns.length, ...nodeData.libnot);
    rowData.splice(
      0,
      0,
      nodeData.codbon,
      `${nodeData.codenv}-${nodeData.codorg}-${nodeData.codapp}`,
      nodeData.percod,
      `${nodeData.codcom}${nodeData.codfic}-${nodeData.numcom}`,
      nodeData.pagfic,
      nodeData.plific,
      SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeData.dappcr),
      SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeData.drecep),
      SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeData.dfiexp),
      nodeData.delmsp,
      nodeData.libnot?.length ?? 0,
      nodeData.inform,
      ...noticesColumns
    );
    data.push(rowData.splice(0, fields.length + noticesColumns.length));
  }

  initGridOptions() {
    this.gridOptions = {
      groupSelectsChildren: true,
      ...this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll),
      rowClassRules: {
        'ag-row-highlighted': params => {
          return this.idsHighlight.length && this.idsHighlight.includes(params.data.id);
        },
      },
      autoGroupColumnDef: {
        headerName: '',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        // Paramètre custom permettant de gérer l'affichage de l'icône dans l'header
        enableGrouping: true,
      } as ExtendedColDef,
      suppressAggFuncInHeader: true,
      onRowDataUpdated: (event: RowDataUpdatedEvent) => {
        this.totalPagefic = SharedUtil.calculateColumnSum(event, 'pagfic');
      },
      onFilterChanged: event => {
        this.totalPagefic = SharedUtil.calculateColumnSum(event, 'pagfic');
        this.updateTotalRowCount(event);
      },
      onCellValueChanged: (event: CellValueChangedEvent) => {
        if (event.colDef.cellRendererParams?.isEditing) {
          this.isSingleChangeNotSubmited = true;
        }
      },
    };
  }

  updateTotalRowCount(event) {
    this.totalBonTravail = 0;
    event.api.forEachNodeAfterFilterAndSort(node => {
      if (!node.group) {
        this.totalBonTravail += 1;
      }
    });
  }

  findRowBonTravailDataByNode(node: RowNode): SearchBonTravailDtoInterface {
    return this.bonTravailData.find(e => e.id === node.data.id);
  }

  getMessageApplicDateExpIfExist() {
    let toShowMsgDate = false;
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      const oldDateExpStr = this.findRowBonTravailDataByNode(node)?.dfiexp_old;
      if (!!oldDateExpStr) {
        toShowMsgDate = true;
      }
    });
    if (toShowMsgDate) {
      const modalRef = this.modalService.open(PopupConfirmationComponent);
      modalRef.componentInstance.messages = [
        "Confirmation d'appliquer des dates de l'expéditions sur les dates qui ont déjà des saisies",
        'Attention',
        'Attention',
      ];
      modalRef.componentInstance.rowDataArray = ["Certains produits ont déjà une date d'expédition - Veuillez confirmer"];
      modalRef.componentInstance.firstButton = { label: 'Confirmer', icone: 'icon-b_valid' };
      modalRef.componentInstance.secondButton = { label: 'Abandonner', icone: 'icon-b_cancel' };
      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          this.appliquerDateExp();
        }
      });
    } else {
      this.appliquerDateExp();
    }
  }

  checkInListAndUpdateDateExp(node: RowNode, newDateExpStr: string): boolean {
    let isInList = false;
    this.bonTravailEnMasseUpdateInput.forEach(e => {
      if (e.id === node.data.id) {
        e.datexp = newDateExpStr;
        isInList = true;
      }
    });
    return isInList;
  }

  addInListWithNewDateExp(node: RowNode, newDateExpStr: string) {
    const rowToApplic = new BonTravailUpdateInput();
    rowToApplic.codenv = node.data.codenv;
    rowToApplic.codorg = node.data.codorg;
    rowToApplic.codapp = node.data.codapp;
    rowToApplic.percod = node.data.percod;
    rowToApplic.codcom = node.data.codcom;
    rowToApplic.codfic = node.data.codfic;
    rowToApplic.numcom = node.data.numcom;
    rowToApplic.datexp = newDateExpStr;
    rowToApplic.inform = node.data.inform;
    rowToApplic.id = node.data.id;
    this.bonTravailEnMasseUpdateInput.push(rowToApplic);
  }

  updateNodeDfiexp(node: RowNode, newDateExp: NgbDateStruct) {
    node.setDataValue('dfiexp', new Date(newDateExp.year, newDateExp.month - 1, newDateExp.day));
  }

  appliquerDateExp(): void {
    const newDateExp = this.form.get('dateExp').value;
    const newDateExpStr = newDateExp['year'] + '-' + newDateExp['month'] + '-' + newDateExp['day'];
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      if (!this.checkInListAndUpdateDateExp(node, newDateExpStr)) {
        this.addInListWithNewDateExp(node, newDateExpStr);
      }
      newDateExp && this.updateNodeDfiexp(node, newDateExp);
    });
  }

  getMessageApplicInfofExist() {
    let toShowMsgInfo = false;
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      const oldInform = this.findRowBonTravailDataByNode(node)?.inform_old;
      if (!!oldInform) {
        toShowMsgInfo = true;
      }
    });
    if (toShowMsgInfo) {
      const modalRef = this.modalService.open(PopupConfirmationComponent);
      modalRef.componentInstance.messages = [
        "Confirmation d'appliquer des informations complémentaires sur les informations qui ont déjà des saisies",
        'Attention',
        'Attention',
      ];
      modalRef.componentInstance.rowDataArray = ['Certains produits ont déjà des infos complémentaires - Veuillez confirmer'];
      modalRef.componentInstance.firstButton = { label: 'Confirmer', icone: 'icon-b_valid' };
      modalRef.componentInstance.secondButton = { label: 'Abandonner', icone: 'icon-b_cancel' };
      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          this.appliquerInfos();
        }
      });
    } else {
      this.appliquerInfos();
    }
  }

  checkInListAndUpdateInfo(node: RowNode, newInfo: string): boolean {
    let isInList = false;
    this.bonTravailEnMasseUpdateInput.forEach(e => {
      if (e.id === node.data.id) {
        e.inform = newInfo;
        isInList = true;
      }
    });
    return isInList;
  }

  addInListWithNewInfo(node: RowNode, newInfo: string) {
    const rowToApplic = new BonTravailUpdateInput();
    rowToApplic.codenv = node.data.codenv;
    rowToApplic.codorg = node.data.codorg;
    rowToApplic.codapp = node.data.codapp;
    rowToApplic.percod = node.data.percod;
    rowToApplic.codcom = node.data.codcom;
    rowToApplic.codfic = node.data.codfic;
    rowToApplic.numcom = node.data.numcom;
    rowToApplic.datexp = node.data.dfiexp;
    rowToApplic.inform = newInfo;
    rowToApplic.id = node.data.id;
    this.bonTravailEnMasseUpdateInput.push(rowToApplic);
  }

  updateNodeInform(node: RowNode, newInfo: string) {
    node.setDataValue('inform', newInfo);
  }

  appliquerInfos(): void {
    const newInfo = this.form.get('infos').value;
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      if (!this.checkInListAndUpdateInfo(node, newInfo)) {
        this.addInListWithNewInfo(node, newInfo);
      }
      this.updateNodeInform(node, newInfo);
    });
  }

  isAppliqueEnMasseDateExpAuthorised(): boolean {
    const dateExp = this.form.get('dateExp').value;
    const isSomeNodesSelected = !!this.gridApi?.getSelectedNodes()?.length;
    return dateExp && isSomeNodesSelected && !this.isSomeSingleChangeNotSubmited();
  }

  isAppliqueEnMasseInfosAuthorised(): boolean {
    const isSomeNodesSelected = !!this.gridApi?.getSelectedNodes()?.length;
    return isSomeNodesSelected && !this.isSomeSingleChangeNotSubmited();
  }

  isSomeChangeNotSubmited(): boolean {
    return this.isSomeMultiChangeNotSubmited() || this.isSomeSingleChangeNotSubmited();
  }

  isSomeMultiChangeNotSubmited(): boolean {
    return !!this.bonTravailEnMasseUpdateInput.length;
  }

  isSomeSingleChangeNotSubmited(): boolean {
    return this.isSingleChangeNotSubmited;
  }

  removeAllChanges(): void {
    this.isSingleChangeNotSubmited = false;
    this.bonTravailSingleUpdateInput = null;
    this.idsHighlight = [];
    this.bonTravailEnMasseUpdateInput = [];
  }

  getBonTravailUpdateInput(input: BonTravailUpdateInput[]): BonTravailUpdateInput[] {
    const FORMAT_TO_TRANSFORM = 'yyyy-MM-dd 23:59:59';
    return input.map(e => {
      e.datexp = this.datepipe.transform(e.datexp, FORMAT_TO_TRANSFORM);
      return e;
    });
  }

  getUserInfoInput() {
    const userInfo = new UserInfoInput();
    userInfo.user = this.getUtilisateur();
    userInfo.formid = FORMID_BONS_TRAVAIL;
    return userInfo;
  }

  validerEnMasse() {
    this.valider(false);
  }

  valider(isSingleUpdate: boolean): void {
    if (this.hasEditPerm) {
      const errors: Map<number, TableAsynchronousError[]> = new Map();
      const input = isSingleUpdate ? [this.bonTravailSingleUpdateInput] : this.bonTravailEnMasseUpdateInput;
      this.idsHighlight = [];
      this.apiBonTravailUpdateService.updateBonTravail(this.getBonTravailUpdateInput(input), this.getUserInfoInput()).subscribe({
        next: response => {
          this.bonTravailUpdateResultat = response;
          this.toShowMessageOk();
          this.asynchronousErrors$.next(errors);
          this.removeAllChanges();
          this.searchBonTravail(this.lastSearchEvent);
        },
        error: error => {
          this.toShowMessageError(error.graphQLErrors[0].message, isSingleUpdate);
          this.gridApi?.redrawRows();
        },
      });
    }
  }

  toShowMessageOk(): void {
    this.noteService.show({
      title:
        this.bonTravailUpdateResultat.data.updateBonTravail.length == 1
          ? 'La sauvegarde est effectuée avec succès. '
          : 'Les sauvegardes sont effectuées avec succès.',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }

  toShowMessageError(messages: string, isSingleUpdate: boolean): void {
    messages.split(',').forEach(msg => {
      // séparateur message
      let title = '';
      const arrayMessage = msg.split(':'); // séparateur id&message
      if (arrayMessage.length > 1) {
        this.updateIdsHighlight(arrayMessage[0].trim(), isSingleUpdate);
        title = arrayMessage[1].trim();
      } else {
        title = arrayMessage[0].trim();
      }
      this.noteService.show({
        title: title,
        classname: 'note-erreur',
        category: ToastCategoryEnum.ERROR,
      });
    });
  }

  updateIdsHighlight(id: string, isSingleUpdate: boolean): void {
    if (isSingleUpdate) {
      this.idsHighlight = [id];
    } else {
      this.bonTravailEnMasseUpdateInput.find(e => e.id === id) && this.idsHighlight.push(id);
    }
  }

  getUtilisateur() {
    return this.loginService.getIdentifiantUtilisateur();
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isSomeChangeNotSubmited()) {
      return new Observable(observer => {
        const modalRef = this.modalService.open(PopupErreurComponent);
        modalRef.componentInstance.messages = [
          'Changement non sauvegardé',
          'Des modifications non enregistrées ont été détectées.',
          'Êtes-vous sûr de vouloir quitter ?',
        ];
        modalRef.result.catch(error => {
          const res = error == NUM_SECOND_BTN_MODAL ? true : false;
          if (res) {
            this.removeAllChanges();
          }
          observer.next(res);
        });
      });
    }
    return true;
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  onSaveEdition(editedRow: Map<number, any>) {
    if (!![...editedRow].length) {
      const row = [...editedRow][0][1];
      const errors: Map<number, TableAsynchronousError[]> = new Map();
      this.gridApi.forEachNode(node => {
        if (node.data.id === row.id) {
          // check modification
          if (node.data.dfiexp_old && !row.dfiexp) {
            // on ne peut pas supprimer une date existe
            const err: TableAsynchronousError = { isError: true, message: "La date d'expédition ne peut pas être vide", id: null };
            this.setError(1, err, errors);
          }
        }
      });
      this.asynchronousErrors$.next(errors);
      if (errors.size === 0) {
        const rowToApplic = new BonTravailUpdateInput();
        rowToApplic.codenv = row.codenv;
        rowToApplic.codorg = row.codorg;
        rowToApplic.codapp = row.codapp;
        rowToApplic.percod = row.percod;
        rowToApplic.codcom = row.codcom;
        rowToApplic.codfic = row.codfic;
        rowToApplic.numcom = row.numcom;
        rowToApplic.datexp = row.dfiexp;
        rowToApplic.inform = row.inform;
        rowToApplic.id = row.id;
        this.bonTravailSingleUpdateInput = rowToApplic;
        this.valider(true);
      }
    }
  }

  onCancelEdition() {
    this.bonTravailSingleUpdateInput = null;
    this.isSingleChangeNotSubmited = false;
  }
}
