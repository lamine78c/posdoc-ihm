import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Reedition } from '@app/models/reedition';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideReeditionProduitService {
  constructor(private apollo: Apollo) {}

  public getDistinctEnvOrgAppFromGenfic() {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctEnvOrgAppFromGenfic {
          getDistinctEnvOrgAppFromGenfic {
            codenv
            codorg
            codapp
          }
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

  getPeriode(env: string, org: string[], app: string) {
    return this.apollo.watchQuery({
      query: gql`
        query getPeriodeFromGenfic($codenv: String, $codorg: [String], $codapp: String) {
          getPeriodeFromGenfic(codenv: $codenv, codorg: $codorg, codapp: $codapp)
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        codapp: app,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getCommande(env: any, org: any[], codapp: any, periode: any) {
    return this.apollo.watchQuery({
      query: gql`
        query GetCommandeFromGenficWithApp($codenv: String, $codorg: [String], $codapp: String, $periode: String) {
          getCommandeFromGenficWithApp(codenv: $codenv, codorg: $codorg, codapp: $codapp, periode: $periode)
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        codapp: codapp,
        periode: periode,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getFichier(env: any, org: any[], codapp: any, periode: any, commande: any) {
    return this.apollo.watchQuery({
      query: gql`
        query GetFichierFromGenficWithApp($codenv: String, $codorg: [String], $codapp: String, $periode: String, $commande: String) {
          getFichierFromGenficWithApp(codenv: $codenv, codorg: $codorg, codapp: $codapp, periode: $periode, commande: $commande)
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        codapp: codapp,
        periode: periode,
        commande: commande,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  searchReeditionPerProduit(env: string, org: string[], application: string, periode: string, commande: string, fichier: string) {
    return this.apollo.watchQuery({
      query: gql`
        query SearchReeditionPerProduit(
          $codenv: String
          $codorg: [String]
          $application: String
          $periode: String
          $codcom: String
          $codfic: String
        ) {
          searchReeditionPerProduit(
            codenv: $codenv
            codorg: $codorg
            application: $application
            periode: $periode
            codcom: $codcom
            codfic: $codfic
          ) {
            codcom
            codfic
            numcom
            refimp
            codprd
            libfic
            pagfic
            codgam
            codsit
            codres
            coddes
            nbrexe
            codorg
            percod
            reedit
          }
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        application: application,
        periode: periode,
        codcom: commande,
        codfic: fichier,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  reediter(reeditions: Reedition[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation Reediter($reeditions: [ReeditionInput]!) {
          reediter(reeditions: $reeditions) {
            codulo
            erreur
          }
        }
      `,
      variables: {
        reeditions: reeditions,
      },
      fetchPolicy: 'no-cache',
    });
  }
}
