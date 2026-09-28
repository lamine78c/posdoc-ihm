import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { Faq, FaqStatusType, SearchAllFaqResponse } from '@app/models/faq-conversation';
import { ApolloQueryResult } from 'apollo-client';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { PathCompletInterface } from '@app/models/contenu-for-accueil';
import {
  ListQuestionComponent
} from '@app/admin/contenu/popup-help/onglets/conversation/list-question/list-question.component';
import { FaqNotification, GetNotificationInterface } from '@app/models/notification';
import { NotificationsRefreshService } from '@app/shared/services/notifications-refresh.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  standalone: false
})
@AutoUnsubscribe
export class ConversationComponent implements OnInit {

  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly notificationsRefreshService = inject(NotificationsRefreshService);

  @ViewChild(ListQuestionComponent) listQuestionComponent!: ListQuestionComponent;

  @Input() path: string

  faqs: Faq[] = []
  selectedFaq: Faq
  faqNotifications: FaqNotification[] = [];
  subscriptions: Subscription[] = [];
  pathOptions: {value: string, text: string}[] = []

  ngOnInit(): void {
    this.loadPathOptions()
    this.getOpenConversation()
    this.loadFaqNotifications()

    // Écouter les rafraîchissements de notifications
    this.subscriptions.push(
      this.notificationsRefreshService.refresh$.subscribe(() => this.loadFaqNotifications())
    );
  }

  getOpenConversation() {
    this.subscriptions.push(
        this.apiAdelaideFaqService.searchAllFaq().pipe(take(1)).subscribe((result: ApolloQueryResult<SearchAllFaqResponse>) => {
        const faqList = result.data?.searchAllFaq;
        if (faqList && faqList.length > 0) {
          this.faqs = this.filter_faq(faqList)
        }
      })
    )
  }

  handleCreatedQuestion(faqCreated: Faq[]) {
    this.faqs = this.filter_faq(faqCreated)
  }

  handleUpdatedQuestion(faqUpdated: Faq[]) {
    this.faqs = this.filter_faq(faqUpdated)
  }

  handleMessageCreated(faqWithNewMessage: Faq) {
    this.faqs = this.filter_faq(this.faqs.map(faq => {
      if (faq.id == faqWithNewMessage.id) {
        return faqWithNewMessage
      }
      return faq
    }))
    this.selectedFaq = this.faqs.find(faq => {
      return faq.id == faqWithNewMessage.id
    })
  }

  handleActionOnCreateComponent() {
    this.selectedFaq = undefined

    if (this.listQuestionComponent) {
      this.listQuestionComponent.closeUpdatingQuestion()
    }
  }

  setSelectedFaq(faqSelected: Faq) {
    this.selectedFaq = faqSelected
  }

  filter_faq(faqList: Faq[]) {
    return faqList.filter((faq: Faq) => {
      return faq.createdBy === sessionStorage.getItem("user.login") && faq.status === FaqStatusType.DRAFT
    }).sort((x, y) => {
      return new Date(y.updatedAt).getTime() - new Date(x.updatedAt).getTime();
    });
  }

  private loadPathOptions() {
    this.subscriptions.push(
      this.apiAdelaideContenuService.getAllPathComplet().pipe(take(1)).subscribe((result: ApolloQueryResult<PathCompletInterface>) => {
        this.pathOptions = result.data.getAllPathComplet.map((item: any) => ({
          value: item.path,
          text: item.libelle,
        }));
      })
    );
  }

  private loadFaqNotifications() {
    this.subscriptions.push(
      this.apiAdelaideFaqService.getNotificationsCount().pipe(take(1)).subscribe((result: ApolloQueryResult<GetNotificationInterface>) => {
        this.faqNotifications = result.data.getNotification;
      })
    );
  }
}
