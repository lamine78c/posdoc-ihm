import { Injectable } from '@angular/core';
import { ParamAdelaide } from '@app/models/param-adelaide';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

export interface ParamDocDematerialiseInterface {
  getValueDocDematerialises: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideParametreService {
  constructor(private apollo: Apollo) {}

  public getParamsAdelaide(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetParametres($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          parametres(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Parametre {
                code
                value
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

  public getAllParamsAdelaide() {
    return this.apollo.watchQuery({
      query: gql`
        query GetParametres {
          allParametres {
            code
            value
            libelle
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createParamAdelaide(createParametre: ParamAdelaide) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createParametre: CreateOrUpdateParametreInput!) {
          createParametre(createParametre: $createParametre) {
            code
            value
            libelle
          }
        }
      `,
      variables: {
        createParametre: createParametre,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateParamAdelaide(updateParametre: ParamAdelaide) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateParametre: CreateOrUpdateParametreInput!) {
          updateParametre(updateParametre: $updateParametre) {
            code
            value
            libelle
          }
        }
      `,
      variables: {
        updateParametre: updateParametre,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteParamAdelaide(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteParametres(deleteParametres: { ids: $ids }) {
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

  public getParamsForMasappMasgamMasuti() {
    return this.apollo.watchQuery({
      query: gql`
        query GetParamsForMasappMasgamMasuti {
          getParamsForMasappMasgamMasuti {
            code
            value
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getCodeOrgOGUR() {
    return this.apollo.watchQuery({
      query: gql`
        query getCodeOrgOGUR {
          getCodeOrgOGUR
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getValueDocDematerialises() {
    return this.apollo.watchQuery<ParamDocDematerialiseInterface>({
      query: gql`
        query getValueDocDematerialises {
          getValueDocDematerialises
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
