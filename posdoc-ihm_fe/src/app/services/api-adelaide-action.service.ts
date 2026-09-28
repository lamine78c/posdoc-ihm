import { Injectable } from '@angular/core';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import {
  FindDistinctEntityResultInterface,
  FindDistinctUserResultInterface,
  SearchHistoryByCoduloResultInterface,
  SearchHistoryByQuery,
  SearchHistoryByQueryResultInterface,
} from '@app/supervision/actions/action/model/search-history-by-query';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideActionService {
  constructor(private apollo: Apollo) {}

  public searchHistoryByCodulo(codulo: number) {
    return this.apollo.watchQuery<SearchHistoryByCoduloResultInterface>({
      query: gql`
        query FindHistoryByCodulo($codulo: Int!) {
          findHistoryByCodulo(codulo: $codulo) {
            id
            station
            utilisateur
            insertionDate
            actionUtilisateur
            condition
            entite
            entree
            sortie
          }
        }
      `,
      variables: {
        codulo: codulo,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctUser() {
    return this.apollo.watchQuery<FindDistinctUserResultInterface>({
      query: gql`
        query GetActions {
          findDistinctUser
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEntity() {
    return this.apollo.watchQuery<FindDistinctEntityResultInterface>({
      query: gql`
        query GetActions {
          findDistinctEntity
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchHistoryByQuery(query: SearchHistoryByQuery) {
    return this.apollo.watchQuery<SearchHistoryByQueryResultInterface>({
      query: gql`
        query findHistoryByQuery($query: FindHistoryByQuery) {
          findHistoryByQuery(query: $query) {
            id
            station
            utilisateur
            insertionDate
            actionUtilisateur
            condition
            entite
            entree
            sortie
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getActions(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
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

  public getAllActions() {
    return this.apollo.watchQuery({
      query: gql`
        query GetActions {
          allHistory {
            id
            station
            utilisateur
            insertionDate
            actionUtilisateur
            condition
            entite
            entree
            sortie
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createClient(createClient: any) {
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

  updateClient(updateClient: any) {
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

  public createClients(clients: any[]) {
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

  public updateClients(clients: any[]) {
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
