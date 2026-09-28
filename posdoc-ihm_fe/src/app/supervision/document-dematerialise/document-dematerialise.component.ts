import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

export enum OngletNumEnum {
  ONGLET_NUMBER_DOCUMENT_DEMAT_CONSULT = ZERO,
  ONGLET_NUMBER_DOCUMENT_DEMAT_VIDEO = ONE,
}

@Component({
  selector: 'app-document-dematerialise',
  templateUrl: './document-dematerialise.component.html',
  styleUrls: ['./document-dematerialise.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DocumentDematerialiseComponent {
  active = ZERO;
  nextId = ZERO;
  labelActif = ZERO;
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;
  onglets: OngletPremierNiveau[] = [];
  unsavedChange = false;
  tabs: OngletPremierNiveau[] = [
    { label: 'Consultation', perm: AUTH.SUPERVISION.DOCUMENTS_DEMATERIALISES.CONSULTATION.ID },
    { label: 'Video', perm: AUTH.SUPERVISION.DOCUMENTS_DEMATERIALISES.VIDEO.ID },
  ];

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
