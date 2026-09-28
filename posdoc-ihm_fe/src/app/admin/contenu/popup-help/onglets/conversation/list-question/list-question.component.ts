import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { Faq, UpdateFaqResponse } from '@app/models/faq-conversation';
import { Subscription } from 'rxjs';
import { MutationResult } from 'apollo-angular';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { FaqNotification } from '@app/models/notification';

@Component({
  selector: 'app-list-question',
  templateUrl: './list-question.component.html',
  styleUrl: './list-question.component.scss',
  standalone: false
})
@AutoUnsubscribe
export class ListQuestionComponent implements OnInit {

  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly fb = inject(FormBuilder);

  @Output() questionSelect  = new EventEmitter<Faq>();
  @Output() questionsUpdate = new EventEmitter<Faq[]>();

  @Input() faqs: Faq[] = []
  @Input() questionSelected: Faq = undefined
  @Input() pathOptions: {value: string, text: string}[] = []
  @Input() faqNotifications: FaqNotification[] = []

  form: FormGroup
  questionUpdating: Faq = undefined
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm()
  }

  private initForm() {
    this.form = this.fb.group({
      question: ["", CustomValidators.required()]
    });
  }

  editQuestion(faq: Faq) {
    if (!this.questionSelected) {
      this.form.patchValue({
        question: faq.question
      })
      this.questionUpdating = faq
    }
  }

  saveUpdateQuestion(){
    const data = this.form.getRawValue();

    this.subscriptions.push(
      this.apiAdelaideFaqService.updateFaq(this.questionUpdating.id, this.questionUpdating.path, data.question).subscribe((result: MutationResult<UpdateFaqResponse>) => {

        const updatedFaq: Faq[] = result.data?.updateFaq;

        if (updatedFaq) {
          this.questionsUpdate.emit(updatedFaq)
        }

        this.form.get('question')?.setValue('');
        this.questionUpdating = undefined
      })
    )
  }

  selectConversation(faq: Faq) {
    if (this.questionSelected && this.questionSelected.id === faq.id){
      this.questionSelect.emit(undefined)
    } else {
      this.questionSelect.emit(faq)
    }
  }

  closeUpdatingQuestion(){
    this.form.patchValue({
      question: ""
    })
    this.questionUpdating = undefined
  }

  getPathLabel(pathValue: string): string {
    const option = this.pathOptions.find(opt => opt.value === pathValue);
    return option ? option.text : pathValue;
  }

  hasNotification(faq: Faq): boolean {
    return this.faqNotifications.some(notif => notif.faq.id === faq.id);
  }
}
