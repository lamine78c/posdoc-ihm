import { Component, ElementRef, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DEFAULT_SEPARATOR } from '@app/shared/utils/Constants';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class CheckboxComponent implements ICellRendererAngularComp {
  @ViewChild('input') input: ElementRef;

  // paramètres ag grid
  params: any;
  checked = false;
  isHidden = false;
  hasProfil = false;

  constructor() {
    // nothing
  }

  agInit(params: ICellRendererParams<any, any>): void {
    this.params = params;
    const key = this.getKey();
    this.checked = params.context.componentParent.checkboxStates[key] || false;
    this.checkIfHidden();
    const codorg = this.params.data.codorg ?? '';
    const resource = this.params.resource;
    this.hasProfil = !!resource?.hasProfil || (resource?.codorg !== this.params.genericOrg && resource?.codorg !== codorg);
  }

  onChange(event: any) {
    const key = this.getKey();
    this.params.context.componentParent.checkboxStates[key] = event.target.checked;
  }

  private getKey(): string {
    const rowId = this.params.node.id;
    const colId = this.params.colDef.field;
    return `${rowId}${DEFAULT_SEPARATOR}${colId}`;
  }

  private checkIfHidden(): void {
    if (this.params.exemplaires) {
      this.isHidden = !this.params.resource?.exemplaireExists;
    }
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    this.params = params;
    const key = this.getKey();
    this.checked = params.context.componentParent.checkboxStates[key] || false;
    return true;
  }
}
