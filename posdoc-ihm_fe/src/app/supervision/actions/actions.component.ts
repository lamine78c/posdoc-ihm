import { Component, inject } from '@angular/core';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_MISE_A_JOUR_IHM = ZERO,
  ONGLET_NUMBER_ACTION_UTILISATEUR = ONE,
}

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ActionsComponent {
  active = ZERO;
  nextId = ZERO;
  labelActif = ZERO;
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;
  onglets: OngletPremierNiveau[] = [];
  unsavedChange = false;
  tabs: OngletPremierNiveau[] = [
    { label: 'Mise à jour IHM', perm: AUTH.SUPERVISION.ACTIONS.MISE_A_JOUR_DANS_IHM.ID },
    { label: 'Actions des utilisateurs', perm: AUTH.SUPERVISION.ACTIONS.ACTION_UTILISATEUR.ID },
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
    if (!this.unsavedChange) {
      this.labelActif = this.tabs.findIndex(e => e.label === this.onglets[event.nextId].label);
    } else {
      this.nextId = event.nextId;
      event.preventDefault();
    }
  }

  setOngletActive(fragment) {
    this.active = this.ongletService.getIndexOnglet(this.onglets, fragment);
    this.labelActif = this.ongletService.getIndexOnglet(this.tabs, fragment);
  }
}
