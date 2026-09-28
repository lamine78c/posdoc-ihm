import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { DetailsGeneralitesInterface } from '@app/models/supervision/production/details/generalites-interface';

@Injectable({
  providedIn: 'root',
})
export class ApiGeneralitesService {
  constructor(private apollo: Apollo) {}

  getDetailsGeneralites(paramData: OngletsParamDataModel) {
    return this.apollo.watchQuery<DetailsGeneralitesInterface>({
      query: gql`
        query getDetailsGeneralites($paramData: OngletsParamDataInput!) {
          getDetailsGeneralites(paramData: $paramData) {
            libelle
            arefec
            typref
            appsta
            appinf
            dapplc
            dappld
            dapplt
            dappls
            dapplh
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
