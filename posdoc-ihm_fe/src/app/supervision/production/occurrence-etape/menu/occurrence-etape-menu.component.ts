import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { MenuService } from '@app/supervision/production/occurrence-etape/menu/service/menu.service';
import { MenuData, MenuOption, MenuStyle } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DetailsModalOccurrenceEtapeComponent } from '../modal/details/details-modal-occurrence-etape.component';
import { ModalConsulteScriptComponent } from '../modal/modal-consulte-script/modal-consulte-script/modal-consulte-script.component';
import { ModalValidationEtapeComponent } from '../modal/modal-validation-etape/modal-validation-etape.component';
import { ModalInvalidationEtapeComponent } from '../modal/modal-invalidation-etape/modal-invalidation-etape.component';

@Component({
  selector: 'app-occurrence-etape-menu',
  templateUrl: './occurrence-etape-menu.component.html',
  styleUrls: ['./occurrence-etape-menu.component.scss'],
  standalone: false,
})
export class OccurrenceEtapeMenuComponent implements OnChanges {
  @Input() menuData: MenuData;
  @Output() applySearchEvent = new EventEmitter<any>();
  @HostListener('document:click', ['$event'])
  onDocumentClick(): void {
    this.contextMenuStyle.display = 'none';
  }

  contextMenuStyle: MenuStyle;
  contextMenuOptions: MenuOption[] = [];

  constructor(
    private menuService: MenuService,
    private modalService: NgbModal
  ) {
    this.closeContextMenu();
  }

  ngOnChanges(): void {
    this.menuData && this.showContextMenu(this.menuData);
  }

  showContextMenu(data: MenuData): void {
    const hasScript = !(data.script == null || data.script == '');
    this.menuService.getMenuOptions(data.etat, data.statut, hasScript).then((contextMenuOptions: MenuOption[]) => {
      this.contextMenuOptions = contextMenuOptions;
      this.contextMenuStyle = {
        display: 'block',
        top: `${data.position.y}px`,
        left: `${data.position.x}px`,
      };
    });
  }

  closeContextMenu(): void {
    this.contextMenuStyle = { display: 'none', top: '0px', left: '0px' };
  }

  handleAction(action: string): void {
    if (typeof this[action] === 'function') {
      this[action].call(this);
    }
  }

  openPopup(modalComponent: any, menuData: MenuData): void {
    const modalRef = this.modalService.open(modalComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.menuData = menuData;
  }

  getMoreInformations(): void {
    this.openPopup(DetailsModalOccurrenceEtapeComponent, this.menuData);
    this.closeContextMenu();
  }

  consulteScript(): void {
    this.openPopup(ModalConsulteScriptComponent, this.menuData);
    this.closeContextMenu();
  }

  consulteTraceAndScript(): void {
    // renome script => log
    this.menuData.script = this.menuData.script + '.log';
    this.openPopup(ModalConsulteScriptComponent, this.menuData);
    this.closeContextMenu();
  }

  validateStep(): void {
    const modalRef = this.modalService.open(ModalValidationEtapeComponent);
    this.createModal(modalRef);
  }

  invalidateStep(): void {
    const modalRef = this.modalService.open(ModalInvalidationEtapeComponent);
    this.createModal(modalRef);
  }

  createModal(modalRef: NgbModalRef) {
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.menuData = this.menuData;

    // écouteur fils
    modalRef.componentInstance.passEntry.subscribe(data => {
      // si validation réussie,
      if (data.validation) {
        // ferme le popup
        modalRef.close();
        // relance la recherche
        this.applySearchEvent.emit();
      }
    });
    this.closeContextMenu();
  }

  manageExpeditionDates(): void {
    // todo: action manageExpeditionDates
    this.closeContextMenu();
  }
}
