import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup-confirmation',
  templateUrl: './popup-confirmation.component.html',
  standalone: false,
})
export class PopupConfirmationComponent {
  @Input() rowDataArray: any[] = [];

  @Input() messages: any[] = [];

  constructor(public activeModal: NgbActiveModal) {}
}
