import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { DetailsActionComponent } from '../details-action/details-action/details-action.component';
import { SearchHistoryByQueryResult } from '../model/search-history-by-query';

@Component({
  selector: 'popup-action-cell-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ' <a class="link-simple" (click)="openPopupDetail()">{{ value }}</a> ',
})
export class PopupCellRendererComponent implements ICellRendererAngularComp {
  value: number;
  rowData: SearchHistoryByQueryResult;
  modalService = inject(NgbModal);

  constructor() {
    // do nothing
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    this.rowData = params.data;
    return true;
  }

  openPopupDetail() {
    const modalRef = this.modalService.open(DetailsActionComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.rowData = this.rowData;
    modalRef.componentInstance.title = 'Consultation de la mise-à-jour IHM ' + this.value;
  }
}
