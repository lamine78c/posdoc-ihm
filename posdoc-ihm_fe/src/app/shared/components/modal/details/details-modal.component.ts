import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { OngletModal } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ParamFacturation } from '@app/models/supervision/production/details/param-facturation';
import { ParamMassification } from '@app/models/supervision/production/details/param-massification';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { PARAM_CODE_MASAPP } from '@app/shared/utils/Constants_params';
import {
  CommandesFichiersComponent,
  DetailsFacturationComponent,
  DetailsMassificationComponent,
  FichiersProduitsComponent,
  GeneralitesComponent,
  IncidentsComponent,
  NoticesComponent,
} from './onglets';
import { NgbActiveModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
  standalone: false,
})
export class DetailsModalComponent implements OnInit, OnDestroy {
  @Input() paramData: OngletsParamDataModel;

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer: ViewContainerRef;

  unsavedChange = false;
  active = 0;
  nextId = 0;
  labelActif = 0;
  tabs: OngletModal[] = [];
  onglets: OngletModal[] = [];
  paramMassification: ParamMassification;
  paramFacturation: ParamFacturation;
  modalTitle: string;

  constructor(
    public activeModal: NgbActiveModal,
    private permissionsService: PermissionService,
    private apiAdelaideParametreService: ApiAdelaideParametreService,
    private apiAdelaideOccurenceApplicationService: ApiAdelaideOccurenceApplicationService
  ) {}

  ngOnInit(): void {
    this.getTabs();
    this.onglets = this.tabs.filter(e => this.permissionsService.hasPermission(e.perm));
    if (this.onglets.length > 0) {
      // param supplémentaire
      this.paramMassification = new ParamMassification(); // param supplémentaire de l'onglet Massification
      this.paramFacturation = new ParamFacturation(); // param supplémentaire de l'onglet Facturation
      this.apiAdelaideOccurenceApplicationService
        .getAllTarifs()
        .pipe(
          concatMap((data: any) => {
            this.paramFacturation.allTarpos = data.data.allTarpos.map(e => e.type);
            return this.apiAdelaideParametreService.getParamsForMasappMasgamMasuti();
          })
        )
        .subscribe((e: any) => {
          e.data.getParamsForMasappMasgamMasuti.forEach(r => {
            if (r.code === PARAM_CODE_MASAPP) {
              this.paramMassification.masApp = r.value;
            } else if (r.code === 'MASGAM') {
              this.paramMassification.masGam = r.value;
            } else if (r.code === 'MASUTI') {
              this.paramMassification.masUti = r.value;
            }
          });
          this.paramMassification.bMasApp = this.paramMassification.masApp === this.paramData.codApp ? true : false;
          this.paramFacturation.bMasApp = this.paramMassification.bMasApp;
          // load l'onglet zero
          const ZERO = 0;
          this.loadComponent(this.onglets[ZERO].label);
        });
    }
    this.modalTitle = `Informations détaillées sur l'occurrence d'application ${this.paramData.codEnv}-${this.paramData.codOrg}-${this.paramData.codApp}-${this.paramData.perCod}`;
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
      (componentRef.instance as any).paramData = this.paramData;
      (componentRef.instance as any).paramMassification = this.paramMassification;
      (componentRef.instance as any).paramFacturation = this.paramFacturation;
    }
  }

  getTabs(): void {
    this.tabs = [
      {
        label: 'Généralités',
        component: GeneralitesComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Commandes et Fichiers',
        component: CommandesFichiersComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Fichiers et Produits',
        component: FichiersProduitsComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Notices',
        component: NoticesComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Facturation',
        component: DetailsFacturationComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Massification',
        component: DetailsMassificationComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Incidents',
        component: IncidentsComponent,
        perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
    ];
  }
  
  ngOnDestroy(): void {
    this.dynamicComponentContainer.clear();
  }

}
