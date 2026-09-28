import { Component, inject, OnInit } from '@angular/core';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from '@app/services/permission/permission.service';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ZERO } from '@app/shared/utils/Constants';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_FACTURATION_DETAILLEE = ZERO,
}

@Component({
  selector: 'app-facturation',
  templateUrl: './facturation.component.html',
  styleUrls: ['./facturation.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class FacturationComponent implements OnInit {
  active = ZERO;
  nextId = ZERO;
  labelActif = ZERO;
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;
  onglets: OngletPremierNiveau[] = [];
  unsavedChange = false;
  tabs: OngletPremierNiveau[] = [{ label: 'Facturation détaillée', perm: AUTH.SUIVI.FACTURATIUON.FACTURATIONS_DETAILLEES.ID }];

  private readonly permissionsService = inject(PermissionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ongletService = inject(OngletService);
  subscriptions: Subscription[] = [];

  constructor() {
    this.onglets = this.tabs.filter(e => this.permissionsService.hasPermission(e.perm));
  }

  activeChange(event: NgbNavChangeEvent): void {
    if (!this.unsavedChange) {
      this.labelActif = this.tabs.findIndex(e => e.label === this.onglets[event.nextId].label);
    } else {
      this.nextId = event.nextId;
      event.preventDefault();
    }
  }

  ngOnInit(): void {
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
