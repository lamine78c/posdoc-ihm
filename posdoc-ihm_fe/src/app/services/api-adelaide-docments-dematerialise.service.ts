import { Injectable } from '@angular/core';
import { DocDemOccurrenceApplicationInterface } from '@app/suivi/production/modal/fichier-details/models/doc-dem-occurrence-application-interface';
import { ParamsPopupFichiers } from '@app/suivi/production/modal/fichier-details/models/params-fichiers-interface';
import {
  GetAllOrganismesInterface,
  GetDistinctOrgAppComFromGendocInterface,
  GetDocsDematerialisesInterface,
  SearchDocDematerialiseInterface,
} from '@app/supervision/document-dematerialise/consultation/model/search-document-dematerialise-interface';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideDocumentDematerialiseService {
  constructor(private apollo: Apollo) {}

  public getDocsDematerialises(query: SearchDocDematerialiseInterface) {
    return this.apollo.watchQuery<GetDocsDematerialisesInterface>({
      query: gql`
        query getDocsDematerialises($query: SearchDocDemInput) {
          getDocsDematerialises(query: $query) {
            datdem
            numdem
            codenv
            codorg
            percod
            codapp
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
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getAllSelectConfig() {
    return this.apollo.watchQuery<GetAllOrganismesInterface>({
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

  getDocDematerialisesOccurrenceApplication(query: ParamsPopupFichiers) {
    return this.apollo.watchQuery<DocDemOccurrenceApplicationInterface>({
      query: gql`
        query getDocDemOccurrenceApplication($query: SearchDocDemOccurrenceApplicationQuery!) {
          getDocDemOccurrenceApplication(query: $query) {
            datdem
            numdem
            coddoc
            refdem
            typact
            ddodeb
            ddofin
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDocumentDematerialiseSearchConfig() {
    return this.apollo.watchQuery<GetDistinctOrgAppComFromGendocInterface>({
      query: gql`
        query getDocumentDematerialiseSearchConfig {
          getDistinctOrgAppComFromGendoc {
            codorg
            codapp
            codcom
          }
          allOrganismes {
            code
            codeRegion
          }
          findComDocLibFicInFichier {
            codcom
            coddoc
            libfic
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
