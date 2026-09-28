import { Component, inject, Input, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { OngletModal } from '@app/fullstack-components/onglets/models/onglets.models';
import { ApiAdelaideHabilitationService } from '@app/services/api-adelaide-habilitation.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ZERO } from '@app/shared/utils/Constants';
import { NgbActiveModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
import { HelpComponent } from './onglets/help/help.component';
import { ConversationComponent } from '@app/admin/contenu/popup-help/onglets/conversation/conversation.component';
import { FaqComponent } from '@app/admin/contenu/popup-help/onglets/faq/faq.component';

@Component({
  selector: 'app-popup-help',
  templateUrl: './popup-help.component.html',
  styleUrls: ['./popup-help.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class PopupHelpComponent implements OnInit, OnDestroy {
  @Input() path: string;
  @Input() aideMessage: string;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer: ViewContainerRef;

  active = ZERO;
  nextId = ZERO;
  labelActif = ZERO;
  tabs: OngletModal[] = [];
  onglets: OngletModal[] = [];
  modalTitle: string;
  subscriptions: Subscription[] = [];

  public activeModal = inject(NgbActiveModal);
  private readonly permissionsService = inject(PermissionService);
  private readonly apiAdelaideHabilitationService = inject(ApiAdelaideHabilitationService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.getModalTitle();
    this.getTabs();
    this.onglets = this.tabs.filter(e => (e.perm ? this.permissionsService.hasPermission(e.perm) : true));
    if (this.onglets.length > ZERO) {
      this.loadComponent(this.onglets[ZERO].label);
    }
  }

  getModalTitle() {
    this.subscriptions.push(
      this.apiAdelaideHabilitationService.getPathCompletByPath(this.path).pipe(take(1)).subscribe(data => {
        this.modalTitle = data.data.getPathCompletByPath;
      })
    );
  }

  activeChange(event: NgbNavChangeEvent): void {
    this.labelActif = this.tabs.findIndex(e => e.label === this.onglets[event.nextId].label);
    this.loadComponent(this.onglets[event.nextId].label);
  }

  loadComponent(label: string): void {
    const tab = this.tabs.find(t => t.label === label);
    if (tab) {
      this.dynamicComponentContainer.clear();
      const componentRef = this.dynamicComponentContainer.createComponent(tab.component);
      (componentRef.instance as any).path = this.path;
      if (this.aideMessage) {
        (componentRef.instance as any).aideMessage = this.aideMessage;
      }
    }
  }

  getTabs(): void {
    this.tabs = [
      {
        label: 'Aide',
        component: HelpComponent,
      },
      {
        label: 'FAQ',
        component: FaqComponent,
      },
      {
        label: 'Mes questions',
        component: ConversationComponent,
      },
    ];
  }

  ngOnDestroy(): void {
    this.dynamicComponentContainer.clear();
  }
}
