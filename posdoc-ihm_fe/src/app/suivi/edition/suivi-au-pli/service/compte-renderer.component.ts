import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataService } from '@app/shared/utils/data.service';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { SearchPliByQueryResult, TransferCompteToSearch } from '../model/search-pli';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ' <a class="link-simple" (click)="compteClicked()">{{ text }}</a> ',
})
export class CompteRendererComponent implements ICellRendererAngularComp {
  value;
  text;
  isCompteCnav;

  constructor(private dataService: DataService) {}

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    this.text = this.transformToText(params);
    this.isCompteCnav = this.isCnav(params.data);
    return true;
  }

  compteClicked() {
    // envoyer la valeur vers la recherche
    this.dataService.setDataToTransfer(this.getDataToTransfer(this.value, this.isCompteCnav));
  }

  transformToText(params) {
    if (this.isCnav(params.data)) {
      return '000...' + params.value.replace(/^0+/, '');
    } else {
      return params.value;
    }
  }

  isCnav(data: SearchPliByQueryResult) {
    return data.codapp.includes('cnav') ? true : false;
  }

  getDataToTransfer(compte: string, isCompteCnav: boolean): TransferCompteToSearch {
    return {
      compte: compte,
      isCompteCnav: isCompteCnav,
    };
  }
}
