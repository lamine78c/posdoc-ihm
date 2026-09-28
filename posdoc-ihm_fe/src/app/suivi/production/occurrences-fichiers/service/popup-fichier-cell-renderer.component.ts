import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { FichierDetailsComponent } from '../../modal/fichier-details/fichier-details.component';
import { ParamsPopupFichiers } from '../../modal/fichier-details/models/params-fichiers-interface';

@Component({
  selector: 'popup-fichier-cell-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popup-fichier-cell-renderer.component.html',
})
export class PopupFichierCellRendererComponent implements ICellRendererAngularComp {
  isParentNode: boolean;
  value: number | string;
  params: ParamsPopupFichiers;
  modalService = inject(NgbModal);

  constructor() {
    // do nothing
  }

  agInit(params: ICellRendererParams): void {
    this.isParentNode = params.node.group;
    this.refresh(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    if (!this.isParentNode) {
      this.params = {
        codenv: params.data.codenv,
        codorg: params.data.codorg,
        codapp: params.data.codapp,
        codfic: params.data.codfic,
        codcom: params.data.codcom,
        numcom: params.data.numcom,
        percod: params.data.percod,
      };
    }
    return true;
  }

  openPopupDetail() {
    const modalRef = this.modalService.open(FichierDetailsComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.params = this.params;
  }
}
