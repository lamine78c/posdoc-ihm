import { Injectable } from '@angular/core';
import { GetPathCompletByPathInterface } from '@app/models/admin/help/help';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideHabilitationService {
  constructor(private apollo: Apollo) {}

  public getHabilitation() {
    return this.apollo.watchQuery({
      query: gql`
        query GetHabilitations {
          allHabilitations {
            id
            parentId
            habilitationType
            identite
            ordre
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getPathCompletByPath(path: string) {
    return this.apollo.watchQuery<GetPathCompletByPathInterface>({
      query: gql`
        query getPathCompletByPath($path: String!) {
          getPathCompletByPath(path: $path)
        }
      `,
      variables: {
        path: path,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
