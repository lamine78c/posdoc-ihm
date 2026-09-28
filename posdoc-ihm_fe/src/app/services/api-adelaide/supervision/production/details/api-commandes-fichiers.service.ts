import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';

import { DetailsCommandesFichiersInterface } from '@app/models/supervision/production/details/commandes-fichiers-intreface';

@Injectable({
  providedIn: 'root',
})
export class ApiCommandesFichiersService {
  constructor(private apollo: Apollo) {}

  getDetailsCommandesFichiers(paramData: OngletsParamDataModel) {
    return this.apollo.watchQuery<DetailsCommandesFichiersInterface>({
      query: gql`
        query getDetailsCommandesFichiers($paramData: OngletsParamDataInput!) {
          getDetailsCommandesFichiers(paramData: $paramData) {
            codcom
            numcom
            codfic
            libelle
            codprd
            refimp
            libfic
            ficsta
            ficinf
            dappcr
            dfichd
            dficht
            dfichs
            frefec
            ficvid
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
