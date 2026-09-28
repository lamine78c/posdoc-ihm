import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { AffectationNoticeComponent } from '@app/produit/notice/affectation-notice/affectation-notice.component';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { ONE, TWO, ZERO } from '@app/shared/utils/Constants';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

export enum OngletNumEnum {
  ONGLET_NUMBER_NOTICE_ACTIVE = ZERO,
  ONGLET_NUMBER_NOTICE_PERIMEE = ONE,
  ONGLET_NUMBER_AFF_NOTICE = TWO,
  ONGLET_NUMBER_NOTICES_FICHIERS = 3,
}

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class NoticeComponent {
  active = ZERO;
  labelActif = ZERO;
  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  ongletNumEnum: typeof OngletNumEnum = OngletNumEnum;
  onglets: OngletPremierNiveau[] = [];
  tabs: OngletPremierNiveau[] = [
    { label: 'Notices actives', perm: AUTH.FICHIER_EDITION.NOTICES.NOTICES_ACTIVES.ID },
    { label: 'Notices périmées', perm: AUTH.FICHIER_EDITION.NOTICES.NOTICES_PERIMEES.ID },
    { label: 'Affectation notices', perm: AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES.ID },
    { label: 'Notices de fichiers', perm: AUTH.FICHIER_EDITION.NOTICES.NOTICES_FICHIERS.ID },
  ];

  @ViewChild(AffectationNoticeComponent)
  affectationNoticeComponent!: AffectationNoticeComponent;

  private readonly permissionsService = inject(PermissionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ongletService = inject(OngletService);
  private readonly changeNotSubmitedConfirmationService = inject(PopupConfirmationService);
  subscriptions: Subscription[] = [];

  constructor() {
    this.onglets = this.tabs.filter(e => this.permissionsService.hasPermission(e.perm));
    if (this.onglets.length > ZERO) {
      this.subscriptions.push(
        this.activatedRoute.fragment.subscribe(fragment => {
          if (fragment) {
            this.active = this.ongletService.getIndexOnglet(this.onglets, fragment);
            this.labelActif = this.ongletService.getIndexOnglet(this.tabs, fragment);
          } else {
            this.ongletService.navigateToFirstOnglet(this.onglets);
          }
        })
      );
    }
  }

  activeChange(event: NgbNavChangeEvent): void {
    this.labelActif = this.tabs.findIndex(e => e.label === this.onglets[event.nextId].label);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.affectationNoticeComponent?.isSomeChangeNotSubmited) {
      return this.changeNotSubmitedConfirmationService.askConfirmation();
    }
    return true;
  }
}
