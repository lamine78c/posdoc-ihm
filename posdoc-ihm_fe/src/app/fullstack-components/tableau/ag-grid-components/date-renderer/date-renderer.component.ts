import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TableauService } from '../../services/tableau.service';

@Component({
  selector: 'app-date-renderer',
  templateUrl: './date-renderer.component.html',
  styleUrls: ['./date-renderer.component.scss'],
  standalone: false,
})
export class DateRendererComponent implements ICellRendererAngularComp, OnDestroy {
  @ViewChild('dateElement') dateElement: ElementRef;

  date: Date;
  isTotalRow: boolean;
  enableTooltip = false;
  params: ICellRendererParams;
  checkTooltipDisplayFn;

  constructor(private tableauService: TableauService) {}

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.date = params.value;
    this.isTotalRow = !!params.node.rowPinned;

    // Écoute le resize de la grille ou d'une colonne
    this.checkTooltipDisplayFn = this.tableauService.debounce(this.checkTooltipDisplay.bind(this), 300);
    this.params.api.addEventListener('columnResized', this.checkTooltipDisplayFn);
  }

  /**
   *  Affiche un tooltip si la valeur est trop longue pour la casse
   */
  checkTooltipDisplay(): void {
    this.enableTooltip = this.tableauService.shouldDisplayTooltips(this.dateElement);
  }

  refresh(): boolean {
    return false;
  }

  ngOnDestroy(): void {
    this.params.api.removeEventListener('columnResized', this.checkTooltipDisplayFn);
  }
}
