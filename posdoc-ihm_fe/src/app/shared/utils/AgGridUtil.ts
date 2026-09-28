import { FilterChangedEvent, GridApi, RowDataUpdatedEvent, RowNode, ValueGetterParams } from 'ag-grid-community';
import { ArrayUtil } from '@app/shared/utils/ArrayUtil';
import { FormatUtil } from '@app/shared/utils/FormatUtil';

export class AgGridUtil {
  static getGroupedFields(params: ValueGetterParams, groupedField: string, childField: string): string {
    if (params.node.group) {
      const firstChildIndex = 0;
      return params.node.allLeafChildren[firstChildIndex]?.data[groupedField] ?? '';
    } else if (params.data) {
      return params.data[childField];
    }
  }

  static getGroupedFieldsAllConcat(params: ValueGetterParams, groupedField: any[], childField: any[], sep: string): string {
    if (params.node.group && !!groupedField) {
      const firstChildIndex = 0;
      return groupedField
        .filter(field => params.node.allLeafChildren[firstChildIndex]?.data[field])
        ?.map(field => params.node.allLeafChildren[firstChildIndex].data[field])
        .join(sep);
    } else if (params.data) {
      return childField
        .filter(f => params.data[f])
        ?.map(f => params.data[f])
        .join(sep);
    }
  }

  static getGroupedFieldsConcat(params: ValueGetterParams, groupedField: string, childField: any[], sep: string): string {
    if (params.node.group && !!groupedField) {
      const firstChildIndex = 0;
      return params.node.allLeafChildren[firstChildIndex]?.data[groupedField] ?? '';
    } else if (params.data) {
      return childField
        .filter(f => params.data[f])
        ?.map(f => params.data[f])
        .join(sep);
    }
  }

  static getNumberTotalRows(gridApi: GridApi): number {
    let totalRowCount = 0;
    gridApi.forEachNode(() => {
      totalRowCount++;
    });
    return totalRowCount;
  }

  static getGridHeight(rowData: any[], initialLength: number, margeAddition: number, maxNumberOfRow: number): number {
    const arrayLength = rowData.length;
    if (arrayLength >= 1 && arrayLength <= maxNumberOfRow) {
      return initialLength + (arrayLength - 1) * margeAddition;
    } else if (arrayLength == 0) {
      return initialLength;
    }
    return initialLength + maxNumberOfRow * margeAddition;
  }

  static getDetailRow(detailsFields: any[], node: any, headers: any[], nbrPerLine = 3): any {
    return [
      {
        table: {
          body: [
            ArrayUtil.convertArrayDimention(
              detailsFields.map((detailsField: any) => detailsField.header + ': ' + FormatUtil.formatValue(detailsField.field, node)),
              nbrPerLine
            ),
          ],
          widths: '*',
        },
        alignment: 'left',
        colSpan: headers.length,
        layout: 'noBorders',
        unbreakable: true,
      },
    ].concat(Array(headers.length - 1).fill(''));
  }

  /**
   * Génère la ligne totale en cas de lignes groupées
   *
   * @param event
   * @param fieldToDisplayTitle
   * @param fieldsToCount
   * @param title
   */
  static generatePinnedBottomRowForGroupedRows(
    event: RowDataUpdatedEvent | FilterChangedEvent,
    fieldToDisplayTitle: string,
    fieldsToCount: string[],
    title: string
  ): void {
    const result = AgGridUtil.initResultWithColumnTitle(event, fieldToDisplayTitle, title);
    event.api.forEachNodeAfterFilter((rowNode: RowNode) => {
      if (rowNode.allChildrenCount) {
        rowNode.childrenAfterFilter.forEach((childRowNode: RowNode) => {
          fieldsToCount.forEach((field: string) => {
            if (childRowNode.data[field]) {
              result[field] += Number(childRowNode.data[field]);
            }
          });
        });
      }
    });

    event.api.getRenderedNodes().length && event.api.setGridOption('pinnedBottomRowData', [result]);
  }

  /**
   * Calcule la somme des valeurs des champs spécifiés pour les lignes non groupées
   *
   * @param event
   * @param fieldToDisplayTitle
   * @param fieldsToCount
   * @param title
   */
  static generatePinnedBottomRowForNotGroupedRows(
    event: RowDataUpdatedEvent,
    fieldToDisplayTitle: string,
    fieldsToCount: string[],
    title: string
  ): void {
    const result = AgGridUtil.initResultWithColumnTitle(event, fieldToDisplayTitle, title);
    event.api.forEachNodeAfterFilter((rowNode: RowNode) =>
      fieldsToCount.forEach((field: string) => {
        if (Number(rowNode.data[field])) {
          result[field] += Number(rowNode.data[field]);
        }
      })
    );
    event.api.getRenderedNodes().length && event.api.setGridOption('pinnedBottomRowData', [result]);
  }

  private static initResultWithColumnTitle(event: RowDataUpdatedEvent | FilterChangedEvent, fieldToDisplayTitle: string, title: string) {
    const result = {};
    event.api.getAllGridColumns().forEach(item => {
      result[item['colId']] = null;
      if (item['colId'] === fieldToDisplayTitle) {
        result[item['colId']] = title;
      }
    });
    return result;
  }

  /**
   * Calcule la somme des valeurs du champ spécifié pour les lignes non groupées
   * @param event
   * @param fieldToCount
   */
  static calculateColumnSum(event: RowDataUpdatedEvent | FilterChangedEvent, fieldToCount: string): number {
    let result = 0;
    event.api.forEachNodeAfterFilter((rowNode: RowNode) => {
      if (Number(rowNode.data[fieldToCount])) {
        result += Number(rowNode.data[fieldToCount]);
      }
    });

    return result;
  }

  static updateTotalRowCount(event): number {
    let result = 0;
    event.api.forEachNodeAfterFilterAndSort(node => {
      if (!node.group) {
        result += 1;
      }
    });

    return result;
  }

  static resetFilterAndColumnSort(gridApi: GridApi): void {
    gridApi.setFilterModel(null);
    gridApi.onFilterChanged();
    gridApi.refreshHeader();
    gridApi.resetColumnState();
  }
}
