import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideColimpService {
  constructor(private apollo: Apollo) {}

  public getAllColimps() {
    return this.apollo.watchQuery({
      query: gql`
        query GetColimps {
          allColimps {
            typcol
            libcol
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
