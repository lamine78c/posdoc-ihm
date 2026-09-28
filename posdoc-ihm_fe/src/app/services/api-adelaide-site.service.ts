import { Injectable } from '@angular/core';
import { Site } from '@app/models/site';
import { Apollo, gql } from 'apollo-angular';
import { Creteria } from '../models/utils/creteria';
import { SortInput } from '../models/utils/sortInput';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideSiteService {
  constructor(private apollo: Apollo) {}

  public getSite(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetSites($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          sitesCNP(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on SiteCNP {
                code
                host
                ressourceDelestage
                organismeMassification
                username
                password
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

  public getAllSites() {
    return this.apollo.watchQuery({
      query: gql`
        query GetSitesCNP {
          allSitesCNP {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllSitesCNP() {
    return this.apollo.watchQuery({
      query: gql`
        query GetSitesCNP {
          allSitesCNP {
            code
            host
            username
            password
            ressourceDelestage
            organismeMassification
            isNotAuthorisedToBeDeleted
          }
          allOrganismes {
            code
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createSite(createSiteCNP: Site) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createSiteCNP: CreateOrUpdateSiteCNPInput!) {
          createSiteCNP(createSiteCNP: $createSiteCNP) {
            code
            host
            ressourceDelestage
            organismeMassification
            username
            password
          }
        }
      `,
      variables: {
        createSiteCNP: createSiteCNP,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateSite(updateSiteCNP: Site) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateSiteCNP: CreateOrUpdateSiteCNPInput!) {
          updateSiteCNP(updateSiteCNP: $updateSiteCNP) {
            code
            host
            ressourceDelestage
            organismeMassification
            username
            password
          }
        }
      `,
      variables: {
        updateSiteCNP: updateSiteCNP,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteSites(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteSitesCNP(deleteSitesCNP: { ids: $ids }) {
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

  getAllSelectConfig() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allRessources {
            code: codeRessource
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
