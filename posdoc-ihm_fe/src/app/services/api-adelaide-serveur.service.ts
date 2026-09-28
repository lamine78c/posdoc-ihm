import { Injectable } from '@angular/core';
import { Serveur } from '@app/models/serveur';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideServeurService {
  constructor(private apollo: Apollo) {}

  public getServeur(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetServers($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          servers(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Server {
                code
                libelle
                systeme
                adresseIp
                teste
                actif
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

  public getAllServers() {
    return this.apollo.watchQuery({
      query: gql`
        query GetServers {
          allServers {
            code
            libelle
            systeme
            adresseIp
            teste
            actif
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createServer(createServer: Serveur) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createServer: CreateServerInput!) {
          createServer(createServer: $createServer) {
            code
            libelle
            systeme
            adresseIp
            teste
            actif
          }
        }
      `,
      variables: {
        createServer: createServer,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateServer(updateServer: Serveur) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateServer: UpdateServerInput!) {
          updateServer(updateServer: $updateServer) {
            code
            libelle
            systeme
            adresseIp
            teste
            actif
          }
        }
      `,
      variables: {
        updateServer: updateServer,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteServer(id: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($id: String!) {
          deleteServer(deleteServer: { id: $id }) {
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

  public deleteServers(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteServers(deleteServers: { ids: $ids }) {
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
