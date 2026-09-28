import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { CreateFaqResponse, Faq } from '@app/models/faq-conversation';
import { MutationResult } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class CreateQuestionComponent implements OnInit, OnChanges {

  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly fb = inject(FormBuilder);

  @Output() newFaqCreated = new EventEmitter<Faq[]>();
  @Output() actionOnCreateComponent = new EventEmitter();

  @Input() path: string = ""
  @Input() isConversationSelected: boolean = false
  @Input() pathOptions: {value: string, text: string}[] = []

  isAccordionCollapsed: boolean = true
  form: FormGroup
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isConversationSelected'] && this.isConversationSelected) {
      this.isAccordionCollapsed = true;
    }
  }

  private initForm() {
    this.form = this.fb.group({
      path: [this.path, CustomValidators.required()],
      question: ["", CustomValidators.required()]
    });
  }

  saveNewConversation(){
    const data = this.form.getRawValue();
    this.subscriptions.push(
      this.apiAdelaideFaqService.createFaq(data.path, data.question).subscribe((result: MutationResult<CreateFaqResponse>) => {
        if (result.data?.createFaq){
          this.newFaqCreated.emit(result.data.createFaq)
          this.form.reset()
          this.isAccordionCollapsed = true
        }
      }))
  }

  onAccordionShown() {
    this.isAccordionCollapsed = false;
    this.actionOnCreateComponent.emit();
  }

  onAccordionHidden() {
    this.isAccordionCollapsed = true;
    this.initForm()
  }
}
