import { inject, Injectable } from '@angular/core';
import { CustomTooltipComponent } from '@app/fullstack-components/tableau/ag-grid-components/custom-tooltip/custom-tooltip.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormatUtil } from '@app/shared/utils/FormatUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ITooltipParams, ValueFormatterParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauFacturationDetailleeService {
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauUtilService = inject(TableauUtilService);
  constructor() {
    //No-OP
  }

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les facturations à charger</b>';
  COUT_TOTAL_FIELD = 'coutTotal';
  COUT_FIELD_PREFIX = 'cout';
  PLIS_FIELD_PREFIX = 'plis';

  getBaseColumnDefs(): ColDef[] {
    return [
      this.getColPlus(),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColOrganisme()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColApplication()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColFichier()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColLibFic()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColDateExp()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColSite()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColRegion()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColClient()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColTotalPages()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColTotalPlis()),
      this.tableauConfigurationBuilderService.adaptMinWidth(this.getColTotalCout()),
    ];
  }

  private getColPlus(): ColDef {
    const params: ParamColDefInterface = {
      clearFilter: {
        pinned: 'left',
      },
    };
    return this.tableauUtilService.getColClearFilter(params.clearFilter);
  }

  private getColOrganisme(): ColDef {
    return {
      headerName: 'Org.',
      field: 'codorg',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 65,
      maxWidth: 95,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColApplication(): ColDef {
    return {
      headerName: 'App.',
      field: 'codapp',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 68,
      maxWidth: 98,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColFichier(): ColDef {
    return {
      headerName: 'Fichier',
      field: 'codfic',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 90,
      maxWidth: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: params => {
        const { codcom, codfic } = params.data;
        if (codcom && codfic) {
          return `${codcom}-${codfic}`;
        }
        return codfic || '';
      },
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => (params.data && params.data.libfic ? params.data.libfic : ''),
    };
  }

  private getColLibFic(): ColDef {
    return {
      headerName: 'Désignation',
      field: 'libfic',
      initialHide: true,
    };
  }

  private getColDateExp(): ColDef {
    return {
      headerName: 'Date EXP',
      field: 'dfiexp',
      pinned: 'left',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      flex: 1,
      minWidth: 90,
      maxWidth: 120,
      valueGetter: params => {
        return params.data.dfiexp ? SharedUtil.formatDateToDDMMYYYY(params.data.dfiexp) : '';
      },
    };
  }

  private getColSite(): ColDef {
    return {
      headerName: 'Site',
      field: 'codsit',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 65,
      maxWidth: 95,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColRegion(): ColDef {
    return {
      headerName: 'Région',
      field: 'codreg',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 70,
      maxWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColClient(): ColDef {
    return {
      headerName: 'Client',
      field: 'codcli',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 75,
      maxWidth: 105,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColTotalPages(): ColDef {
    return {
      headerName: 'Total pages',
      field: 'totalPages',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 100,
      maxWidth: 130,
      cellStyle: { justifyContent: 'flex-end' },
      valueFormatter: this.formatNumberWithThousandSeparators,
    };
  }

  private getColTotalPlis(): ColDef {
    return {
      headerName: 'Total plis',
      field: 'totalPlis',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      cellStyle: { justifyContent: 'flex-end' },
      valueFormatter: this.formatNumberWithThousandSeparators,
    };
  }

  private getColTotalCout(): ColDef {
    return {
      headerName: 'Total coût',
      field: 'coutTotal',
      pinned: 'left',
      sortable: true,
      flex: 1,
      minWidth: 130,
      maxWidth: 150,
      cellStyle: { justifyContent: 'flex-end' },
      valueFormatter: this.formatNumberWithThousandSeparators,
    };
  }

  private getDynamicsColumDefs(data: any[]): (ColDef | ColGroupDef)[] {
    const dynamicColumns: ColDef[] = [];
    const uniqueFields = Array.from(this.getUniqueFields(data));
    const orderedFields = this.orderedFields(uniqueFields);

    // Create column definitions for unique fields
    orderedFields.forEach(field => {
      const col: ColDef = {
        headerName: this.getHeaderName(field),
        field: field,
        sortable: true,
        flex: 1,
        minWidth: 100,
        cellStyle: { justifyContent: 'flex-end' },
      };

      if (col.field.includes(this.COUT_FIELD_PREFIX)) {
        this.applyCellStyle(col);
      }
      col.valueFormatter = this.formatNumberWithThousandSeparators;
      dynamicColumns.push(col);
    });

    return [...this.getBaseColumnDefs(), ...dynamicColumns];
  }

  private orderedFields(uniqueFields: string[]) {
    // Separate columns containing "CP" and starting with "pli"
    const pliCpColumns = uniqueFields.filter(field => field.includes('CP') && field.startsWith('plis'));
    const cpColumns = uniqueFields.filter(field => field.includes('CP') && !field.startsWith('plis'));
    const otherColumns = uniqueFields.filter(field => !field.includes('CP')).reverse();

    // Concatenate "pliCP" columns, "CP" columns, and the reversed other columns
    return [...pliCpColumns, ...cpColumns, ...otherColumns];
  }

  private getUniqueFields(data: any[]) {
    // Identify unique coutXX and plisXX fields
    const uniqueFields = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (
          (key.startsWith(this.COUT_FIELD_PREFIX) || key.startsWith(this.PLIS_FIELD_PREFIX)) &&
          row[key] !== null &&
          key !== this.COUT_TOTAL_FIELD
        ) {
          uniqueFields.add(key);
        }
      });
    });
    return uniqueFields;
  }

  private getHeaderName(field: string): string {
    if (field.startsWith(this.COUT_FIELD_PREFIX)) {
      return `Coût ${field.slice(4)}`;
    } else if (field.startsWith(this.PLIS_FIELD_PREFIX)) {
      return `Plis ${field.slice(4)}`;
    }
    return field;
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(data: any[]): (ColDef | ColGroupDef)[] {
    return this.getDynamicsColumDefs(data);
  }

  private formatNumberWithThousandSeparators(params: ValueFormatterParams): string {
    return params.value !== null && params.value !== undefined ? FormatUtil.formatNumberWithThousandSeparators(params.value) : '';
  }

  private applyCellStyle(col: ColDef): void {
    col.cellStyle = params => {
      // Ne pas appliquer le style aux lignes épinglées (pinnedRowCellRenderer)
      if (params.node && params.node.rowPinned) {
        return { justifyContent: 'flex-end' };
      }

      // Appliquer le style seulement aux lignes normales
      return {
        justifyContent: 'flex-end',
        backgroundColor: '#E6F3FE80',
      };
    };
  }
}
