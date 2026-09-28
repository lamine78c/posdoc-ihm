import { Injectable } from '@angular/core';
import { CreateEchantillonResultInterface, Echantillon, UpdateEchantillonResultInterface } from '@app/models/echantillon';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideEchantillonService {
  constructor(private apollo: Apollo) {}

  public getEchantillon(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getParametresEchantillon($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          parametresEchantillon(
            queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }
          ) {
            totalElement
            totalPages
            elements {
              ... on ParametreEchantillon {
                reference
                type
                nombreLots
                nombrePages
                random
                formule
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

  public getAllEchantillons() {
    return this.apollo.watchQuery({
      query: gql`
        query GetParametresEchantillon {
          allParametresEchantillon {
            reference
            type
            nombreLots
            nombrePages
            random
            formule
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
  public createParametreEchantillon(createParametreEchantillon: Echantillon) {
    return this.apollo.mutate<CreateEchantillonResultInterface>({
      mutation: gql`
        mutation create($createParametreEchantillon: CreateOrUpdateParametreEchantillonInput!) {
          createParametreEchantillon(createParametreEchantillon: $createParametreEchantillon) {
            reference
            type
            nombreLots
            nombrePages
            random
            formule
          }
        }
      `,
      variables: {
        createParametreEchantillon: createParametreEchantillon,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateParametreEchantillon(updateParametreEchantillon: Echantillon) {
    return this.apollo.mutate<UpdateEchantillonResultInterface>({
      mutation: gql`
        mutation update($updateParametreEchantillon: CreateOrUpdateParametreEchantillonInput!) {
          updateParametreEchantillon(updateParametreEchantillon: $updateParametreEchantillon) {
            reference
            type
            nombreLots
            nombrePages
            random
            formule
          }
        }
      `,
      variables: {
        updateParametreEchantillon: updateParametreEchantillon,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteEchantillons(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteParametreEchantillons(deleteParametreEchantillons: { ids: $ids }) {
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
