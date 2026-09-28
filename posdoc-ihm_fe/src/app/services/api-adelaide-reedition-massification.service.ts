import { Injectable } from '@angular/core';
import { SearchReeditionParMassificationQuery } from '@app/models/payload/search-reedition-massification';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideReeditionMassificationService {
  constructor(private apollo: Apollo) {}

  getDistinctEnvOrgFromGenfic() {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctEnvOrgFromGenfic {
          getDistinctEnvOrgFromGenfic {
            codenv
            codorg
          }
          getOrganismeMassification
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getCommande(env: any, org: any[], periode: any) {
    return this.apollo.watchQuery({
      query: gql`
        query getCommandeFromGenfic($codenv: String, $codorg: [String], $periode: String) {
          getCommandeFromGenfic(codenv: $codenv, codorg: $codorg, periode: $periode)
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        periode: periode,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getFichier(env: any, org: any[], periode: any, commande: any) {
    return this.apollo.watchQuery({
      query: gql`
        query getFichierFromGenfic($codenv: String, $codorg: [String], $periode: String, $commande: String) {
          getFichierFromGenfic(codenv: $codenv, codorg: $codorg, periode: $periode, commande: $commande)
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        periode: periode,
        commande: commande,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  searchReeditionParMassification(searchReeditionParMassificationQuery: SearchReeditionParMassificationQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query searchReeditionParMassification($searchReeditionParMassificationQuery: SearchReeditionParMassificationQuery!) {
          searchReeditionParMassification(searchReeditionParMassificationQuery: $searchReeditionParMassificationQuery) {
            codcomOld
            codficOld
            numcomOld
            pagficOld
            plificOld
            libficOld
            codenv
            codorg
            codapp
            percod
            codcom
            codfic
            numcom
            pagfic
            plific
            libfic
            codcli
            codsit
            codres
            coddes
            nbrexe
          }
        }
      `,
      variables: {
        searchReeditionParMassificationQuery: searchReeditionParMassificationQuery,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
