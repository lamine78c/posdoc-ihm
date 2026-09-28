import { Injectable } from '@angular/core';
import { ParamDistri } from '@app/models/param-distri';
import { Apollo, gql } from 'apollo-angular';
import { Creteria } from '../models/utils/creteria';
import { SortInput } from '../models/utils/sortInput';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideParamDistriService {
  constructor(private apollo: Apollo) {}

  public getParamDistri(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query parametresDistribution($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          parametresDistribution(
            queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }
          ) {
            totalElement
            totalPages
            elements {
              ... on ParametreDistribution {
                reference
                libelle
                logicielDistribution
                commandeDistribution
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

  public getAllParamDistri() {
    return this.apollo.watchQuery({
      query: gql`
        query parametresDistribution {
          allParametresDistribution {
            reference
            libelle
            logicielDistribution
            commandeDistribution
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createParamDistri(createParametreDistribution: ParamDistri) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createParametreDistribution: CreateOrUpdateParametreDistributionInput!) {
          createParametreDistribution(createParametreDistribution: $createParametreDistribution) {
            reference
            libelle
            logicielDistribution
            commandeDistribution
          }
        }
      `,
      variables: {
        createParametreDistribution: createParametreDistribution,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateParamDistri(updateParametreDistribution: ParamDistri) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateParametreDistribution: CreateOrUpdateParametreDistributionInput!) {
          updateParametreDistribution(updateParametreDistribution: $updateParametreDistribution) {
            reference
            libelle
            logicielDistribution
            commandeDistribution
          }
        }
      `,
      variables: {
        updateParametreDistribution: updateParametreDistribution,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteParamDistris(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteParametreDistributions(deleteParametreDistributions: { ids: $ids }) {
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
