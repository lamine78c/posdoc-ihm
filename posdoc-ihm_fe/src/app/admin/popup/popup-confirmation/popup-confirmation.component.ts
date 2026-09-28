import { Component, Input, OnInit } from '@angular/core';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup-confirmation',
  templateUrl: './popup-confirmation.component.html',
  standalone: false,
})
export class PopupConfirmationComponent implements OnInit {
  @Input() rowDataArray: any[] = [];

  @Input() messages: any[] = [];

  @Input() firstButton: BoutonPopup = { label: 'Confirmer suppression', icone: 'icon-b_valid' };

  @Input() secondButton: BoutonPopup = { label: 'Abandonner suppression', icone: 'icon-b_cancel' };

  title: string;

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit(): void {
    this.title = this.messages[0];
    if (this.rowDataArray.length > 1 && this.messages[3]) {
      this.title = this.messages[3];
    }
  }
}
