import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox-header',
  templateUrl: './checkbox-header.component.html',
  styleUrls: ['./checkbox-header.component.scss'],
  standalone: false,
})
export class CheckboxHeaderComponent implements IHeaderAngularComp {
  params: any;
  checked = false;

  agInit(params: IHeaderParams<any>): void {
    this.params = params;
  }

  onChange(event: any): void {
    this.checked = event.target.checked;
    const colId = this.params.column.getColId();
    this.params.context.componentParent.toggleColumnCheckboxes(colId, this.checked);
  }

  refresh(_params: IHeaderParams): boolean {
    return false;
  }
}
