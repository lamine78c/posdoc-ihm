import { Injectable } from '@angular/core';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideLotRefService {
  constructor(private apollo: Apollo) {}

  public getLotsRef(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getLotsRef($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          lotsRef(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on LotRef {
                refEnvironnement
                refOrganisation
                refApplication
                lotNumber
                type
                libelle
                lotApplicatif
                statut
                dateCreation
                dateCloture
                dateActivation
                dateInterruption
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
}
