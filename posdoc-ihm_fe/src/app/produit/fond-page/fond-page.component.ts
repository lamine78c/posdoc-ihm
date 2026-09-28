import { Component, inject } from '@angular/core';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { ActivatedRoute } from '@angular/router';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_IMPRIMES = ZERO,
  ONGLET_NUMBER_REFERENCE = ONE,
}

@Component({
  selector: 'app-fond-page',
  templateUrl: './fond-page.component.html',
  styleUrls: ['./fond-page.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class FondPageComponent {
  active;
  labelActif;

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  tabs: OngletPremierNiveau[] = [
    { label: 'Imprimés', perm: AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.ID },
    { label: 'Références', perm: AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES.ID },
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

  setOngletActive(fragment) {
    this.active = this.ongletService.getIndexOnglet(this.onglets, fragment);
    this.labelActif = this.ongletService.getIndexOnglet(this.tabs, fragment);
  }
}
