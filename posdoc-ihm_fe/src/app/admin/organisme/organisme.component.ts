import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, TWO, ZERO } from '@app/shared/utils/Constants';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_ORGANISME = ZERO,
  ONGLET_NUMBER_REGION = ONE,
  ONGLET_NUMBER_SITE = TWO,
}

@Component({
  selector: 'app-organisme',
  templateUrl: './organisme.component.html',
  styleUrls: ['./organisme.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class OrganismeComponent {
  active;
  labelActif;

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  tabs: OngletPremierNiveau[] = [
    { label: 'Organismes', perm: AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.ID },
    { label: 'Régions', perm: AUTH.ADMINISTRATION.ORGANISMES.REGION.ID },
    { label: 'Sites', perm: AUTH.ADMINISTRATION.ORGANISMES.SITE.ID },
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
