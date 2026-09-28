import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Creteria } from '../models/utils/creteria';
import { SortInput } from '../models/utils/sortInput';
import { gql } from 'apollo-angular';
import { Gamme } from '@app/models/Gamme';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideGammeService {
  constructor(private apollo: Apollo) {}

  public getAllGammes() {
    return this.apollo.watchQuery({
      query: gql`
        query GetGammes {
          allGammes {
            code
            libelle
            codeVerrou
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createGamme(createGamme: Gamme) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createGamme: CreateGammeInput!) {
          createGamme(createGamme: $createGamme) {
            code
            libelle
            codeVerrou
          }
        }
      `,
      variables: {
        createGamme: createGamme,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateGamme(updateGamme: Gamme) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateGamme: UpdateGammeInput!) {
          updateGamme(updateGamme: $updateGamme) {
            code
            libelle
            codeVerrou
          }
        }
      `,
      variables: {
        updateGamme: updateGamme,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteGammes(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteGammes(deleteGammes: { ids: $ids }) {
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

  getAllSelectConfig() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allVerrous {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
    }).valueChanges;
  }
}
