import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { CreateFaqExchangeResponse, Faq } from '@app/models/faq-conversation';
import { MutationResult } from 'apollo-angular';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { NotificationsRefreshService } from '@app/shared/services/notifications-refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-answer-question',
  templateUrl: './answer-question.component.html',
  styleUrl: './answer-question.component.scss',
  standalone: false
})
@AutoUnsubscribe
export class AnswerQuestionComponent implements OnInit, OnChanges {

  private readonly fb = inject(FormBuilder);
  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly notificationsRefreshService = inject(NotificationsRefreshService);

  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  @Output() messageCreated = new EventEmitter<Faq>();

  @Input() faqToDisplay: Faq

  form: FormGroup
  subscriptions: Subscription[] = [];


  ngOnInit(): void {
    this.initForm()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.faqToDisplay && changes['faqToDisplay']) {
      setTimeout(() => {
        this.scroll();
      }, 0);
    }
    if (!this.faqToDisplay && this.form) {
      this.form.get('message')?.setValue('');
    }
  }

  private initForm() {
    this.form = this.fb.group({
      message: ['', CustomValidators.required()],
    });
  }

  saveMessage(){
    const data = this.form.getRawValue();
    this.subscriptions.push(
      this.apiAdelaideFaqService.createFaqExchange(data.message, this.faqToDisplay.id).subscribe((result: MutationResult<CreateFaqExchangeResponse>) => {

        const updatedFaqOrExchange = result.data?.createFaqExchange;

        if (updatedFaqOrExchange) {
          this.messageCreated.emit(updatedFaqOrExchange)
          this.notificationsRefreshService.notifyRefresh();
        }

        this.form.get('message')?.setValue('');
      })
    )
  }

  scroll() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Pas de conteneur de messages');
    }
  }

  isCurrentUser(author: string): boolean {
    const currentUser = sessionStorage.getItem('user.login');
    return currentUser === author;
  }
}
