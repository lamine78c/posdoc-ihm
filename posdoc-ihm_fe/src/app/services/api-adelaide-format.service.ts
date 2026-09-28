import { Injectable } from '@angular/core';
import { Format } from '@app/models/format';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideFormatService {
  constructor(private apollo: Apollo) {}

  public getFormat(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getFormats($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          formats(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Format {
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

  public getFormats() {
    return this.apollo.watchQuery({
      query: gql`
        query GetFormats {
          allFormats {
            code
            libelle
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createFormat(createFormat: Format) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createFormat: CreateOrUpdateFormatInput!) {
          createFormat(createFormat: $createFormat) {
            code
            libelle
          }
        }
      `,
      variables: {
        createFormat: createFormat,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateFormat(updateFormat: Format) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateFormat: CreateOrUpdateFormatInput!) {
          updateFormat(updateFormat: $updateFormat) {
            code
            libelle
          }
        }
      `,
      variables: {
        updateFormat: updateFormat,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteFormats(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteFormats(deleteFormats: { ids: $ids }) {
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
