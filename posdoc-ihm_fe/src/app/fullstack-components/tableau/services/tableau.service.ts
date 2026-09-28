import { ElementRef, Injectable } from '@angular/core';
import { GridApi, RowNode } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauService {
  /**
   * Génère la ligne total
   */
  generatePinnedBottomRow(gridApi: GridApi, gridColumnApi: GridApi, labelId: string, valuesId: string[]) {
    const result = {};
    gridColumnApi.getAllGridColumns().forEach(item => {
      result[item['colId']] = null;
    });

    gridApi.forEachNodeAfterFilter((rowNode: RowNode) => {
      valuesId.forEach((valueId: string) => {
        if (rowNode.data[valueId]) {
          result[valueId] += Number(rowNode.data[valueId]);
        }
      });
      if (rowNode.data[labelId]) {
        result[labelId] = 'TOTAL';
      }
    });

    return result;
  }

  /**
   * Active un tooltip si le texte est plus grand que la zone dédiée
   */
  shouldDisplayTooltips(element: ElementRef): boolean {
    // Active un tooltip si le texte est plus grand que la zone dédiée
    const elementOffsetWidth: number = (element.nativeElement as HTMLElement).offsetWidth;
    const elementScrollWidth: number = (element.nativeElement as HTMLElement).scrollWidth;

    if (elementScrollWidth > elementOffsetWidth) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Force une fonction à attendre un certain temps avant de s'exécuter
   */
  debounce(fn: Function, d: number) {
    let timer;
    return () => {
      const context = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, d);
    };
  }
}
