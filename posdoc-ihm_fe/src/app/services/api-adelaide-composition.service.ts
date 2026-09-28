import { Injectable } from '@angular/core';
import { Composition } from '@app/models/composition';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideCompositionService {
  constructor(private apollo: Apollo) {}

  public getComposition(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getCompositions($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          compositions(
            queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }
          ) {
            totalElement
            totalPages
            elements {
              ... on Composition {
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

  public getAllCompositions() {
    return this.apollo.watchQuery({
      query: gql`
        query GetCompositions {
          allCompositions {
            code
            libelle
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createComposition(createComposition: Composition) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createComposition: CreateCompositionInput!) {
          createComposition(createComposition: $createComposition) {
            code
            libelle
          }
        }
      `,
      variables: {
        createComposition: createComposition,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateComposition(updateComposition: Composition) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateComposition: UpdateCompositionInput!) {
          updateComposition(updateComposition: $updateComposition) {
            code
            libelle
          }
        }
      `,
      variables: {
        updateComposition: updateComposition,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteCompositions(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteCompositions(deleteCompositions: { ids: $ids }) {
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
