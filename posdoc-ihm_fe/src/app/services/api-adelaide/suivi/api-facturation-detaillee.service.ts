import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {
  DistinctEnvOrgAppSiteClientTarifInterface,
  FacturationDetailleeDTOInterface,
  SearchFacturationDetailleePayloadModel,
} from '@app/models/suivi/facturation-detaillee-interface';

@Injectable({
  providedIn: 'root',
})
export class ApiFacturationDetailleeService {
  constructor(private apollo: Apollo) {}

  getDistinctEnvOrgAppSiteClientTarif() {
    return this.apollo.watchQuery<DistinctEnvOrgAppSiteClientTarifInterface>({
      query: gql`
        query getDistinctEnvOrgAppSiteClientTarif {
          findCodeEnv {
            code
          }
          findCodeApp {
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
          allClients {
            code
          }
          findTyptarFromGentar {
            typtar
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  searchFacturationDetaillee(query: SearchFacturationDetailleePayloadModel) {
    return this.apollo.watchQuery<FacturationDetailleeDTOInterface>({
      query: gql`
        query searchFacturationDetaillee($query: SearchFacturationDetailleeQuery) {
          searchFacturationDetaillee(query: $query) {
            facturationDetailleeWithAllColumns {
              codorg
              codapp
              codcom
              codfic
              libfic
              dfiexp
              codsit
              codreg
              codcli
              totalPages
              totalPlis
              coutTotal
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
}
