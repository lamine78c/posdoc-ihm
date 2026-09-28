import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { FIVE, FOUR, ONE, THREE, TWO, ZERO } from '@app/shared/utils/Constants';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_COMPOSITION = ZERO,
  ONGLET_NUMBER_FORMAT = ONE,
  ONGLET_NUMBER_MULTIF = TWO,
  ONGLET_NUMBER_SUPPORT = THREE,
  ONGLET_NUMBER_ECHANT = FOUR,
  ONGLET_NUMBER_EDIT = FIVE,
}

@Component({
  selector: 'app-specification-fichier',
  templateUrl: './specification-fichier.component.html',
  styleUrls: ['./specification-fichier.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class SpecificationFichierComponent {
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;

  active;
  labelActif;

  tabs: OngletPremierNiveau[] = [
    { label: 'Compositions', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS.ID },
    { label: 'Formats', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.FORMATS.ID },
    { label: 'Multi feuillets', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.MULTI_FEUILLETS.ID },
    { label: 'Supports', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS.ID },
    { label: 'Echantillons', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.ID },
    { label: 'Rééditions', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.ID },
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
