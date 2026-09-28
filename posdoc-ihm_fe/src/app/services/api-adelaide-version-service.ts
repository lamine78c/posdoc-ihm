import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideVersionService {
  constructor(private apollo: Apollo) {}

  public getVersion() {
    return this.apollo.watchQuery({
      query: gql`
        query getVersion {
          getVersion
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getVersionAdelaide() {
    return this.apollo.watchQuery({
      query: gql`
        query getVersionAdelaide {
          getVersionAdelaide
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
