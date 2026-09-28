import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {
  AllOrganismesResultInterface,
  SearchPliByNumpliResultInterface,
  SearchPliByQuery,
  SearchPliByQueryResultInterface,
} from '../model/search-pli';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideSuiviAuPliService {
  constructor(private apollo: Apollo) {}

  public searchPliByNumpli(numpli: string) {
    return this.apollo.watchQuery<SearchPliByNumpliResultInterface>({
      query: gql`
        query searchPliByNumpli($numpli: String) {
          searchPliByNumpli(numpli: $numpli) {
            numpli
            codenv
            codorg
            codapp
            percod
            codcom
            codfic
            numcom
            plista
            pliinf
            zoncli
            dplidc
            dplidd
            dplidt
            dplide
            dplidh
            nbpage
            nbfeui
            edtype
            poipli
            coupli
            idtpli
            codpos
            codpay
            adres1
            adres2
            adres3
            adres4
            adres5
            adres6
            adres7
            expad1
            expad2
            expad3
            expad4
            genpro
            infcl1
            infcl2
            datdep
            mpsidd
            status
            cominf
            codgam
            prosta
            proinf
            prefec
            dprodc
            dprodd
            dprodt
            dprods
            dprodh
            pagfic
            plific
            rejfic
          }
        }
      `,
      variables: {
        numpli: numpli,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchPliByQuery(query: SearchPliByQuery) {
    return this.apollo.watchQuery<SearchPliByQueryResultInterface>({
      query: gql`
        query searchPliByQuery($query: SearchPliQueryInput) {
          searchPliByQuery(query: $query) {
            status
            genpro
            codgam
            numpli
            idtpli
            adres1
            adres2
            adres3
            adres4
            adres5
            adres6
            adres7
            datdep
            mpsidd
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getAllSelectConfig() {
    return this.apollo.watchQuery<AllOrganismesResultInterface>({
      query: gql`
        query GetRessources {
          allOrganismes {
            code
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
