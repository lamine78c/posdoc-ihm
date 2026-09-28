import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, THREE, TWO, ZERO } from '@app/shared/utils/Constants';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_OCC_APP = ZERO,
  ONGLET_NUMBER_GESTION_OCC_APP = ONE,
  ONGLET_NUMBER_GESTION_OCC_ETAPE = TWO,
  ONGLET_NUMBER_OCC_ETAPE = THREE,
}

@Component({
  selector: 'app-production',
  templateUrl: './production.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ProductionComponent {
  active = ZERO;
  nextId = ZERO;
  labelActif = ZERO;
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;
  onglets: OngletPremierNiveau[] = [];
  unsavedChange = false;
  tabs: OngletPremierNiveau[] = [
    { label: `Occurrences d'application`, perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_APPLICATION.ID },
    { label: `Gestion des occurrences d'application`, perm: AUTH.SUPERVISION.PRODUCTION.GESTION_OCCURENCES_APPLICATION.ID },
    { label: `Gestion des occurrences d'étapes`, perm: AUTH.SUPERVISION.PRODUCTION.GESTION_OCCURENCES_ETAPES.ID },
    { label: `Occurrences d'étapes`, perm: AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID },
  ];

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly permissionsService = inject(PermissionService);
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

  activeChange(event: NgbNavChangeEvent): void {
    event.preventDefault();
  }

  setOngletActive(fragment) {
    this.active = this.ongletService.getIndexOnglet(this.onglets, fragment);
    this.labelActif = this.ongletService.getIndexOnglet(this.tabs, fragment);
  }
}
