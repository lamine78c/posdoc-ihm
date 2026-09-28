import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { OngletModal } from '@app/fullstack-components/onglets/models/onglets.models';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DetailsEtapeOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/modal/details/onglets/etape/details-etape-occurrence-etape/details-etape-occurrence-etape.component';
import { DetailsFichierOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/modal/details/onglets/fichier/details-fichier-occurrence-etape/details-fichier-occurrence-etape.component';
import { DetailsIncidentsOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/modal/details/onglets/incidents/details-incidents-occurrence-etape/details-incidents-occurrence-etape.component';
import { DetailsMassificationOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/modal/details/onglets/massification/details-massification-occurrence-etape/details-massification-occurrence-etape.component';
import { MenuData } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { NgbActiveModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-details-modal-occurrence-etape',
  templateUrl: './details-modal-occurrence-etape.component.html',
  styleUrls: ['./details-modal-occurrence-etape.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DetailsModalOccurrenceEtapeComponent implements OnInit, OnDestroy {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer: ViewContainerRef;
  @Input() menuData: MenuData;
  subscriptions: Subscription[] = [];

  unsavedChange = false;
  active = 0;
  nextId = 0;
  labelActif = 0;
  tabs: OngletModal[] = [];
  onglets: OngletModal[] = [];
  modalTitle: string;
  allStaInf = [];

  constructor(
    public activeModal: NgbActiveModal,
    private permissionsService: PermissionService,
    private apiGestionOccurrenceEtapeService: ApiGestionOccurrenceEtapeService
  ) {}

  ngOnInit(): void {
    this.getTabs(this.menuData.etat, this.menuData.etpfus, this.menuData.idtfus);
    this.onglets = this.tabs.filter(e => this.permissionsService.hasPermission(e.perm));
    if (this.onglets.length > 0) {
      this.subscriptions.push(
        this.apiGestionOccurrenceEtapeService
          .getConfigData()
          .pipe(
            take(1),
            switchMap((data: any) => {
              return of((data as any).data.allStaInf);
            })
          )
          .subscribe(allStaInf => {
            // load l'onglet zero
            const ZERO = 0;
            this.allStaInf = allStaInf;
            this.loadComponent(this.onglets[ZERO].label);
          })
      );
    }
    this.modalTitle = "Informations détaillées d'une étape";
  }

  activeChange(event: NgbNavChangeEvent): void {
    if (!this.unsavedChange) {
      this.labelActif = this.tabs.findIndex(e => e.label === this.onglets[event.nextId].label);
      this.loadComponent(this.onglets[event.nextId].label);
    } else {
      this.nextId = event.nextId;
      event.preventDefault();
    }
  }

  loadComponent(label: string): void {
    const tab = this.tabs.find(t => t.label === label);
    if (tab) {
      this.dynamicComponentContainer.clear();
      const componentRef = this.dynamicComponentContainer.createComponent(tab.component);
      (componentRef.instance as any).paramData = this.menuData;
      (componentRef.instance as any).allStaInf = this.allStaInf; // onglet etape
    }
  }

  getTabs(typetp: string, etpfus: string, idtfus: number): void {
    let m_bGenfic = typetp === 'DEB' || typetp === 'FIN' || typetp === 'BIL' ? false : true;
    let m_bGenmas = etpfus === 'FAB' && idtfus === 0 ? true : false;

    if (!m_bGenfic) {
      this.tabs = [
        {
          label: 'Etape',
          component: DetailsEtapeOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
        {
          label: 'Incidents',
          component: DetailsIncidentsOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
      ];
    } else if (m_bGenmas) {
      this.tabs = [
        {
          label: 'Etape',
          component: DetailsEtapeOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
        {
          label: 'Fichier',
          component: DetailsFichierOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
        {
          label: 'Massification',
          component: DetailsMassificationOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
        {
          label: 'Incidents',
          component: DetailsIncidentsOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
      ];
    } else {
      this.tabs = [
        {
          label: 'Etape',
          component: DetailsEtapeOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
        {
          label: 'Fichier',
          component: DetailsFichierOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
        {
          label: 'Incidents',
          component: DetailsIncidentsOccurrenceEtapeComponent,
          perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID,
        },
      ];
    }
  }
  
  ngOnDestroy(): void {
    this.dynamicComponentContainer.clear();
  }
}
