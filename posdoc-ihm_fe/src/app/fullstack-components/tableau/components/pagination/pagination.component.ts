import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, RowNode } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ExtendedColDef } from '../../models/tableau.models';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  standalone: false,
})
export class PaginationComponent implements OnInit, OnDestroy {
  @Input() agGrid: AgGridAngular;

  @Input() defaultNbreLignes = '20';

  subscriptions: Subscription[] = [];
  timeout: ReturnType<typeof setTimeout>;

  totalLignes = 0;
  totalPages: number;
  form: FormGroup;

  uniqueAgKey: string;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Formulaire pour sélectionner le nombre de lignes
    this.form = this.fb.group({
      selectNbreLignes: [this.defaultNbreLignes, null],
      currentPage: ['1', null],
    });

    if (this.agGrid) {
      this.uniqueAgKey = this.agGrid['_nativeElement'].id;

      // Initialise le nombre de lignes
      this.agGrid.paginationPageSize = parseInt(this.form.value.selectNbreLignes);

      // Met à jour le nombre de lignes à chaque changements
      this.subscriptions.push(
        this.form.get('selectNbreLignes').valueChanges.subscribe(() => {
          if (this.agGrid.api && this.form.enabled) {
            const newPageSize = parseInt(this.form.getRawValue().selectNbreLignes);
            // Met à jour la taille de la page de pagination
            this.agGrid.api.updateGridOptions({
              paginationPageSize: newPageSize,
            });
          }
        })
      );

      // Récupère le nombre de lignes totales
      this.subscriptions.push(
        this.agGrid.gridReady.subscribe(() => {
          this.timeout = setTimeout(() => {
            // fix erreur console
            if (this.agGrid && this.agGrid.rowData) {
              this.totalLignes = this.getTotalRows();
            }
          }, 750);
        })
      );

      this.subscriptions.push(
        this.agGrid.paginationChanged.subscribe(() => {
          this.onPaginationChanged();
        })
      );
    }

    // Met à jour la page quand l'utilisateur saisie une valeur dans l'input
    this.subscriptions.push(
      this.form
        .get('currentPage')
        .valueChanges.pipe(debounceTime(300))
        .subscribe((event: number) => {
          const selectedPage = event - 1;
          if (this.agGrid && selectedPage >= 0 && selectedPage < this.totalPages && this.form.enabled) {
            this.agGrid.api.paginationGoToPage(selectedPage);
          }
        })
    );
  }

  /**
   * Navigue à la page précédente
   */
  previous() {
    this.agGrid.api.paginationGoToPreviousPage();
  }

  /**
   * Navigue à la page suivante
   */
  next() {
    this.agGrid.api.paginationGoToNextPage();
  }

  /**
   * Navigue à la première page
   */
  first(): void {
    this.agGrid.api.paginationGoToFirstPage();
  }

  /**
   * Navigue à la dernière page
   */
  last(): void {
    this.agGrid.api.paginationGoToLastPage();
  }

  /**
   * Met à jour la page actuelle, le nombre de pages et le nombre de lignes
   */
  onPaginationChanged() {
    if (this.agGrid.api) {
      this.form.get('currentPage').setValue(this.agGrid.api.paginationGetCurrentPage() + 1, { emitEvent: false });
      this.totalPages = this.agGrid.api.paginationGetTotalPages();
      this.totalLignes = this.getTotalRows();
    }
  }

  /**
   * Retourne le nombre total de rows
   * Dans le cas d'un tableau dépliable ou imbriqué, ne retourne que le nombre de rows parentes
   */
  getTotalRows(): number {
    const columnDefs = this.agGrid.api.getColumnDefs();
    if (!columnDefs || columnDefs.length === 0) {
      return this.agGrid.api.getDisplayedRowCount();
    }

    const isTableauDepliable = (columnDefs[0] as ColDef)?.rowGroup;
    const isTableauImbrique = (columnDefs[0] as ExtendedColDef)?.enableCollapsing;

    // Tableau dépliable
    if (isTableauDepliable) {
      let count = 0;

      this.agGrid.api.forEachNode((rowNode: RowNode) => {
        if (rowNode.hasChildren()) {
          count++;
        }
      });

      return count;
    } else if (isTableauImbrique) {
      // Tableau imbriqué
      let count = 0;

      this.agGrid.api.forEachNodeAfterFilter(e => count++);

      return count;
    } else {
      // Les autres tableaux
      return this.agGrid.api.getDisplayedRowCount();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    clearTimeout(this.timeout);
  }
}
