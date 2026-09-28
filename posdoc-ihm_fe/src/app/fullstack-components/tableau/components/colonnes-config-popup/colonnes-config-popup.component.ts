import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef } from 'ag-grid-community';
import { DefaultColConfiguration } from '../../models/tableau.models';

@Component({
  selector: 'app-colonnes-config-popup',
  templateUrl: './colonnes-config-popup.component.html',
  standalone: false,
})
export class ColonnesConfigPopupComponent implements OnInit {
  @Input() columnsHidden: ColDef[] = [];
  @Input() columnsDisplayed: ColDef[] = [];
  @Input() defaultColConfiguration: DefaultColConfiguration;

  displayUnmovableMessage: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    // Vérifie si il y a des colonnes que ne peut pas masquer afin d'afficher le message
    const concatArray = this.columnsHidden.concat(this.columnsDisplayed);
    this.displayUnmovableMessage = !!concatArray.find((elem: ColDef | any) => elem.lockList);
  }

  /**
   * Réinitialise les colonnes dans leur état d'origine
   */
  reset(): void {
    this.columnsHidden = [...this.defaultColConfiguration.columnsHidden];
    this.columnsDisplayed = [...this.defaultColConfiguration.columnsDisplayed];
  }
}
