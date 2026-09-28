import { Injectable } from '@angular/core';
import { SearchExpeditionQuery } from '@app/models/payload/search-expedition';
import { ExpeditionResultInterface } from '@app/suivi/edition/expedition/distribution-expedition/model/expedition-interface';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideEditionService {
  constructor(private apollo: Apollo) {}

  public getExpeditionsByParam(query: SearchExpeditionQuery) {
    return this.apollo.watchQuery<ExpeditionResultInterface>({
      query: gql`
        query GetExpeditions($searchExpeditionQuery: SearchExpeditionQuery) {
          getExpeditions(searchExpeditionQuery: $searchExpeditionQuery) {
            expeditionList {
              codenv
              codorg
              codapp
              codcom
              codfic
              percod
              codsit
              percod
              codprd
              dfiexp
              refimp
              numcom
              pagfic
              codcli
              libfic
            }
            message
          }
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      variables: {
        searchExpeditionQuery: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getAllSelectConfig() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allOrganismes {
            code
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
