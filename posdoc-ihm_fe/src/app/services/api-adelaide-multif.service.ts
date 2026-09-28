import { Injectable } from '@angular/core';
import { Multif } from '@app/models/multif';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideMultifService {
  constructor(private apollo: Apollo) {}

  public getMultif(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getMultifs($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          multifs(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Multif {
                code
                libelle
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

  public getAllMultifs() {
    return this.apollo.watchQuery({
      query: gql`
        query GetMultifs {
          allMultifs {
            code
            libelle
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
  public createMultif(createMultif: Multif) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createMultif: CreateOrUpdateMultifInput!) {
          createMultif(createMultif: $createMultif) {
            code
            libelle
          }
        }
      `,
      variables: {
        createMultif: createMultif,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateMultif(updateMultif: Multif) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateMultif: CreateOrUpdateMultifInput!) {
          updateMultif(updateMultif: $updateMultif) {
            code
            libelle
          }
        }
      `,
      variables: {
        updateMultif: updateMultif,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteMultifs(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteMultifs(deleteMultifs: { ids: $ids }) {
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
