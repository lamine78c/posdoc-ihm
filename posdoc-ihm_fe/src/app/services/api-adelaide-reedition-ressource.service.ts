import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Reedition } from '@app/models/reedition';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideReeditionRessourceService {
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

  searchReeditionPerRessurce(env: string, org: string[], app: string, periode: string) {
    return this.apollo.watchQuery({
      query: gql`
        query searchReeditionPerRessurce($codenv: String, $codorg: [String], $codapp: String, $periode: String) {
          searchReeditionPerRessurce(codenv: $codenv, codorg: $codorg, codapp: $codapp, periode: $periode) {
            percod
            codres
            codsit
            codgam
            codcom
            codfic
            numcom
            codprd
            refimp
            codorg
            pagFic
            nbrexe
            libfic
            coddes
            reedit
          }
        }
      `,
      variables: {
        codenv: env,
        codorg: org,
        codapp: app,
        periode: periode,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public reediter(reeditions: Reedition[]) {
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

  public checkIfGenEtpExists(query: any) {
    return this.apollo.watchQuery({
      query: gql`
        query checkIfGenEtpExists($query: GenEtpExistsQuery) {
          checkIfGenEtpExists(query: $query)
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
