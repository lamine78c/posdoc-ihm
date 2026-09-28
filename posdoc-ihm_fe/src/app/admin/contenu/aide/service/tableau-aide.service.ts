import { inject, Injectable } from '@angular/core';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { InterrupteurSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-select-editor/interrupteur-select-editor.component';

@Injectable({
  providedIn: 'root',
})
export class TableauAideService {
  private readonly tableauUtilService = inject(TableauUtilService);

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.CONTENU.AIDE;
  private readonly MAX_MESSAGE_LENGTH = 150;


  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          messages: [
            "Suppression d'une aide contextuelle",
            "Vous êtes sur le point de supprimer l'aide contextuelle",
            'Vous êtes sur le point de supprimer les aides contextuelles',
            'Suppression des aides contextuelles',
            'Les aides contextuelles suivantes ne peuvent pas être supprimées',
            "L'aide contextuelle suivante ne peut pas être supprimée",
          ],
          idsLabel: ['pathLabel'],
        }
      }
    };
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: isColSelectAll,
      isNoColEdit: false,
      isNoColDelete: false,
      isColEditPopup: true,
      sortable: false,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getEtatColDef(),
      this.getPageColDef(),
      this.getMessageColDef(),
      this.getDateCreationColDef(),
      this.getDateModificationColDef()
    ];
  }

  private getEtatColDef(): ColDef {
    return {
      headerName: 'Etat',
      field: 'status',
      flex: 1,
      maxWidth: 95,
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
      cellRenderer: InterrupteurSelectEditorComponent,
      cellRendererParams: {
        isAllTimeClickable: true,
        formKey: 'status',
        values: [
          { text: 'Activé', value: 'enabled' },
          { text: 'Désactivé', value: 'disabled' }
        ],
      },
    };
  }

  private getPageColDef(): ColDef {
    return {
      headerName: 'Page',
      field: 'pathLabel',
      flex: 1,
      minWidth: 420,
      resizable: false,
      sortable: false,
      sort: 'asc',
      sortIndex: 0,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      filterValueGetter: (params) => params.data.pathLabel,
      comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
        const orderA = nodeA.data.pathOrder ?? 999999;
        const orderB = nodeB.data.pathOrder ?? 999999;
        return orderA - orderB;
      },
      cellRenderer: (params: any) => this.createPageLink(params),
    };
  }

  private getMessageColDef(): ColDef {
    return {
      headerName: 'Message',
      field: 'message',
      flex: 1,
      minWidth: 420,
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
      cellRenderer: (params) => {
        const truncatedText = this.extractAndTruncateText(params.value);

        const container = document.createElement('div');
        container.style.overflow = 'hidden';
        container.style.textOverflow = 'ellipsis';
        container.style.whiteSpace = 'nowrap';
        container.textContent = truncatedText;

        return container;
      },
    };
  }

  private getDateCreationColDef(): ColDef {
    return {
      headerName: 'Modifié par',
      field: 'updated_by',
      sortable: false,
      flex: 1,
      minWidth: 150,
      resizable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getDateModificationColDef(): ColDef {
    return {
      headerName: 'Date modification',
      field: 'updated_at',
      sortable: false,
      sort: 'desc',
      sortIndex: 1,
      flex: 1,
      minWidth: 150,
      resizable: false,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: Date) => {
          if (!cellValue) return -1;
          const cellDate = new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());
          if (cellDate < filterLocalDateAtMidnight) return -1;
          if (cellDate > filterLocalDateAtMidnight) return 1;
          return 0;
        },
      },
      floatingFilterComponent: 'agDateInput',
      floatingFilter: true,
      valueFormatter: params => {
        if (!params.value) return '';
        return params.value.toLocaleDateString('fr-FR') + ' ' + params.value.toLocaleTimeString('fr-FR');
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }

  private createPageLink(params: any): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = params.value;
    link.style.color = '#007bff';
    link.style.cursor = 'pointer';
    link.style.textDecoration = 'underline';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (params.context?.componentParent?.onPageClick) {
        params.context.componentParent.onPageClick(params.data.id);
      }
    });
    return link;
  }

  private extractAndTruncateText(htmlContent: string, maxLength: number = this.MAX_MESSAGE_LENGTH): string {
    if (!htmlContent) return '';

    // Remplacer les balises de saut de ligne par des espaces avant d'extraire le texte
    let processedHtml = htmlContent;
    processedHtml = processedHtml.replace(/<br\s*\/?>/gi, ' ');
    processedHtml = processedHtml.replace(/<\/p>/gi, ' ');
    processedHtml = processedHtml.replace(/<\/div>/gi, ' ');
    processedHtml = processedHtml.replace(/<\/li>/gi, ' ');

    // Créer un div temporaire pour extraire le texte du HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHtml;
    let textContent = (tempDiv.textContent || tempDiv.innerText || '');

    // Nettoyer les espaces multiples et trim
    textContent = textContent.replace(/\s+/g, ' ').trim();

    // Limiter la longueur du texte
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  }
}
