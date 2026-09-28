import { inject, Injectable } from '@angular/core';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { FaqNotification } from '@app/models/notification';

@Injectable({
  providedIn: 'root',
})
export class TableauFaqService {
  private readonly tableauUtilService = inject(TableauUtilService);

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.CONTENU.FAQ;
  private readonly MAX_QUESTION_LENGTH = 100;
  private readonly MAX_ANSWER_LENGTH = 150;

  notifications: FaqNotification[];

  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          messages: [
            "Suppression d'une question FAQ",
            'Vous êtes sur le point de supprimer la question FAQ',
            'Vous êtes sur le point de supprimer les questions FAQ',
            'Suppression des questions FAQ',
            'Les questions FAQ suivantes ne peuvent pas être supprimées',
            'La question FAQ suivante ne peut pas être supprimée',
          ],
          idsLabel: ['question'],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: isColSelectAll,
      isNoColEdit: false,
      isNoColDelete: false,
      isColEditPopup: true,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getStatusColDef(),
      this.getPathColDef(),
      this.getQuestionColDef(),
      this.getAnswerColDef(),
      this.getViewCountColDef(),
      this.getUpdatedByColDef(),
      this.getUpdatedAtColDef(),
    ];
  }

  private getStatusColDef(): ColDef {
    return {
      headerName: 'Statut',
      field: 'status',
      flex: 1,
      minWidth: 95,
      resizable: false,
      sortable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleLabelWithValues: [
          { label: 'Brouillon', value: 'draft' },
          { label: 'Activé', value: 'enabled' },
          { label: 'Désactivé', value: 'disabled' },
        ],
        suppressFilterButton: true,
      },
    };
  }

  private getPathColDef(): ColDef {
    return {
      headerName: 'Page',
      field: 'pathLabel',
      flex: 1,
      minWidth: 300,
      resizable: false,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      filterValueGetter: params => params.data.pathLabel,
      comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
        const orderA = nodeA.data.pathOrder ?? 999999;
        const orderB = nodeB.data.pathOrder ?? 999999;
        return orderA - orderB;
      },
    };
  }

  private getQuestionColDef(): ColDef {
    return {
      headerName: 'Question',
      field: 'question',
      flex: 1,
      minWidth: 300,
      sortable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      wrapText: false,
      autoHeight: false,
      cellStyle: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      cellRenderer: params => {
        const truncatedText = this.truncateText(params.value, this.MAX_QUESTION_LENGTH);
        const container = document.createElement('div');
        container.style.overflow = 'hidden';
        container.style.textOverflow = 'ellipsis';
        container.style.whiteSpace = 'nowrap';
        container.style.lineHeight = '1.5';
        container.style.paddingBottom = '2px';
        container.textContent = truncatedText;
        return container;
      },
    };
  }

  private getAnswerColDef(): ColDef {
    return {
      headerName: 'Réponse',
      field: 'answer',
      flex: 1,
      minWidth: 300,
      sortable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      wrapText: false,
      autoHeight: false,
      cellStyle: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      cellRenderer: params => {
        if (!params.value) {
          const container = document.createElement('div');
          container.style.fontStyle = 'italic';
          container.style.color = '#999';
          container.textContent = 'Aucune réponse';
          return container;
        }
        const truncatedText = this.extractAndTruncateText(params.value);
        const container = document.createElement('div');
        container.style.overflow = 'hidden';
        container.style.textOverflow = 'ellipsis';
        container.style.whiteSpace = 'nowrap';
        container.style.lineHeight = '1.5';
        container.style.paddingBottom = '2px';
        container.textContent = truncatedText;
        return container;
      },
    };
  }

  private getViewCountColDef(): ColDef {
    return {
      headerName: 'Nb. lectures',
      field: 'viewCount',
      flex: 1,
      minWidth: 90,
      resizable: false,
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'agNumberInput',
    };
  }

  private getUpdatedByColDef(): ColDef {
    return {
      headerName: 'Modifié par',
      field: 'updatedBy',
      sortable: false,
      flex: 1,
      minWidth: 150,
      resizable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getUpdatedAtColDef(): ColDef {
    return {
      headerName: 'Date modification',
      field: 'updatedAt',
      sortable: true,
      sort: 'desc',
      sortIndex: 0,
      flex: 1,
      minWidth: 180,
      resizable: false,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (!cellValue) return -1;
          const cellDate = new Date(cellValue);
          const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          if (cellDateOnly < filterLocalDateAtMidnight) return -1;
          if (cellDateOnly > filterLocalDateAtMidnight) return 1;
          return 0;
        },
      },
      floatingFilterComponent: 'agDateInput',
      floatingFilter: true,
      valueFormatter: params => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }

  private extractAndTruncateText(htmlContent: string, maxLength: number = this.MAX_ANSWER_LENGTH): string {
    if (!htmlContent) return '';
    let processedHtml = htmlContent;
    processedHtml = processedHtml.replace(/<br\s*\/?>/gi, ' ');
    processedHtml = processedHtml.replace(/<\/p>/gi, ' ');
    processedHtml = processedHtml.replace(/<\/div>/gi, ' ');
    processedHtml = processedHtml.replace(/<\/li>/gi, ' ');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHtml;
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    textContent = textContent.replace(/\s+/g, ' ').trim();
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
