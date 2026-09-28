import { Injectable } from '@angular/core';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PopupConfirmationService {
  constructor(private modalService: NgbModal) {}

  askConfirmation(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const modalRef = this.modalService.open(PopupConfirmationComponent);
      modalRef.componentInstance.messages = ['Confirmation', 'Attention'];
      modalRef.componentInstance.rowDataArray = ['Les modifications effectuées seront perdues.'];
      modalRef.componentInstance.firstButton = { label: 'Confirmer', icone: 'icon-b_valid' };
      modalRef.componentInstance.secondButton = { label: 'Abandonner', icone: 'icon-b_cancel' };

      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        observer.next(numButton === NUM_FIRST_BTN_MODAL);
        observer.complete();
      });
    });
  }

  popupTooManyResultsConfirmation(message: string | number): void {
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.rowDataArray = ['Veuillez affiner vos filtres pour réduire le volume de données.'];
    modalRef.componentInstance.messages = ['Trop de résultats', message];
    modalRef.componentInstance.firstButton = null;
    modalRef.componentInstance.secondButton = { label: 'Fermer', icone: 'icon-b_cancel' };
  }
}
