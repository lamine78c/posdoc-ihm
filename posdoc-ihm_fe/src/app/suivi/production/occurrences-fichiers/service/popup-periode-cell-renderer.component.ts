import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { DetailsModalComponent } from '@app/shared/components/modal/details/details-modal.component';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'popup-periode-cell-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ' <a class="link-simple" (click)="openPopupDetail()">{{ value }}</a> ',
})
export class PopupPeriodeCellRendererComponent implements ICellRendererAngularComp {
  value: number;
  paramData: OngletsParamDataModel;
  modalService = inject(NgbModal);

  constructor() {
    // do nothing
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    this.paramData = {
      codEnv: params.data.codenv,
      codOrg: params.data.codorg,
      codApp: params.data.codapp,
      perCod: params.data.percod,
    };
    return true;
  }

  openPopupDetail() {
    const modalRef = this.modalService.open(DetailsModalComponent);
    modalRef.componentInstance.paramData = this.paramData;
  }
}
