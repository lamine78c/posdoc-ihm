import { Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PopupComponent } from '@app/fullstack-components/popup/components/popup/popup.component';
import { FaqNotification } from '@app/models/notification';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';

@Component({
  selector: 'app-notifications-list',
  standalone: false,
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent implements OnInit {
  @Input() notifications: FaqNotification[] = [];
  @ViewChild('notificationsTemplate') notificationsTemplate: TemplateRef<any>;

  pathLabels: Map<string, string> = new Map();

  private readonly modalService = inject(NgbModal);
  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);

  ngOnInit(): void {
    this.loadPathLabels();
  }

  private loadPathLabels(): void {
    this.apiAdelaideContenuService.getAllPathComplet().subscribe(result => {
      this.pathLabels.clear();
      result.data.getAllPathComplet.forEach((item: any) => {
        this.pathLabels.set(item.path, item.libelle);
      });
    });
  }

  getPathLabel(path: string): string {
    return this.pathLabels.get(path) || path;
  }

  openModal(): void {
    // Recharger les pathLabels pour s'assurer qu'ils sont à jour
    this.apiAdelaideContenuService.getAllPathComplet().subscribe(result => {
      this.pathLabels.clear();
      result.data.getAllPathComplet.forEach((item: any) => {
        this.pathLabels.set(item.path, item.libelle);
      });

      // Ouvrir la modal après le chargement des pathLabels
      const modalRef: NgbModalRef = this.modalService.open(PopupComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'notifications-modal'
      });

      this.configureModal(modalRef);
    });
  }

  private configureModal(modalRef: NgbModalRef): void {
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.title = 'Notifications';
    modalRef.componentInstance.firstButton = { label: 'Fermer', icone: 'icon-b_cancel' };
    modalRef.componentInstance.secondButton = null;
    modalRef.componentInstance.isFormValid = true;
    modalRef.componentInstance.isShowcontentTemplate = true;
    modalRef.componentInstance.contentTemplate = this.notificationsTemplate;
  }
}
