import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {ParamFacturationApiModel} from '@app/models/supervision/production/details/param-facturation-api-model';
import {DetailsFacturationsInterface} from '@app/models/supervision/production/details/facturations-interface';
import {
  ConsolidationFacturationDTOInterface,
  SearchConsolidationFacturationQuery,
} from '@app/models/exploitation-editique/consolidation-facturation/consolidation-facturation-interface';
import {UpdateConsolidationFacturationQuery} from '@app/models/payload/update-consolidation-facturation';

@Injectable({
  providedIn: 'root',
})
export class ApiFacturationsService {
  constructor(private apollo: Apollo) {}

  public getDetailsFacturation(paramData: ParamFacturationApiModel) {
    return this.apollo.watchQuery<DetailsFacturationsInterface>({
      query: gql`
        query getDetailsFacturation($paramData: ParamDataFacturationInput!) {
          getDetailsFacturation(paramData: $paramData) {
            codcom
            codfic
            numcom
            codprd
            codcli
            typtar
            nbplis
            coutot
            dfiexp
            codenv
            codorg
            codapp
            percod
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getConsolidationFacturation(query: SearchConsolidationFacturationQuery) {
    return this.apollo.watchQuery<ConsolidationFacturationDTOInterface>({
      query: gql`
        query searchConsolidationFacturation($query: SearchConsolidationFacturationQuery!) {
          searchConsolidationFacturation(query: $query) {
            consolidationFacturationList {
              codenv
              codorg
              codapp
              percod
              codcom
              codfic
              numcom
              codprd
              codcli
              codsit
              plific
              coufic
              dfiexp
              tarifs {
                codeTar
                plis
                cout
              }
            }
            message
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getTarifsConsolidation() {
    return this.apollo.watchQuery({
      query: gql`
        query getAllTarpos {
          allTarposByPerimetreEqualToZero {
            type
            compta
            tlibre
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getFilterOptions() {
    return this.apollo.watchQuery({
      query: gql`
        query getFilterOptions {
          findCodeEnv {
            code
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
          findCodeOrganismesByTypeR {
            code
          }
          allSitesCNP {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getCodeAppByEnvOrgs(codenv: string, codorgs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query findCodeAppByEnvOrgs($codenv: String, $codorgs: [String]) {
          findCodeAppByEnvOrgs(codenv: $codenv, codorgs: $codorgs) {
            code
          }
        }
      `,
      variables: {
        codenv: codenv,
        codorgs: codorgs,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  updateConsolidationFacturation(query: UpdateConsolidationFacturationQuery) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateConsolidationFacturation($query: UpdateConsolidationFacturationQuery) {
          updateConsolidationFacturation(query: $query)
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    });
  }
}
