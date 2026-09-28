import { Component, inject, Input, OnInit } from '@angular/core';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subscription, take } from 'rxjs';
import { ParamsPopupFichiers } from '../../models/params-fichiers-interface';
import { SearchProduitsByFichierInput } from '../../models/search-produits-by-fic-interface';

@Component({
  selector: 'app-produits-fichier',
  templateUrl: './produits-fichier.component.html',
  styleUrls: ['./produits-fichier.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ProduitsFichierComponent implements OnInit {
  details = [];
  @Input() params: ParamsPopupFichiers;
  error;
  subscriptions: Subscription[] = [];
  private readonly apiAdelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.loadProduit();
  }

  loadProduit() {
    const input: SearchProduitsByFichierInput = {
      codenv: this.params.codenv,
      codorg: this.params.codorg,
      codapp: this.params.codapp,
      codfic: this.params.codfic,
      codcom: this.params.codcom,
      numcom: this.params.numcom,
      percod: this.params.percod,
    };
    this.subscriptions.push(
      this.apiAdelaideOccurenceApplicationService.searchProduitsByFichier(input).pipe(take(1)).subscribe({
        next: result => {
          const results = result.data.searchProduitsByFichier;
          this.details = results.map(row => {
            row.dprodd = SharedUtil.formatDateToDDMMYYYYHHMMSS(row.dprodd);
            row.dprods = SharedUtil.formatDateToDDMMYYYYHHMMSS(row.dprods);
            row.dprodt = SharedUtil.formatDateToDDMMYYYYHHMMSS(row.dprodt);
            return row;
          });
        },
        error: error => {
          this.error = 'Une erreur est survenue';
        },
      })
    );
  }
}
