import { Component, inject, OnInit } from '@angular/core';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { OccurrenceApplicationSuiviProductionQuery } from '@app/models/payload/search-occurrence-application-suivi-production';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { ColDef, GridApi, GridOptions, GridReadyEvent, IRowNode } from 'ag-grid-community';
import { BehaviorSubject, filter, map, Observable, startWith, switchMap } from 'rxjs';
import { TableauOccurrenceApplicationService } from './service/tableau-occurrence-application.service';
import { OccurrenceApplicationFilter } from '@app/models/suivi/occurrence-application-interface';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommandeDetailsComponent } from '../modal/commande-details/commande-details.component';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { DetailsModalComponent } from '@app/shared/components/modal/details/details-modal.component';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';

@Component({
  selector: 'app-occurrences-application',
  templateUrl: './occurrences-application.component.html',
  styleUrls: ['./occurrences-application.component.scss'],
  standalone: false,
})
export class OccurrencesApplicationComponent implements OnInit {
  rowData$: Observable<any[]>;
  gridOptions: GridOptions;
  columnDefs: ColDef[];
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  searchFilter$: BehaviorSubject<OccurrenceApplicationFilter> = new BehaviorSubject(null);

  private readonly modalService: NgbModal = inject(NgbModal);
  private readonly generateFileService: GenerateFileService = inject(GenerateFileService);
  private readonly popupConfirmationService: PopupConfirmationService = inject(PopupConfirmationService);
  private readonly apiOccurrenceApplication: ApiAdelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);
  private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauOccurrenceApplicationService: TableauOccurrenceApplicationService = inject(TableauOccurrenceApplicationService);

  constructor() {
    //no-op
  }

  ngOnInit(): void {
    this.initRowData();
    this.initGridOptions();
    this.initColumnDefs();
    this.initModals();
    this.overlayNoRowsTemplate = this.tableauOccurrenceApplicationService.getOverlayNoRowsTemplate();
  }

  private initRowData(): void {
    this.rowData$ = this.searchFilter$.pipe(
      filter(filter => !!filter),
      switchMap(filter => {
        const query = this.getQuery(filter);
        return this.apiOccurrenceApplication.getOccurrenceApplicationForSuiviProduction(query).pipe(
          map(result => {
            const responseData = result.data;
            const occurrencesApplication = responseData.getOccurrenceApplicationForSuiviProduction.occurrencesApplication;
            const message = responseData.getOccurrenceApplicationForSuiviProduction.message;

            if (message) {
              this.popupConfirmationService.popupTooManyResultsConfirmation(message);
              return [];
            }

            return occurrencesApplication.map(occurrence => {
              occurrence.codenv_codorg_codapp_percod = `${occurrence.codenv}_${occurrence.codorg}_${occurrence.codapp}_${occurrence.percod}`;
              return occurrence;
            });
          })
        );
      }),
      startWith([])
    );
  }

  private initGridOptions(): void {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      rowClassRules: {
        'ag-row-hidden': params => !params.node.group && params.data.codcom === null,
      },
      groupAggFiltering: true,
      suppressAggFuncInHeader: true,
      groupSelectsChildren: true,
      groupDefaultExpanded: -1,
      autoGroupColumnDef: {
        headerName: '',
        field: 'groupField',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        // Paramètre custom permettant de gérer l'affichage de l'icône dans l'header
        enableGrouping: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'actionRendererClearFilter',
        floatingFilterComponentParams: {},
      } as ExtendedColDef,
    };
  }

  private initColumnDefs(): void {
    this.columnDefs = this.tableauOccurrenceApplicationService.getColumnDefs();
  }

  private initModals(): void {
    this.tableauOccurrenceApplicationService.setCommandeModalCallback((codenv, codorg, codapp) => {
      this.openCommandeDetailsModal(codenv, codorg, codapp);
    });
    this.tableauOccurrenceApplicationService.setDetailsOccurrenceModalCallback((paramData: OngletsParamDataModel) => {
      this.openDetailsOccurrenceModal(paramData);
    });
  }

  private getQuery(filter: OccurrenceApplicationFilter): OccurrenceApplicationSuiviProductionQuery {
    return {
      codenv: filter.codenv,
      codorgs: filter.codorgs,
      codapp: filter.codapp,
      percod: filter.percod,
      codsit: filter.codsit,
    };
  }

  public onSearchOccurrencesApplication(filter: OccurrenceApplicationFilter) {
    this.searchFilter$.next(filter);
  }

  private openCommandeDetailsModal(codenv: string, codorg: string, codapp: string): void {
    const modalRef = this.modalService.open(CommandeDetailsComponent, { size: 'lg' });
    modalRef.componentInstance.codenv = codenv;
    modalRef.componentInstance.codorg = codorg;
    modalRef.componentInstance.codapp = codapp;
  }

  private openDetailsOccurrenceModal(paramData: OngletsParamDataModel): void {
    const modalRef = this.modalService.open(DetailsModalComponent);
    modalRef.componentInstance.paramData = paramData;
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  export(event: any): void {
    const title = "Liste des occurrences d'application";
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs: ColDef[] = this.gridApi.getColumnDefs().filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers: string[] = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields: string[] = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data: any[] = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      if (node.group) {
        this.createRowParent(node, fields, data);
      } else if (node.data['codcom'] !== null) {
        this.createRowChild(node, fields, data);
      }
    });

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  private createRowChild(node: IRowNode<any>, fields: string[], data: any[]) {
    const nodeDataCopy = { ...node.data };
    nodeDataCopy['codenv'] = '';
    nodeDataCopy['percod'] = '';
    nodeDataCopy['codsit'] = `${nodeDataCopy['codcom']}-${nodeDataCopy['codfic']}-${nodeDataCopy['numcom']}`;
    nodeDataCopy['statut'] = `${nodeDataCopy['ficsta']}-${nodeDataCopy['ficinf']}`;
    nodeDataCopy['frefec'] = nodeDataCopy['frefec'] ? 'OUI' : 'NON';
    nodeDataCopy['ficvid'] = nodeDataCopy['ficvid'] ? 'OUI' : 'NON';
    nodeDataCopy['manuel'] = nodeDataCopy['manuel'] ? 'OUI' : 'NON';
    const dateFields = new Set(['dappcr', 'dfichd', 'dficht', 'dfichs']);
    const childData = fields.map(field => {
      if (dateFields.has(field)) {
        return SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeDataCopy[field]);
      }
      return nodeDataCopy[field] ?? null;
    });
    data.push(childData);
  }

  createRowParent(node: IRowNode<any>, fields: any[], data: any[]) {
    const parentData = Array(fields.length).fill(null);
    const periode = node.key.split('_').pop();
    const firstChildData = node.allLeafChildren[ZERO]?.data;
    parentData.splice(
      ZERO,
      ZERO,
      node.key.replace(`_${periode}`, '').replace('_', '-'),
      firstChildData.percod ?? '',
      firstChildData.codsit ?? '',
      '',
      `${firstChildData.appsta}-${firstChildData.appinf}`,
      firstChildData.arefec ? 'OUI' : 'NON',
      firstChildData.ficvid ? 'OUI' : 'NON',
      '',
      SharedUtil.formatDateToDDMMYYYYHHMMSS(firstChildData.dappld) ?? '',
      SharedUtil.formatDateToDDMMYYYYHHMMSS(firstChildData.dapplt) ?? '',
      SharedUtil.formatDateToDDMMYYYYHHMMSS(firstChildData.dappls) ?? '',
      firstChildData.manuel ? 'OUI' : 'NON'
    );
    data.push(parentData.slice(ZERO, fields.length));
  }
}
