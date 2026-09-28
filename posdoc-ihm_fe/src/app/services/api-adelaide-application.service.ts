import { HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Application } from '@app/models/application';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

export const RETRY_COUNT = new HttpContextToken(() => 3);

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideApplicationService {
  constructor(private apollo: Apollo) {}

  public getAllApplications() {
    return this.apollo.watchQuery({
      query: gql`
        query GetAllApplications {
          allApplications {
            code
            libelle
            codeOrganisation
            codeEnvironnement
            codeSystem
            codeGroupe
            lotNumber
            typeRefection
            isNotAuthorisedToBeDeleted
          }
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
      context: { test: new HttpContext().set(RETRY_COUNT, 5) },
      // Apollo Client v4 et Apollo Angular 4+, metadata a été retiré
      // metadata: new HttpContext().set(RETRY_COUNT, 5),
    }).valueChanges;
  }

  getConfigData() {
    return this.apollo.watchQuery({
      query: gql`
        query GetConfigData {
          allEnvironnements {
            code
          }
          allOrganismes {
            code
            codeRegion
          }
          allRegions {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getApplicationsByEnvs(codesEnv?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetApplicationsByEnvs($codesEnv: [String]) {
          getApplicationsByEnvs(codesEnv: $codesEnv) {
            code
            libelle
            codeOrganisation
            codeEnvironnement
            codeSystem
            codeGroupe
            lotNumber
            typeRefection
          }
        }
      `,
      variables: {
        codesEnv: codesEnv,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
  public getApplicationsRessourceByEnvAndOrg(codeEnv?: string, codesOrg?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetApplicationsRessourceByEnvAndOrg($codeEnv: String, $codesOrg: [String]) {
          allApplicationsRess(codeEnv: $codeEnv, codesOrg: $codesOrg) {
            code
            libelle
            codeOrganisation
            codeEnvironnement
            codeSystem
            codeGroupe
            lotNumber
            typeRefection
            codeRessource
            codeGamme
            codeServeur
          }
        }
      `,
      variables: {
        codeEnv: codeEnv,
        codesOrg: codesOrg,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getGroupes(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getGroupes($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          groupes(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Groupe {
                code
                libelle
                refEnvironnement
                refOrganisme
                refApplication
                typeGroupe
              }
            }
          }
        }
      `,
      variables: {
        page: page,
        size: size,
        sort: sort,
        criteria: criteria,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createApplication(createApplication: Application) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createApplication: CreateOrUpdateApplicationInput!) {
          createApplication(createApplication: $createApplication) {
            code
            libelle
            codeOrganisation
            codeEnvironnement
            codeSystem
            codeGroupe
            lotNumber
            typeRefection
          }
        }
      `,
      variables: {
        createApplication: createApplication,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateApplication(updateApplication: Application) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateApplication: CreateOrUpdateApplicationInput!) {
          updateApplication(updateApplication: $updateApplication) {
            code
            libelle
            codeOrganisation
            codeEnvironnement
            codeSystem
            codeGroupe
            lotNumber
            typeRefection
          }
        }
      `,
      variables: {
        updateApplication: updateApplication,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteApplications(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeleteApplicationInput]!) {
          deleteApplications(deleteApplications: { ids: $ids }) {
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
}
