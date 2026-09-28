import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup-erreur',
  templateUrl: './popup-erreur.component.html',
  standalone: false,
})
export class PopupErreurComponent {
  @Input() messages: any[] = [];

  modalRef: NgbModalRef;

  constructor(public activeModal: NgbActiveModal) {}
}
