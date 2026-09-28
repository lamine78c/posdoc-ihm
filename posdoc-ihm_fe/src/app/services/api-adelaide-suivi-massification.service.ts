import { Injectable } from '@angular/core';
import { SuiviMassificationPayloadModel } from '@app/models/suivi/suivi-massification-payload-model';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideSuiviMassificationService {
  constructor(private apollo: Apollo) {}

  getFiltreMassification() {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctFiltreMassification {
          getDistinctFiltreMassification {
            masenv
            masorg
            masper
            codsit
            appsta
            dappld
            dapplt
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  searchSuiviMassification(suiviMassificationPayload: SuiviMassificationPayloadModel) {
    return this.apollo.watchQuery({
      query: gql`
        query searchForSuiviMassification($suiviMassificationPayload: SuiviMassificationPayload!) {
          searchForSuiviMassification(suiviMassificationPayload: $suiviMassificationPayload) {
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
            codenv
            libFichier
            libsup
            codprd
            masuti
            pagFic
            pliFic
            codcli
            codsit
          }
        }
      `,
      variables: {
        suiviMassificationPayload: suiviMassificationPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  searchCountSuiviMassification(suiviMassificationPayload: SuiviMassificationPayloadModel) {
    return this.apollo.watchQuery({
      query: gql`
        query searchCountForSuiviMassification($suiviMassificationPayload: SuiviMassificationPayload!) {
          searchCountForSuiviMassification(suiviMassificationPayload: $suiviMassificationPayload)
        }
      `,
      variables: {
        suiviMassificationPayload: suiviMassificationPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
