import { Component, Input, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-commande-details',
  templateUrl: './commande-details.component.html',
  styleUrl: './commande-details.component.scss',
  standalone: false
})
@AutoUnsubscribe
export class CommandeDetailsComponent implements OnInit {
  @Input() codenv: string;
  @Input() codorg: string;
  @Input() codapp: string;

  rowData: any = [];
  totalArticles = 0;
  modalTitle = '';
  subscriptions: Subscription[] = [];

  public activeModal = inject(NgbActiveModal);
  private readonly apiCommandeService = inject(ApiAdelaideCommandeService);

  constructor() {
    //do-nothing
  }

  ngOnInit(): void {
    this.modalTitle = `Détails des commandes de l'application ${this.codenv}-${this.codorg}-${this.codapp}`;
    this.loadCommandeDetails();
  }

  loadCommandeDetails(): void {
    const filters = {
      codenv: this.codenv,
      codorg: this.codorg,
      codapp: this.codapp,
    };

    this.subscriptions.push(
      this.apiCommandeService.getCodLibCommandeByEnvOrgApp(filters).pipe(take(1)).subscribe({
      next: (result) => {
        const commandes = result.data.getCodLibCommandeByEnvOrgApp;
        this.rowData = commandes.map(e => ({
          codcom: e.code,
          libcom: e.libelle
        }));
        this.totalArticles = this.rowData.length;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.rowData = [];
        this.totalArticles = 0;
        }
      })
    );
  }
}
