import { Injectable } from '@angular/core';
import { ParametreEdition } from '@app/models/parametreEdition';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideReeditionService {
  constructor(private apollo: Apollo) {}

  public getReedition(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getReeditions($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          parametresEdition(
            queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }
          ) {
            totalElement
            totalPages
            elements {
              ... on ParametreEdition {
                reference
                type
                libelle
                lineNumber
                columnNumber
                length
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
  public getAllParametresEdition() {
    return this.apollo.watchQuery({
      query: gql`
        query GetParametresEdition {
          allParametresEdition {
            reference
            type
            libelle
            lineNumber
            columnNumber
            length
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createParametreEdition(createParametreEdition: ParametreEdition) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createParametreEdition: CreateOrUpdateParametreEditionInput!) {
          createParametreEdition(createParametreEdition: $createParametreEdition) {
            reference
            type
            libelle
            lineNumber
            columnNumber
            length
          }
        }
      `,
      variables: {
        createParametreEdition: createParametreEdition,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateParametreEdition(updateParametreEdition: ParametreEdition) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateParametreEdition: CreateOrUpdateParametreEditionInput!) {
          updateParametreEdition(updateParametreEdition: $updateParametreEdition) {
            reference
            type
            libelle
            lineNumber
            columnNumber
            length
          }
        }
      `,
      variables: {
        updateParametreEdition: updateParametreEdition,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteParametresEdition(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteParametresEdition(deleteParametresEdition: { ids: $ids }) {
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
          allFormats {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
