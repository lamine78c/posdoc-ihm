import { Injectable } from '@angular/core';
import { Commande, PreselectedCommandeDTOInterface } from '@app/models/commande';
import { Apollo, gql } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client/core';
import { CodLibCommandeResultInterface, CommandeFilters } from '@app/models/suivi/commande.model';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideCommandeService {
  constructor(private apollo: Apollo) {}

  getCommandesByEnvsOrgsApps(codenvs: string[], codorgs: string[], codapp: string) {
    return this.apollo.watchQuery({
      query: gql`
        query GetCommandesByEnvsOrgsApps($codenvs: [String], $codorgs: [String], $codapp: String) {
          getCommandesByEnvsOrgsApps(codenvs: $codenvs, codorgs: $codorgs, codapp: $codapp) {
            code
            libelle
            codenv
            codorg
            codapp
            codreg
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      variables: {
        codenvs: codenvs,
        codorgs: codorgs,
        codapp: codapp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctApplications() {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctApplications {
          getDistinctApplications
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEnvsByApp(codapp: string) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctEnvsByApp($codapp: String) {
          getDistinctEnvsByApp(codapp: $codapp)
        }
      `,
      variables: {
        codapp: codapp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctCommByAppEnv(codapp: string, codenvs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctCommByAppEnv($codapp: String, $codenvs: [String]) {
          getDistinctCommByAppEnv(codapp: $codapp, codenvs: $codenvs)
        }
      `,
      variables: {
        codapp: codapp,
        codenvs: codenvs,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctOrg(codeEnv?: string[], codeApp?: string, codeCom?: string, codeFic?: string) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctOrg($codeEnv: [String], $codeApp: String, $codeCom: String, $codeFic: String) {
          getDistinctOrg(codeEnv: $codeEnv, codeApp: $codeApp, codeCom: $codeCom, codeFic: $codeFic)
        }
      `,
      variables: {
        codeEnv: codeEnv,
        codeApp: codeApp,
        codeCom: codeCom,
        codeFic: codeFic,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getCommandesByApp(codenv?: string, codesOrg?: string[], codesApp?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetCommandesByApp($codenv: String, $codesOrg: [String], $codesApp: [String]) {
          getCommandesByApp(codenv: $codenv, codesOrg: $codesOrg, codesApp: $codesApp) {
            code
            libelle
            codenv
            codorg
            codapp
            codreg
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      variables: {
        codenv: codenv,
        codesOrg: codesOrg,
        codesApp: codesApp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public compareCommandes(codesEnv?: string[], codesOrg?: string[], codesApp?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query CompareCommandes($codesEnv: [String], $codesOrg: [String], $codesApp: [String]) {
          compareCommandes(codesEnv: $codesEnv, codesOrg: $codesOrg, codesApp: $codesApp) {
            application
            organisme
            codeReg
            sortHelper
            environnements
          }
        }
      `,
      variables: {
        codesEnv: codesEnv,
        codesOrg: codesOrg,
        codesApp: codesApp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createCommande(createCommande: Commande) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createCommande: CreateOrUpdateCommandeInput!) {
          createCommande(createCommande: $createCommande) {
            code
            libelle
            codenv
            codorg
            codapp
          }
        }
      `,
      variables: {
        createCommande: createCommande,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateCommande(updateCommande: Commande) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateCommande: CreateOrUpdateCommandeInput!) {
          updateCommande(updateCommande: $updateCommande) {
            code
            libelle
            codenv
            codorg
            codapp
          }
        }
      `,
      variables: {
        updateCommande: updateCommande,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteCommandes(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeleteCommandeInput]!) {
          deleteCommandes(deleteCommandes: { ids: $ids }) {
            ok
          }
        }
      `,
      variables: {
        ids: ids,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public createCommandes(commandes: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($commandes: [CreateOrUpdateCommandeInput]!) {
          createCommandes(createCommandes: { commandes: $commandes }) {
            code
            libelle
            codenv
            codorg
            codapp
          }
        }
      `,
      variables: {
        commandes: commandes,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getAPIsForAddCommande() {
    return this.apollo.watchQuery({
      query: gql`
        query APIsForAddCommande {
          allRegions {
            code
            libelle
          }
          allEnvironnementsInApplication {
            code
            libelle
          }
          allOrganismes {
            code
            libelle
            codeRegion
          }
          allApplications {
            code
            libelle
            codeOrganisation
            codeEnvironnement
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEnvsFromCommande() {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistinctEnvsFromCommande {
          getDistinctEnvsFromCommande
        }
      `,
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctOrgsByEnvs(codenvs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistOrgByEnvFromCommande($codenvs: [String]) {
          getDistOrgByEnvFromCommande(codenvs: $codenvs)
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      variables: {
        codenvs: codenvs,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistOrgsByEnvApp(codenvs: string[], codapps: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistOrgByEnvsAndAppsFromCommande($codenvs: [String], $codapps: [String]) {
          getDistOrgByEnvsAndAppsFromCommande(codenvs: $codenvs, codapps: $codapps)
        }
      `,
      variables: {
        codenvs: codenvs,
        codapps: codapps,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistAppsByEnvOrg(codenvs: string[], codorgs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistAppByEnvOrgFromCommande($codenvs: [String], $codorgs: [String]) {
          getDistAppByEnvOrgFromCommande(codenvs: $codenvs, codorgs: $codorgs)
        }
      `,
      variables: {
        codenvs: codenvs,
        codorgs: codorgs,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistAppsByEnvsFromCommande(codenvs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistAppByEnvsFromCommande($codenvs: [String]) {
          getDistAppByEnvsFromCommande(codenvs: $codenvs)
        }
      `,
      variables: {
        codenvs: codenvs,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getPreselectedData(
    codenvs: string[],
    codorgs: string[],
    codapp: string
  ): Observable<ApolloQueryResult<{ getPreselectedCommande: PreselectedCommandeDTOInterface }>> {
    return this.apollo.watchQuery<{ getPreselectedCommande: PreselectedCommandeDTOInterface }>({
      query: gql`
        query GetPreselectedCommande($codenvs: [String], $codorgs: [String], $codapp: String) {
          getPreselectedCommande(codenvs: $codenvs, codorgs: $codorgs, codapp: $codapp) {
            commandes {
              code
              libelle
              codenv
              codorg
              codapp
              codreg
              isNotAuthorisedToBeDeleted
            }
            message
          }
        }
      `,
      variables: {
        codenvs,
        codorgs,
        codapp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getAllCommandes() {
    return this.apollo.watchQuery({
      query: gql`
        query getAllCommandes {
          allCommandes {
            code
            libelle
            codenv
            codorg
            codapp
            codreg
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  /**
   * Récupère les commandes par environnement, organisme et application
   */
  getCodLibCommandeByEnvOrgApp(filters: CommandeFilters) {
    return this.apollo.watchQuery<CodLibCommandeResultInterface>({
      query: gql`
        query GetCodLibCommandeByEnvOrgApp($filters: CommandeFiltersInput!) {
          getCodLibCommandeByEnvOrgApp(filters: $filters) {
            code
            libelle
          }
        }
      `,
      variables: {
        filters: filters,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
