import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'custom-tooltip',
  templateUrl: './custom-tooltip.component.html',
  standalone: true,
  styleUrls: ['./custom-tooltip.component.scss'],
})
export class CustomTooltipComponent implements ITooltipAngularComp {
  tooltipText: string = '';

  agInit(params: any): void {
    this.tooltipText = params.value;
  }
}
