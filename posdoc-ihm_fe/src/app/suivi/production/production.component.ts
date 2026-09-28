import { Component, inject, OnInit } from '@angular/core';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { ActivatedRoute } from '@angular/router';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_OCCURRENCES_APPLICATION = ZERO,
  ONGLET_NUMBER_OCCURRENCES_FICHIERS = ONE,
}

@Component({
  selector: 'app-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ProductionComponent implements OnInit {
  private readonly permissionsService = inject(PermissionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ongletService = inject(OngletService);

  constructor() {
    //do nothing
  }

  active: number;
  labelActif: number;

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  tabs: OngletPremierNiveau[] = [
    { label: "Occurrences d'application", perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID },
    { label: 'Occurrences de fichiers', perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_FICHIERS.ID },
  ];

  onglets: OngletPremierNiveau[] = [];

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
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

  setOngletActive(fragment: string): void {
    this.active = this.ongletService.getIndexOnglet(this.onglets, fragment);
    this.labelActif = this.ongletService.getIndexOnglet(this.tabs, fragment);
  }
}
