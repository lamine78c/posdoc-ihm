import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {
  FindDistinctActionUtilogResultInterface,
  FindDistinctEntityUtilogResultInterface,
  FindDistinctUserUtilogResultInterface,
  SearchActionUtilisateurByQuery,
  SearchActionUtilisateurByQueryResultInterface,
} from '../model/search-action-utilisateur-by-query';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideActionUtilisateurService {
  constructor(private apollo: Apollo) {}

  public getDistinctAction() {
    return this.apollo.watchQuery<FindDistinctActionUtilogResultInterface>({
      query: gql`
        query GetActions {
          findDistinctActionUtilog
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEntity() {
    return this.apollo.watchQuery<FindDistinctEntityUtilogResultInterface>({
      query: gql`
        query GetFormId {
          findDistinctFormIdUtilog
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctUser() {
    return this.apollo.watchQuery<FindDistinctUserUtilogResultInterface>({
      query: gql`
        query GetUsers {
          findDistinctUserUtilog
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchActionUtilisateurByQuery(query: SearchActionUtilisateurByQuery) {
    return this.apollo.watchQuery<SearchActionUtilisateurByQueryResultInterface>({
      query: gql`
        query findUtiLogByQuery($query: FindUtiLogByQuery) {
          findUtiLogByQuery(query: $query) {
            codulo
            codsta
            codusr
            formid
            datulo
            action
            params
            result
            versio
            erreur
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
