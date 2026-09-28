import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { Faq, FaqStatusType, SearchAllFaqResponse } from '@app/models/faq-conversation';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { PathCompletInterface } from '@app/models/contenu-for-accueil';

@Component({
  selector: 'app-faq-onglet',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  standalone: false,
})
@AutoUnsubscribe
export class FaqComponent implements OnInit {

  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly fb = inject(FormBuilder);

  @Input() path: string;

  allFaqs: Faq[] = [];
  filteredFaqs: Faq[] = [];
  selectedFaqId: number | undefined = undefined;
  filterForm: FormGroup;
  pathOptions: {value: string, text: string}[] = [];
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadPathOptions();
    this.getFaq();
  }

  private initForm() {
    this.filterForm = this.fb.group({
      path: [this.path || 'ALL'],
      search: ['']
    });

    this.subscriptions.push(
      this.filterForm.valueChanges.subscribe(() => {
        this.filteredFaqs = this.filter_faq(this.allFaqs);
      })
    );
  }

  private loadPathOptions() {
    this.subscriptions.push(
      this.apiAdelaideContenuService
        .getAllPathComplet()
        .pipe(take(1))
        .subscribe((result: ApolloQueryResult<PathCompletInterface>) => {
          this.pathOptions = result.data.getAllPathComplet.map((item: any) => ({
            value: item.path,
            text: item.libelle,
          }));
          this.pathOptions.unshift({ value: 'ALL', text: 'Toutes les pages' });

          const pathExists = this.pathOptions.some(opt => opt.value === this.path);

          if (!pathExists) {
            this.filterForm.get('path')?.setValue('ALL');
          } else {
            this.filterForm.get('path')?.setValue(this.path);
          }
        })
    );
  }

  getFaq() {
    this.subscriptions.push(
      this.apiAdelaideFaqService
        .searchAllFaq()
        .pipe(take(1))
        .subscribe((result: ApolloQueryResult<SearchAllFaqResponse>) => {
          const faqList = result.data?.searchAllFaq;
          if (faqList && faqList.length > 0) {
            this.allFaqs = faqList;
            this.filteredFaqs = this.filter_faq(this.allFaqs);
          }
        })
    );
  }

  toggleAnswer(faq: Faq) {
    if (this.selectedFaqId === faq.id) {
      this.selectedFaqId = undefined;
    } else {
      this.selectedFaqId = faq.id;
      faq.viewCount = (faq.viewCount || 0) + 1;

      this.filteredFaqs = this.filter_faq(this.allFaqs);

      this.subscriptions.push(
        this.apiAdelaideFaqService.increaseViewCount(faq.id).subscribe({
          error: () => {
            faq.viewCount = (faq.viewCount || 0) - 1;
            this.filteredFaqs = this.filter_faq(this.allFaqs);
          },
        })
      );
    }
  }

  filter_faq(faqList: Faq[]) {
    const filters = this.filterForm.value;
    const searchTerm = filters.search ? filters.search.toLowerCase() : '';
    const selectedPath = filters.path;

    return faqList.filter((faq: Faq) => {
      const statusOk = faq.status === FaqStatusType.ENABLED;

      let pathOk = true;
      if (selectedPath && selectedPath !== 'ALL') {
        pathOk = faq.path === selectedPath;
      }

      const textOk = searchTerm
        ? (faq.question.toLowerCase().includes(searchTerm) || (faq.answer && faq.answer.toLowerCase().includes(searchTerm)))
        : true;

      return statusOk && pathOk && textOk;
    }).sort((x, y) => {
      return y.viewCount - x.viewCount;
    });
  }

  getPathLabel(pathValue: string): string {
    const option = this.pathOptions.find(opt => opt.value === pathValue);
    return option ? option.text : pathValue;
  }
}
