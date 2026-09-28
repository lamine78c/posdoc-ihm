import { Injectable } from '@angular/core';
import { DateEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/date-editor/date-editor.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauPageAccueilService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private getColumDefs(allRegions: string[]): (ColDef | ColGroupDef)[] {
    return [
      this.tableauUtilService.getColClearFilter(),
      this.getRegionsColDef(allRegions),
      this.getTitreColDef(),
      this.getDateActivationColDef(),
      this.getDateExpirationColDef(),
      this.getMessageColDef(),
    ];
  }

  private getRegionsColDef(allRegions: string[]): ColDef {
    return {
      headerName: 'Région',
      field: 'regions',
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      sortable: true,
      // Affiche la valeur dans la colonne en plus de celle du groupe
      showRowGroup: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {},
      cellRenderer: params => {
        const nodeRegions = params.value.sort((e1, e2) => (e1 > e2 ? 1 : -1));
        if (JSON.stringify(allRegions) === JSON.stringify(nodeRegions)) {
          return `
          <div class="cell-region">
            <div class="app-row-even">
              <b>Tous</b>
            </div>
          </div>`;
        }
        const innerCell = nodeRegions
          .map((e, i) => {
            const f = i % 2 == 0 ? 'even' : 'odd';
            return '<div class="app-row-' + f + '">' + e + '</div>';
          })
          .join('');
        return '<div class="cell-region">' + innerCell + '</div>';
      },
      cellStyle: { display: 'block', 'padding-left': '0' },
    };
  }

  private getTitreColDef(): ColDef {
    return {
      headerName: 'Titre',
      field: 'titre',
      width: 250,
      minWidth: 250,
      maxWidth: 250,
      sortable: true,
      // Affiche la valeur dans la colonne en plus de celle du groupe
      showRowGroup: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getDateActivationColDef(): ColDef {
    return {
      headerName: 'Date Activation',
      field: 'dateActivation',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: DateEditorComponent,
      cellRendererParams: {
        formKey: 'dateActivation',
        // Valeur de l'attribut aria-label de les icônes, optionnel, identique aux valeurs par défauts ici pour exemple
        ariaLabelErrorIcon: 'Icône champ de saisie en erreur',
        ariaLabelWarningIcon: 'Icône champ de saisie en avertissement',
      },
      filter: 'agDateColumnFilter',
      floatingFilterComponent: 'agDateInput',
      floatingFilter: true,
    };
  }

  private getDateExpirationColDef(): ColDef {
    return {
      headerName: 'Date Expiration',
      field: 'dateExpiration',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: DateEditorComponent,
      cellRendererParams: {
        formKey: 'dateExpiration',
        // Valeur de l'attribut aria-label de les icônes, optionnel, identique aux valeurs par défauts ici pour exemple
        ariaLabelErrorIcon: 'Icône champ de saisie en erreur',
        ariaLabelWarningIcon: 'Icône champ de saisie en avertissement',
      },
      filter: 'agDateColumnFilter',
      floatingFilterComponent: 'agDateInput',
      floatingFilter: true,
    };
  }

  private getMessageColDef(): ColDef {
    return {
      headerName: 'Message',
      field: 'message',
      sortable: true,
      filter: 'agTextColumnFilter',
      wrapText: true,
      floatingFilter: true,
      flex: 1,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: params => {
        // put the value in bold
        return '<div class="overflow-auto" style="height: 114px;">' + params.value + '</div>';
      },
      cellStyle: { display: 'block', padding: '0.5rem' },
      lockPosition: 'right',
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(allRegions: string[]): (ColDef | ColGroupDef)[] {
    return this.getColumDefs(allRegions);
  }
}
