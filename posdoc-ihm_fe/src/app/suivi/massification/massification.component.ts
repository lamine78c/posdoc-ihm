import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { SuiviMassificationPayloadModel } from '@app/models/suivi/suivi-massification-payload-model';
import { ApiAdelaideSuiviMassificationService } from '@app/services/api-adelaide-suivi-massification.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { TEN_THOUSAND, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, IRowNode, RowDataUpdatedEvent } from 'ag-grid-community';
import { catchError, EMPTY, from, Subscription, switchMap, take } from 'rxjs';
import { TableauSuiviMassificationService } from './service/tableau-suivi-massification.service';

@Component({
  selector: 'app-massification',
  templateUrl: './massification.component.html',
  styleUrls: ['./massification.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class MassificationComponent implements OnInit {
  // Subscriptions
  searchCountQuerySubscription: Subscription;
  searchQuerySubscription: Subscription;

  @ViewChild('excelExportPopup')
  private exportPopupContent: TemplateRef<any>;

  @ViewChild('searchConfirmationPopup')
  private searchConfirmationPopupContent: TemplateRef<any>;

  isExportExpandedForm: FormGroup;

  gridOptions: GridOptions = {};
  columnDefs: ColDef[];
  overlayNoRowsTemplate: string;
  rowData = [];
  nombreRessourceTotal;

  gridApi: GridApi;
  gridColumnApi: GridApi;

  radioLabelList: { label: string; value: string }[] = [
    { label: 'Plié', value: false.toString() },
    { label: 'Déplié', value: true.toString() },
  ];

  apiService = inject(ApiAdelaideSuiviMassificationService);
  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauSuiviMassificationService = inject(TableauSuiviMassificationService);
  generateFileService = inject(GenerateFileService);
  modalService = inject(NgbModal);
  fb = inject(FormBuilder);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.isExportExpandedForm = this.fb.group({
      isExpanded: ['true', Validators.required],
    });
  }

  private initGridOptions() {
    this.gridOptions = {
      onFilterChanged: event => {
        SharedUtil.generatePinnedBottomRowForGroupedRows(event, 'pool', ['pagFic', 'pliFic'], '*** TOTAL ***');
        this.updateTotalRowCount(event);
      },
      onRowDataUpdated: (event: RowDataUpdatedEvent) => {
        SharedUtil.generatePinnedBottomRowForGroupedRows(event, 'pool', ['pagFic', 'pliFic'], '*** TOTAL ***');
        this.updateTotalRowCount(event);
      },
      groupAggFiltering: true,
      suppressAggFuncInHeader: true,
      groupSelectsChildren: true,
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      autoGroupColumnDef: {
        headerName: '',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        // Paramètre custom permettant de gérer l'affichage de l'icône dans l'header
        enableGrouping: true,
      } as ExtendedColDef,
    };
    this.columnDefs = this.tableauSuiviMassificationService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauSuiviMassificationService.getOverlayNoRowsTemplate();
  }

  searchRessource(event) {
    this.sendRequest(event);
  }

  sendRequest(event) {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    const maxMassificationCount = TEN_THOUSAND;
    // On désabonne la précédente recherche avant d'en lancer une nouvelle :
    // searchCountSuiviMassification/searchSuiviMassification sont des watchQuery (jamais terminés)
    // et la réaffectation sans unsubscribe laissait la précédente subscription fuir.
    this.searchCountQuerySubscription?.unsubscribe();
    this.searchCountQuerySubscription = this.apiService
      .searchCountSuiviMassification(this.getSearchPayload(event))
      .pipe(
        take(1),
        switchMap((result: any) => {
          if (result.data.searchCountForSuiviMassification === ZERO) {
            this.rowData = [];
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
            return EMPTY;
          } else if (result.data.searchCountForSuiviMassification > maxMassificationCount) {
            const modalRef = this.modalService.open(this.searchConfirmationPopupContent);
            return from(modalRef.result).pipe(
              switchMap(() => {
                return this.apiService.searchSuiviMassification(this.getSearchPayload(event));
              }),
              catchError(() => {
                return EMPTY;
              })
            );
          } else {
            return this.apiService.searchSuiviMassification(this.getSearchPayload(event));
          }
        })
      )
      .subscribe((result: any) => {
        this.rowData = result.data.searchForSuiviMassification;
        this.rowData = this.rowData.map(e => {
          e.codcom_codfic_numcom = e.codcom + '-' + e.codfic + '-' + e.numcom;
          e.codenv_codorg_codapp = e.codenv + '-' + e.codorg + '-' + e.codapp;
          e.mascom_masfic_masper_codsit = e.mascom + '_' + e.masfic + '_' + e.masper + '_' + e.codsit;
          return e;
        });
      });
  }

  getSearchPayload(event): SuiviMassificationPayloadModel {
    const payload = new SuiviMassificationPayloadModel();
    payload.codenv = event.environnement;
    payload.sitesMas = Object.keys(event.site).filter(key => event.site[key]);
    payload.periodeDebut = event.periode;
    payload.periodeFin = event.periodeFin;
    return payload;
  }

  updateTotalRowCount(event) {
    this.nombreRessourceTotal = ZERO;
    event.api.forEachNodeAfterFilterAndSort(node => {
      if (node.group) {
        this.nombreRessourceTotal += node.allChildrenCount;
      }
    });
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridColumnApi = event.api;
  }

  openExportModal(event: any) {
    this.modalService.open(this.exportPopupContent).result.then(() => {
      this.export(event, this.isExportExpandedForm.get('isExpanded').value === true.toString());
    });
  }

  isExpandedFormValid() {
    return this.isExportExpandedForm.valid;
  }

  export(event: any, isExpanded: boolean) {
    const title = 'Liste des massifications';
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers: string[] = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields: string[] = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data: any[] = [];
    let totalPagFic = ZERO;
    let totalPliFic = ZERO;

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      if (node.group) {
        totalPagFic += node.allLeafChildren.reduce((acc, current) => acc + current.data.pagFic, ZERO);
        totalPliFic += node.allLeafChildren.reduce((acc, current) => acc + current.data.pliFic, ZERO);
        this.createRowParent(node, fields, data, isExpanded);
      } else if (isExpanded) {
        this.createRowChild(node, fields, data);
      }
    });

    this.createTotalRow(fields, data, totalPagFic, totalPliFic);

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  createRowChild(node: IRowNode<any>, fields: string[], data: any[]) {
    const nodeDataCopy = { ...node.data };
    nodeDataCopy['masper'] = nodeDataCopy['percod'];
    nodeDataCopy['libFichier'] = '';
    nodeDataCopy['typsup'] = '';
    nodeDataCopy['codsit'] = '';
    const childData = fields.map(field => nodeDataCopy[field] || null);
    if (!childData[fields.indexOf('pagFic')]) {
      childData[fields.indexOf('pagFic')] = ZERO;
    }
    if (!childData[fields.indexOf('pliFic')]) {
      childData[fields.indexOf('pliFic')] = ZERO;
    }

    data.push(childData);
  }

  createRowParent(node: IRowNode<any>, fields: any[], data: any[], isExpanded: boolean) {
    const parentData = Array(fields.length).fill(null);
    const periode = node.key.split('_').pop();
    parentData.splice(
      ZERO,
      ZERO,
      node.key.replace(`_${periode}`, ''),
      node.allLeafChildren[ZERO]?.data.codsit,
      '',
      periode,
      '',
      isExpanded ? '' : node.allLeafChildren.reduce((acc, current) => acc + (current.data.pagFic ?? ZERO), ZERO),
      isExpanded ? '' : node.allLeafChildren.reduce((acc, current) => acc + (current.data.pliFic ?? ZERO), ZERO),
      '',
      node.allLeafChildren[ZERO]?.data.libFichier ?? '',
      node.allLeafChildren[ZERO]?.data.typsup ?? ''
    );
    data.push(parentData.slice(ZERO, fields.length));
  }

  createTotalRow(fields: string[], data: any[], totalPages: number, totalPli: number) {
    const totalData = Array(fields.length).fill(null);
    totalData.splice(ZERO, ZERO, 'TOTAL', '', '', '', '', totalPages, totalPli, '', '', '');
    data.push(totalData.slice(ZERO, fields.length));
  }
}
