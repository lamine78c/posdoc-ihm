import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dialog-user-permission',
  templateUrl: './dialog-user-permission.component.html',
  standalone: false,
})
export class DialogUserPermissionComponent {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() login: string;

  closePopup() {
    this.modalRef.close();
  }
}
