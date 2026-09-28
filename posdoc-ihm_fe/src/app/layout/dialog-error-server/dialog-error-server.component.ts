import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dialog-error-server',
  templateUrl: './dialog-error-server.component.html',
  standalone: false,
})
export class DialogErrorServerComponent {
  @Input() modalRef: NgbModalRef | NgbActiveModal;

  closePopup() {
    this.modalRef.close();
  }
}
