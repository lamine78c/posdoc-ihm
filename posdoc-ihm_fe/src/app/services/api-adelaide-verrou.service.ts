import { Injectable } from '@angular/core';
import { Verrou } from '@app/models/verrou';
import { Apollo, gql } from 'apollo-angular';
import { Creteria } from '../models/utils/creteria';
import { SortInput } from '../models/utils/sortInput';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideVerrouService {
  constructor(private apollo: Apollo) {}

  public getVerrou(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetVerrous($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          verrous(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Verrou {
                code
                libelle
                maxExecution
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

  public getAllVerrous() {
    return this.apollo.watchQuery({
      query: gql`
        query GetVerrous {
          allVerrous {
            code
            libelle
            maxExecution
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public deleteVerrous(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteVerrous(deleteVerrous: { ids: $ids }) {
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

  public createVerrou(createVerrou: Verrou) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createVerrou: CreateOrUpdateVerrouInput!) {
          createVerrou(createVerrou: $createVerrou) {
            code
            libelle
            maxExecution
          }
        }
      `,
      variables: {
        createVerrou: createVerrou,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateVerrou(updateVerrou: Verrou) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateVerrou: CreateOrUpdateVerrouInput!) {
          updateVerrou(updateVerrou: $updateVerrou) {
            code
            libelle
            maxExecution
          }
        }
      `,
      variables: {
        updateVerrou: updateVerrou,
      },
      fetchPolicy: 'no-cache',
    });
  }
}
