import { Injectable } from '@angular/core';
import { Client } from '@app/models/client';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideClientService {
  constructor(private apollo: Apollo) {}

  public getClient(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetClients($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          clients(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Client {
                code
                libelle
                codeAlliage
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

  public getAllClient() {
    return this.apollo.watchQuery({
      query: gql`
        query GetClients {
          allClients {
            code
            libelle
            codeAlliage
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createClient(createClient: Client) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createClient: CreateClientInput!) {
          createClient(createClient: $createClient) {
            code
            libelle
            codeAlliage
          }
        }
      `,
      variables: {
        createClient: createClient,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateClient(updateClient: Client) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateClient: UpdateClientInput!) {
          updateClient(updateClient: $updateClient) {
            code
            libelle
            codeAlliage
          }
        }
      `,
      variables: {
        updateClient: updateClient,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteClients(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteClients(deleteClients: { ids: $ids }) {
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

  public createClients(clients: Client[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($clients: [CreateOrUpdateClientInput]!) {
          createClients(createClients: { clients: $clients }) {
            code
            libelle
          }
        }
      `,
      variables: {
        clients: clients,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateClients(clients: Client[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($clients: [CreateOrUpdateClientInput]!) {
          updateClients(updateClients: { clients: $clients }) {
            code
            libelle
          }
        }
      `,
      variables: {
        clients: clients,
      },
      fetchPolicy: 'no-cache',
    });
  }
}
