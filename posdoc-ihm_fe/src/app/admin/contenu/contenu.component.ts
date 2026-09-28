import { Component, inject } from '@angular/core';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { ActivatedRoute } from '@angular/router';
import {ONE, TWO, ZERO} from '@app/shared/utils/Constants';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_ACCUEIL = ZERO,
  ONGLET_NUMBER_AIDE = ONE,
  ONGLET_NUMBER_FAQ = TWO,
}

@Component({
  selector: 'app-contenu',
  templateUrl: './contenu.component.html',
  styleUrls: ['./contenu.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ContenuComponent {
  active;
  labelActif;

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  tabs: OngletPremierNiveau[] = [
    { label: "Pages d'accueil", perm: AUTH.ADMINISTRATION.CONTENU.PAGE_ACCUEIL.ID },
    { label: 'Aide', perm: AUTH.ADMINISTRATION.CONTENU.AIDE.ID },
    { label: 'FAQ', perm: AUTH.ADMINISTRATION.CONTENU.FAQ.ID },
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
