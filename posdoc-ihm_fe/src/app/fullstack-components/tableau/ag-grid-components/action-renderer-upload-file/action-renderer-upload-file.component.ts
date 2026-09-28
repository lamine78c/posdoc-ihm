import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Component, EventEmitter, Output } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { FileUploadService } from '@app/produit/notice/service/file-upload.service';
import { NgIf } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { take } from 'rxjs/operators';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';

@Component({
  selector: 'app-upload-file-renderer',
  templateUrl: './action-renderer-upload-file.component.html',
  imports: [NgIf],
  styleUrls: ['./action-renderer-upload-file.component.scss'],
})
export class ActionRendererUploadFileComponent implements ICellRendererAngularComp {
  params: any;
  @Output() uploadCompleted = new EventEmitter<void>();
  deleteModal!: any;
  idsLabel!: string[];
  messages!: string[];

  constructor(
    private fileUploadService: FileUploadService,
    private modalService: NgbModal
  ) {}

  agInit(params: any): void {
    this.params = params;
    this.deleteModal = params.deleteModal;
    this.idsLabel = params.idsLabel;
    this.messages = params.messages;
  }

  onUploadClick(): void {
    this.fileUploadService.uploadFile(this.params.node.data.codnot).subscribe({
      next: () => {
        this.uploadCompleted.emit();
      },
      error: error => {
        console.error("Erreur lors de l'upload du fichier", error);
      },
    });
  }

  onDeleteClick(): void {
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.rowDataArray = [this.params.node.data.codnot];
    modalRef.componentInstance.messages = ["Suppression d'un fichier", 'Vous êtes sur le point de supprimer le fichier pdf de la notice '];

    modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
      if (numButton === NUM_FIRST_BTN_MODAL) {
        this.fileUploadService.deleteNoticePdf(this.params.node.data.codnot).subscribe({
          next: () => {
            this.uploadCompleted.emit();
          },
          error: error => {
            console.error('Erreur lors de la suppression du fichier', error);
          },
        });
      }
    });
  }

  refresh(_params: ICellRendererParams<any>): boolean {
    return false;
  }
}
