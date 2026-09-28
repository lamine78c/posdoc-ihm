import { Injectable } from '@angular/core';
import { Support } from '@app/models/support';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideSupportService {
  constructor(private apollo: Apollo) {}

  public getSupport(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getSupports($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          supports(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Support {
                type
                libelle
                poids
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

  public getAllSupports() {
    return this.apollo.watchQuery({
      query: gql`
        query GetSupports {
          allSupports {
            type
            libelle
            poids
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createSupport(createSupport: Support) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createSupport: CreateOrUpdateSupportInput!) {
          createSupport(createSupport: $createSupport) {
            type
            libelle
            poids
          }
        }
      `,
      variables: {
        createSupport: createSupport,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateSupport(updateSupport: Support) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateSupport: CreateOrUpdateSupportInput!) {
          updateSupport(updateSupport: $updateSupport) {
            type
            libelle
            poids
          }
        }
      `,
      variables: {
        updateSupport: updateSupport,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteSupports(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteSupports(deleteSupports: { ids: $ids }) {
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
