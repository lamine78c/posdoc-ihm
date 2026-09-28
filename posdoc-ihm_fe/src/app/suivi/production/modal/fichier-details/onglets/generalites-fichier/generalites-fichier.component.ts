import { Component, inject, Input, OnInit } from '@angular/core';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subscription, take } from 'rxjs';
import { ParamsPopupFichiers } from '../../models/params-fichiers-interface';
import { SearchOccAppByFicInput, SearchOccAppByFicInterface } from '../../models/search-occ-app-by-fic-interface';

@Component({
  selector: 'app-generalites-fichier',
  templateUrl: './generalites-fichier.component.html',
  styleUrls: ['./generalites-fichier.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class GeneralitesFichierComponent implements OnInit {
  @Input() params: ParamsPopupFichiers;
  detail: SearchOccAppByFicInterface;
  error;
  subscriptions: Subscription[] = [];

  private readonly apiAdelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);

  constructor() {
    //do-nothing
  }

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail() {
    const input: SearchOccAppByFicInput = {
      codenv: this.params.codenv,
      codorg: this.params.codorg,
      codapp: this.params.codapp,
      codfic: this.params.codfic,
      codcom: this.params.codcom,
      numcom: this.params.numcom,
      percod: this.params.percod,
    };
    this.subscriptions.push(
      this.apiAdelaideOccurenceApplicationService.searchOccAppByFic(input).pipe(take(1)).subscribe({
        next: result => {
          this.detail = result.data.searchOccAppByFic;
          this.detail.dfichd = SharedUtil.formatDateToDDMMYYYYHHMMSS(this.detail.dfichd);
          this.detail.dfichs = SharedUtil.formatDateToDDMMYYYYHHMMSS(this.detail.dfichs);
          this.detail.dficht = SharedUtil.formatDateToDDMMYYYYHHMMSS(this.detail.dficht);
          this.detail.dappcr = SharedUtil.formatDateToDDMMYYYYHHMMSS(this.detail.dappcr);
        },
        error: error => {
          this.error = 'Une erreur est survenue';
        },
      })
    );
  }
}
