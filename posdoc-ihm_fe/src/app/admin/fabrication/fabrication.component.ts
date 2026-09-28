import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

import { FOUR, ONE, THREE, TWO, ZERO } from '@app/shared/utils/Constants';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_SERVEUR = ZERO,
  ONGLET_NUMBER_GAMME = ONE,
  ONGLET_NUMBER_VERROU = TWO,
  ONGLET_NUMBER_PARAM_DIST = THREE,
  ONGLET_NUMBER_RESSOURCE = FOUR,
}

@Component({
  selector: 'app-fabrication',
  templateUrl: './fabrication.component.html',
  styleUrls: ['./fabrication.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class FabricationComponent {
  active;
  labelActif;

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  tabs: OngletPremierNiveau[] = [
    { label: 'Serveurs', perm: AUTH.ADMINISTRATION.FABRICATION.SERVEURS.ID },
    { label: 'Gammes', perm: AUTH.ADMINISTRATION.FABRICATION.GAMMES.ID },
    { label: 'Verrous', perm: AUTH.ADMINISTRATION.FABRICATION.VERROUS.ID },
    { label: 'Paramètres Distribution', perm: AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS.ID },
    { label: 'Ressources', perm: AUTH.ADMINISTRATION.FABRICATION.RESSOURCES.ID },
  ];

  onglets: OngletPremierNiveau[] = [];

  private readonly permissionsService = inject(PermissionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ongletService = inject(OngletService);
  subscriptions: Subscription[] = [];

  constructor() {
    this.onglets = this.tabs.filter(e => this.permissionsService.hasPermission(e.perm));
    if (this.onglets.length > ZERO) {
      this.subscriptions.push(
        this.activatedRoute.fragment.subscribe(fragment => {
          if (fragment) {
            this.setOngletActive(fragment);
          } else {
            this.ongletService.navigateToFirstOnglet(this.onglets);
          }
        })
      );
    }
  }

  activeChange(event: NgbNavChangeEvent) {
    event.preventDefault();
  }

  setOngletActive(fragment) {
    this.active = this.ongletService.getIndexOnglet(this.onglets, fragment);
    this.labelActif = this.ongletService.getIndexOnglet(this.tabs, fragment);
  }
}
