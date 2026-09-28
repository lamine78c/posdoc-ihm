import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GestionOccurrenceApplicationComponent } from '../../gestion-occurrence-application.component';

@Component({
  selector: 'app-gestion-occurrence-application-modal',
  templateUrl: './gestion-occurrence-application-modal.component.html',
  styleUrls: ['./gestion-occurrence-application-modal.component.scss'],
  standalone: false,
})
export class GestionOccurrenceApplicationModalComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  @ViewChild('gestionOccurrenceApplicationComponentContainer', { read: ViewContainerRef, static: true })
  gestionOccurrenceApplicationComponentContainer: ViewContainerRef;
  modalTitle: string;
  @Output() passEntry = new EventEmitter<any>();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.modalTitle =
      "Occurrence d'application : " + this.paramData.codEnv + '-' + this.paramData.codOrg + '-' + this.paramData.codApp + '-' + this.paramData.perCod;
    this.loadComponent();
  }

  loadComponent() {
    const componentRef = this.gestionOccurrenceApplicationComponentContainer.createComponent(GestionOccurrenceApplicationComponent);
    (componentRef.instance as any).paramData = this.paramData;
    // écouteur fils
    componentRef.instance.passEntry.subscribe(data => {
      // renvoie data au parent
      this.passEntry.emit(data);
    });
  }

  closePopup() {
    this.activeModal.close();
  }
}
