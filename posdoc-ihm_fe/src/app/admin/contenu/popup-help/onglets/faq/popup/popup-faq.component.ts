import { Component, DestroyRef, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { NotificationsRefreshService } from '@app/shared/services/notifications-refresh.service';
import { QUILL_DEFAULT_MODULES } from '@app/shared/config/quill-editor.config';

@Component({
  selector: 'app-popup-faq',
  templateUrl: './popup-faq.component.html',
  styleUrls: ['./popup-faq.component.scss'],
  standalone: false,
})
export class PopupFaqComponent implements OnInit, OnChanges {
  form: FormGroup;
  messageForm: FormGroup;
  modalRef: NgbModalRef;
  labelWidth = '9.929rem';
  isFaqAccordionOpen = true;
  isExchangeAccordionOpen = false;
  isFormTouched = false;

  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  @Input() id: number;
  @Input() path = '';
  @Input() question = '';
  @Input() answer = '';
  @Input() createdBy = '';
  @Input() createdAt = '';
  @Input() status: 'draft' | 'enabled' | 'disabled' = 'draft';
  @Input() exchanges: Array<{
    id: number;
    author: string;
    message: string;
    createdAt: string;
  }> = [];

  pathOptions: { value: string; text: string }[] = [];

  // Configuration de Quill Editor partagée
  quillModules = QUILL_DEFAULT_MODULES;

  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly notificationsRefreshService = inject(NotificationsRefreshService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.loadPathOptions();
    this.initForm();
    this.initMessageForm();
    this.trackFormChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exchanges'] && this.exchanges) {
      setTimeout(() => {
        this.scroll();
      }, 0);
    }
  }

  private trackFormChanges() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isFormTouched = true;
    });
  }

  private loadPathOptions() {
    this.apiAdelaideContenuService.getAllPathComplet().subscribe(result => {
      this.pathOptions = result.data.getAllPathComplet.map((item: any) => ({
        value: item.path,
        text: item.libelle,
      }));
    });
  }

  private initForm() {
    this.form = this.fb.group({
      path: [this.path, CustomValidators.required()],
      question: [this.question, CustomValidators.required()],
      answer: [this.answer, CustomValidators.required()],
    });
  }

  private initMessageForm() {
    this.messageForm = this.fb.group({
      message: ['', CustomValidators.required()],
    });
  }

  save() {
    const data = this.form.getRawValue();
    if (this.id) {
      data.id = this.id;
    }
    this.activeModal.close(data);
    this.notificationsRefreshService.notifyRefresh();
  }

  getInitials(author: string): string {
    if (!author) return '?';
    const parts = author.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  isCurrentUser(author: string): boolean {
    const currentUser = sessionStorage.getItem('user.login');
    return currentUser === author;
  }

  saveMessage() {
    if (!this.id || this.messageForm.invalid) return;

    const data = this.messageForm.getRawValue();
    this.apiAdelaideFaqService
      .createFaqExchange(data.message, this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          const updatedFaq = result.data?.createFaqExchange;
          if (updatedFaq && updatedFaq.exchanges) {
            // Mettre à jour la liste des échanges
            this.exchanges = updatedFaq.exchanges;
          }
          // Réinitialiser le formulaire
          this.messageForm.reset();
          // Scroll vers le bas pour voir le nouveau message
          setTimeout(() => {
            this.scroll();
          }, 0);
          this.notificationsRefreshService.notifyRefresh();
        },
        error: error => {
          console.error("Erreur lors de l'envoi du message:", error);
        },
      });
  }

  onAccordionShown() {
    this.isExchangeAccordionOpen = true;
    setTimeout(() => {
      this.scroll();
    }, 0);
  }

  scroll() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Pas de conteneur de messages');
    }
  }
}
