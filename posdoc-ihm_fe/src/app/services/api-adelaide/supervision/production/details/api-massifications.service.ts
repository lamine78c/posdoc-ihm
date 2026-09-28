import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { ParamMassificationApiModel } from '@app/models/supervision/production/details/param-massification-api-model';
import { DetailsMassificationsInterface } from '@app/models/supervision/production/details/massifications-interface';
import { ParamOccurrenceEtapeDetailsMassification } from '@app/models/supervision/production/details/param-occurrence-etape-details-massification';
import { DetailsMassificationOccurrenceEtapeInterface } from '@app/models/supervision/production/details/details-massification-occurrence-etape-interface';

@Injectable({
  providedIn: 'root',
})
export class ApiMassificationsService {
  constructor(private apollo: Apollo) {}

  getDetailsMassification(paramData: ParamMassificationApiModel) {
    return this.apollo.watchQuery<DetailsMassificationsInterface>({
      query: gql`
        query getDetailsMassification($paramData: ParamDataMassificationInput!) {
          getDetailsMassification(paramData: $paramData) {
            masper
            mascom
            masfic
            masnum
            codorg
            codapp
            percod
            codcom
            codfic
            numcom
            libFichier
            refImprime
            codprd
            masuti
            pagFic
            pliFic
            codcli
            masenv
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDetailsMassificationOccurrenceEtape(payload: ParamOccurrenceEtapeDetailsMassification) {
    return this.apollo.watchQuery<DetailsMassificationOccurrenceEtapeInterface>({
      query: gql`
        query findDetailsMassificationForOccurrenceEtape($payload: DetailsMassificationPayload!) {
          findDetailsMassificationForOccurrenceEtape(payload: $payload) {
            codenv
            codorg
            codapp
            percod
            codcom
            codfic
            refimp
            libfic
          }
        }
      `,
      variables: {
        payload: payload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
