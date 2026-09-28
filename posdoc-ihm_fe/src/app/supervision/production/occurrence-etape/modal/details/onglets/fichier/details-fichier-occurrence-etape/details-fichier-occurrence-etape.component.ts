import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { VideoStepDetailsFichierModel } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-details-fichier-occurrence-etape',
  templateUrl: './details-fichier-occurrence-etape.component.html',
  styleUrls: ['./details-fichier-occurrence-etape.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DetailsFichierOccurrenceEtapeComponent implements OnInit, OnChanges {
  @Input() paramData: VideoStepDetailsFichierModel;
  videoStepDetailsFichier: any[] = [];
  subscriptions: Subscription[] = [];
  constructor(private apiGestionOccurrenceEtapeService: ApiGestionOccurrenceEtapeService) {}

  ngOnInit(): void {
    if (this.paramData) {
      this.getVideoStepDetailsFichier();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.paramData && this.paramData) {
      this.getVideoStepDetailsFichier();
    }
  }

  setVideoStepDetailsFichierPayload() {
    const payload = new VideoStepDetailsFichierModel();
    payload.codenv = this.paramData.codenv;
    payload.codorg = this.paramData.codorg;
    payload.codapp = this.paramData.codapp;
    payload.percod = this.paramData.percod;
    payload.codcom = this.paramData.codcom;
    payload.codfic = this.paramData.codfic;
    payload.numcom = this.paramData.numcom;

    return payload;
  }

  getVideoStepDetailsFichier() {
    this.subscriptions.push(
      this.apiGestionOccurrenceEtapeService
        .getVideoStepDetailsFichier(this.setVideoStepDetailsFichierPayload())
        .pipe(take(1))
        .subscribe((response: any) => {
          const data = response.data.getVideoStepDetailsFichier;
          this.videoStepDetailsFichier.push(
            ['Application ', data.codenv + '-' + data.codorg + '-' + data.codapp],
            ['Période', data.percod],
            ['Fichier', data.codcom + data.codfic + '-' + data.numcom],
            ['Désignation', data.libfic],
            ['Imprimé', data.refimp],
            ['Client', data.codcli],
            ['Date expédition', SharedUtil.formatDateToDDMMYYYYHHMMSS(data.dfiexp)],
            ['Nb. pages', data.pagfic],
            ['Nb. plis', data.plific],
            ['Nb. rejets', data.rejfic]
          );
        })
    );
  }
}
