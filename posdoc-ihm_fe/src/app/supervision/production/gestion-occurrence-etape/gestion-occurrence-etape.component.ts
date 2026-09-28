import { Component, Input, OnInit } from '@angular/core';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';

@Component({
  selector: 'app-gestion-occurrence-etape',
  templateUrl: './gestion-occurrence-etape.component.html',
  standalone: false,
})
export class GestionOccurrenceEtapeComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;

  constructor() {
    //nothing to do
  }

  ngOnInit(): void {
    //nothing to do
  }
}
