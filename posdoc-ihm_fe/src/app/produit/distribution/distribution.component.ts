import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, TWO, ZERO } from '@app/shared/utils/Constants';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_DIST_EXEMPLAIRE = ZERO,
  ONGLET_NUMBER_DIST_PARAM_EDITION_LISTE = ONE,
  ONGLET_NUMBER_DIST_PARAM_EDITION_COLONNE = TWO,
}

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DistributionComponent {
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  active;
  labelActif;

  tabs: OngletPremierNiveau[] = [
    { label: 'Exemplaires', perm: AUTH.FICHIER_EDITION.DISTRIBUTION.EXEMPLAIRES.ID },
    { label: 'Paramètres Edition en liste', perm: AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.ID },
    { label: 'Paramètres Edition par ressource', perm: AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.ID },
  ];

  onglets: OngletPremierNiveau[] = [];

  private readonly permissionService = inject(PermissionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ongletService = inject(OngletService);
  subscriptions: Subscription[] = [];

  constructor() {
    this.onglets = this.tabs.filter(e => this.permissionService.hasPermission(e.perm));
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
