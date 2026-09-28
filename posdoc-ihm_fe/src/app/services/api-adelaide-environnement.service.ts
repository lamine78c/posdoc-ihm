import { Injectable } from '@angular/core';

import { Apollo, gql } from 'apollo-angular';

import { Environnement } from '../models/environnement';
import { Creteria } from '../models/utils/creteria';
import { SortInput } from '../models/utils/sortInput';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideEnvironnementService {
  constructor(private apollo: Apollo) {}

  public getEnvironnement(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetEnvironnements($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          environnements(
            queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }
          ) {
            totalElement
            totalPages
            elements {
              ... on Environnement {
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

  public getAllEnvironnementInFichier() {
    return this.apollo.watchQuery({
      query: gql`
        query GetEnvironnementsInFichier {
          allEnvironnementsInFichier {
            code
            libelle
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllEnvironnement(isSpinner: string = 'false') {
    return this.apollo.watchQuery({
      query: gql`
        query GetEnvironnements {
          allEnvironnements {
            code
            libelle
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllEnvironnementInApplication() {
    return this.apollo.watchQuery({
      query: gql`
        query GetEnvironnementsInApplication {
          allEnvironnementsInApplication {
            code
            libelle
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createEnvironnement(createEnvironnement: Environnement) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createEnvironnement: CreateEnvironnementInput!) {
          createEnvironnement(createEnvironnement: $createEnvironnement) {
            code
            libelle
          }
        }
      `,
      variables: {
        createEnvironnement: createEnvironnement,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateEnvironnement(updateEnvironnement: Environnement) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateEnvironnement: UpdateEnvironnementInput!) {
          updateEnvironnement(updateEnvironnement: $updateEnvironnement) {
            code
            libelle
          }
        }
      `,
      variables: {
        updateEnvironnement: updateEnvironnement,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteEnvironnement(id: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($id: String!) {
          deleteEnvironnement(deleteEnvironnement: { id: $id }) {
            ok
          }
        }
      `,
      variables: {
        id: id,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteEnvironnements(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteEnvironnements(deleteEnvironnements: { ids: $ids }) {
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

  public createEnvironnements(environnements: Environnement[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($environnements: [CreateOrUpdateEnvironnementInput]!) {
          createEnvironnements(createEnvironnements: { environnements: $environnements }) {
            code
            libelle
          }
        }
      `,
      variables: {
        environnements: environnements,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateEnvironnements(environnements: Environnement[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($environnements: [CreateOrUpdateEnvironnementInput]!) {
          updateEnvironnements(updateEnvironnements: { environnements: $environnements }) {
            code
            libelle
          }
        }
      `,
      variables: {
        environnements: environnements,
      },
      fetchPolicy: 'no-cache',
    });
  }
}
