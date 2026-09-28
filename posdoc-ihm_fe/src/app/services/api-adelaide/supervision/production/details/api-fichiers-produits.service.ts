import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';

import { DetailsFichiersProduitsIntreface } from '@app/models/supervision/production/details/fichiers-produits-intreface';

@Injectable({
  providedIn: 'root',
})
export class ApiFichiersProduitsService {
  constructor(private apollo: Apollo) {}

  getDetailsFichiersProduits(paramData: OngletsParamDataModel) {
    return this.apollo.watchQuery<DetailsFichiersProduitsIntreface>({
      query: gql`
        query getDetailsFichiersProduits($paramData: OngletsParamDataInput!) {
          getDetailsFichiersProduits(paramData: $paramData) {
            codcom
            codfic
            numcom
            refimp
            codprd
            libFichier
            pagFic
            codgam
            codsit
            codres
            coddes
            nbrexe
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
