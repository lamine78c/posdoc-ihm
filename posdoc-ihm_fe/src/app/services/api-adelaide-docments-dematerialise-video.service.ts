import { Injectable } from '@angular/core';
import { SearchDocVideoQuery } from '@app/models/payload/search-doc-dematerialise-video';
import { SearchDocVideoInfoDetailQuery } from '@app/models/payload/search-doc-dematerialise-video-information-detail';
import { DetailInformationDocumentsVideoInterface } from '@app/models/supervision/production/details/documents-video-infomations-detail';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideDocumentDematerialiseVideoService {
  constructor(private apollo: Apollo) {}

  public getDocsDematerialisesVideo(query: SearchDocVideoQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getDocsDematerialisesVideo($searchDocVideoQuery: SearchDocVideoQuery) {
          getDocsDematerialisesVideo(searchDocVideoQuery: $searchDocVideoQuery) {
            datdem
            numdem
            coddoc
            refdem
            typact
            imprim
            docsta
          }
        }
      `,
      variables: {
        searchDocVideoQuery: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
  public getDocsDematerialisesVideoInfoDetail(query: SearchDocVideoInfoDetailQuery) {
    return this.apollo.watchQuery<DetailInformationDocumentsVideoInterface>({
      query: gql`
        query getDocsDematerialisesVideoInfoDetail($searchDocVideoInfoDetailQuery: SearchDocVideoInfoDetailQuery) {
          getDocsDematerialisesVideoInfoDetail(searchDocVideoInfoDetailQuery: $searchDocVideoInfoDetailQuery) {
            codorg
            codapp
            percod
            codenv
            codcom
            codfic
            coddoc
            refdem
            typact
            imprim
            docsta
            docinf
            ddodeb
            ddofin
            ddosus
            tpscom
            libinf
            codeSiteDematerialisation
          }
        }
      `,
      variables: {
        searchDocVideoInfoDetailQuery: query,
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
