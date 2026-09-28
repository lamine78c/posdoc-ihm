import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ExtendedICellRendererParams } from '../../models/tableau.models';

@Component({
  selector: 'app-action-renderer-reset',
  imports: [NgIf],
  templateUrl: './action-renderer-reset.component.html',
})
export class ActionRendererResetComponent implements ICellRendererAngularComp {
  isAuthorisedToReset = true;

  params: ExtendedICellRendererParams;

  agInit(params: ExtendedICellRendererParams): void {
    this.params = params;
    this.isAuthorisedToReset = params.data?.isAuthorisedToReset ?? false;
  }

  toResetRow() {
    this.isAuthorisedToReset = false;
    this.params.node.setDataValue('isAuthorisedToReset', false);
    (this.params as any).resetKeys.forEach(keys => {
      this.params.node.setDataValue(keys.to, this.params.node.data[keys.from]);
    });
    this.params.api.dispatchEvent({ type: 'rowDataUpdated' });
  }

  refresh(_params: ICellRendererParams<any>): boolean {
    return false;
  }
}
