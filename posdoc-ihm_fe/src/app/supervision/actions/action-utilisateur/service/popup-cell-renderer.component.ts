import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { DetailsActionUtilisateurComponent } from '../details-action-utilisateur/details-action-utilisateur.component';
import { SearchActionUtilisateurByQueryResult } from '../model/search-action-utilisateur-by-query';

@Component({
  selector: 'popup-action-utilisateur-cell-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ' <a class="link-simple" (click)="openPopupDetail(value)">{{ value }}</a> ',
})
export class PopupCellRendererComponent implements ICellRendererAngularComp {
  value: number;
  rowData: SearchActionUtilisateurByQueryResult;
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

  openPopupDetail(codulo: number) {
    const modalRef = this.modalService.open(DetailsActionUtilisateurComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.rowData = this.rowData;
    modalRef.componentInstance.codulo = codulo;
    modalRef.componentInstance.title = "Consultation de l'action " + this.value;
  }
}
