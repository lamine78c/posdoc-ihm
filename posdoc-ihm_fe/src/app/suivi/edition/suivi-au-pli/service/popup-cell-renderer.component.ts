import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { DetailSuiviAuPliComponent } from '../detail/detail-suivi-au-pli/detail-suivi-au-pli.component';

@Component({
  selector: 'popup-suivi-au-pli-cell-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ' <a class="link-simple" (click)="openPopupDetail(value)">{{ value }}</a> ',
})
export class PopupCellRendererComponent implements ICellRendererAngularComp {
  value;
  codGam;

  constructor(private modalService: NgbModal) {}

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    this.codGam = params.data.codgam;
    return true;
  }

  openPopupDetail(numpli) {
    const modalRef = this.modalService.open(DetailSuiviAuPliComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.numpli = numpli;
    modalRef.componentInstance.title = 'Détail du ' + numpli;
  }
}
