import { Component, Input, OnInit } from '@angular/core';
import { DocumentsVideoInterface } from '@app/models/supervision/production/details/documents-video-infomations-detail';
import { DocumentVideoParamDataModel } from '@app/models/supervision/production/details/paramData-video-model';
import { ApiAdelaideDocumentDematerialiseVideoService } from '@app/services/api-adelaide-docments-dematerialise-video.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TYPES } from '@app/shared/utils/Constants';
import { VideoDataItem } from '@app/models/video-data-item-interface';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DetailsComponent implements OnInit {
  @Input() paramData: DocumentVideoParamDataModel;
  videoData: VideoDataItem[] = [];
  subscriptions: Subscription[] = [];
  modalTitle: string;
  videoInfoDetail: DocumentsVideoInterface;

  constructor(
    public activeModal: NgbActiveModal,
    private apiAdelaideDocumentDematerialiseVideoService: ApiAdelaideDocumentDematerialiseVideoService,
    private generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.getDocumentsVideoInformationDetail();
  }
  getDocumentsVideoInformationDetail(): void {
    this.subscriptions.push(
      this.apiAdelaideDocumentDematerialiseVideoService.getDocsDematerialisesVideoInfoDetail(this.paramData).pipe(take(1)).subscribe(response => {
        this.videoData = [];
        const videoInfoDetail: DocumentsVideoInterface = response.data.getDocsDematerialisesVideoInfoDetail;
        if (!videoInfoDetail) {
          return;
        }
        const identifiant = this.paramData.datdem + '-' + this.paramData.numdem;
        let dureEnSeconds = '';
        if (videoInfoDetail.ddodeb && videoInfoDetail.ddofin) {
          const startDate = new Date(videoInfoDetail.ddodeb).getTime();
          const endDate = new Date(videoInfoDetail.ddofin).getTime();
          if (endDate > startDate) {
            dureEnSeconds = Math.ceil((endDate - startDate) / 1000).toString();
          }
        }

        this.videoData.push(
          ['Identifiant', identifiant],
          ['Référence', videoInfoDetail.refdem],
          ['Document', videoInfoDetail.coddoc],
          ['Traitement', this.getLabelForType(videoInfoDetail.typact)],
          ['Impression?', videoInfoDetail.imprim ? 'Oui' : 'Non'],
          ['Application', `${videoInfoDetail.codenv}-${videoInfoDetail.codorg}-${videoInfoDetail.codapp}`],
          ['Période', videoInfoDetail.percod],
          ['Fichier', `${videoInfoDetail.codcom}.${videoInfoDetail.codfic}`],
          ['Statut', `${videoInfoDetail.docsta}-${videoInfoDetail.docinf}`],
          ['Anomalie', videoInfoDetail.libinf],
          ['Date début', videoInfoDetail.ddodeb ? SharedUtil.formatDateToDDMMYYYYHHMMSS(videoInfoDetail.ddodeb) : ''],
          ['Date fin', videoInfoDetail.ddofin ? SharedUtil.formatDateToDDMMYYYYHHMMSS(videoInfoDetail.ddofin) : ''],
          ['Date suspension', videoInfoDetail.ddosus ? SharedUtil.formatDateToDDMMYYYYHHMMSS(videoInfoDetail.ddosus) : ''],
          ['Durée en secondes ', dureEnSeconds],
          ['Site ', videoInfoDetail.codeSiteDematerialisation]
        );
      })
    );
    this.modalTitle = `Informations détaillées sur le document dématérialisé ${this.paramData.datdem}-${this.paramData.numdem}`;
  }
  getLabelForType(value: string): string {
    const type = TYPES.find(t => t.value === value);
    return type ? type.label : value;
  }
}
