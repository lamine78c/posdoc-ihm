import { Injectable } from '@angular/core';
import { GetPublicationInterface } from '@app/models/admin/help/help';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideHelpService {
  constructor(private apollo: Apollo) {}

  public getPublicationByPath(path: string) {
    return this.apollo.watchQuery<GetPublicationInterface>({
      query: gql`
        query GetPublication($path: String!) {
          getPublication(path: $path) {
            id
            path
            message
            state
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        path: path,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
