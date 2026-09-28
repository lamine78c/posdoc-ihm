import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideComposService {
  constructor(private apollo: Apollo) {}

  public getAllComposs() {
    return this.apollo.watchQuery({
      query: gql`
        query GetComposs {
          allComposs {
            typmef
            libmef
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
