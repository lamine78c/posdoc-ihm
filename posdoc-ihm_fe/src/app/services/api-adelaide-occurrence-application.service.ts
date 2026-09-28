import { Injectable } from '@angular/core';
import { OccurrenceApplicationSuiviProductionQuery } from '@app/models/payload/search-occurrence-application-suivi-production';
import { OccurrenceApplicationSuiviProductionInterface } from '@app/models/suivi/occurrence-application-interface';
import { ParamSearchPeriodeApiModel } from '@app/models/supervision/production/details/param-search-periode-api-model';
import { DetailsPeriodeInterface } from '@app/models/supervision/production/details/periode-interface';
import { DistinctEnvOrgAppFromGenappInterface } from '@app/models/supervision/production/distinct-env-org-app-from-genapp-interface';
import { DistinctEnvOrgAppFromGenficInterface } from '@app/models/supervision/production/distinct-env-org-app-from-genfic-interface';
import { GestionOccurrenceApplicationInterface } from '@app/models/supervision/production/gestion-occurrence-application-interface';
import { ParamTermineGenappInterface } from '@app/models/supervision/production/param-termine-genapp-interface';
import { ParamUpdateTyprefGenappInterface } from '@app/models/supervision/production/param-update-typref-genapp-interface';
import { SearchGestionOccurrenceApplication } from '@app/models/supervision/production/search-gestion-occurrence-application';
import { SearchOccurencePerApplication } from '@app/models/supervision/production/search-occurence-per-application';
import {
  SearchFacturationsByFichierInput,
  SearchFacturationsByFichierPayloadDTO,
} from '@app/suivi/production/modal/fichier-details/models/search-facturations-by-fic-interface';
import {
  SearchOccAppByFicInput,
  SearchOccAppByFicPayloadDTO,
} from '@app/suivi/production/modal/fichier-details/models/search-occ-app-by-fic-interface';
import {
  SearchProduitsByFichierInput,
  SearchProduitsByFichierPayloadDTO,
} from '@app/suivi/production/modal/fichier-details/models/search-produits-by-fic-interface';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideOccurenceApplicationService {
  constructor(private apollo: Apollo) {}

  public getSearchElementFromApplis() {
    return this.apollo.watchQuery<DistinctEnvOrgAppFromGenficInterface>({
      query: gql`
        query getSearchElementFromApplis {
          allSitesCNP {
            code
          }
          allApplications {
            code
            codeEnvironnement
            codeOrganisation
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEnvOrgAppFromGenapp() {
    return this.apollo.watchQuery<DistinctEnvOrgAppFromGenappInterface>({
      query: gql`
        query getDistinctEnvOrgAppFromGenapp {
          getDistinctEnvOrgAppFromGenapp {
            codenv
            codorg
            codapp
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
          allSitesCNP {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  searchOccurencePerApplication(currDate: string, codSit: string, codEnv: string, codOrgs: string[], codApp: string, tri: string, ext: boolean) {
    return this.apollo.watchQuery<SearchOccurencePerApplication>({
      query: gql`
        query SearchOccurencePerApplication(
          $currDate: String
          $codSit: String
          $codEnv: String
          $codOrgs: [String]
          $codApp: String
          $tri: String
          $ext: Boolean
        ) {
          searchOccurencePerApplication(
            currDate: $currDate
            codSit: $codSit
            codEnv: $codEnv
            codOrgs: $codOrgs
            codApp: $codApp
            tri: $tri
            ext: $ext
          ) {
            codEnv
            codOrg
            codApp
            perCod
            appsta
            dapplc
            dappld
            dapplt
            codSit
          }
        }
      `,
      variables: {
        currDate: currDate,
        codSit: codSit,
        codEnv: codEnv,
        codOrgs: codOrgs,
        codApp: codApp,
        tri: tri,
        ext: ext,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllTarifs() {
    return this.apollo.watchQuery({
      query: gql`
        query getAllTarpos {
          allTarpos {
            type
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDetailsPeriodeFromGenApp(paramData: ParamSearchPeriodeApiModel) {
    return this.apollo.watchQuery<DetailsPeriodeInterface>({
      query: gql`
        query getDetailsPeriodeFromGenApp($paramData: DetailsPeriodeInput!) {
          getDetailsPeriodeFromGenApp(paramData: $paramData) {
            perCod
            appsta
            dappld
            dapplt
            manuel
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getOccurrenceApplication(paramData: SearchGestionOccurrenceApplication) {
    return this.apollo.watchQuery<GestionOccurrenceApplicationInterface>({
      query: gql`
        query getOccurrenceApplication($paramData: OccurrenceApplicationInput!) {
          getOccurrenceApplication(paramData: $paramData) {
            appsta
            appinf
            dapplc
            dappld
            dapplt
            dappls
            typref
            sitori
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public update(paramData: ParamUpdateTyprefGenappInterface) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($paramData: UpdateTypRefInGenAppInput!) {
          updateTypRefInGenApp(paramData: $paramData) {
            typref
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public termine(paramData: ParamTermineGenappInterface) {
    return this.apollo.mutate({
      mutation: gql`
        mutation termine($paramData: TerminaisonGenAppInput!) {
          termineOccApp(paramData: $paramData) {
            erreur
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getOccurrenceApplicationForSuiviProduction(query: OccurrenceApplicationSuiviProductionQuery) {
    return this.apollo.watchQuery<OccurrenceApplicationSuiviProductionInterface>({
      query: gql`
        query getOccurrenceApplicationForSuiviProduction($query: OccurrenceApplicationSuiviProductionInput) {
          getOccurrenceApplicationForSuiviProduction(query: $query) {
            occurrencesApplication {
              codenv
              codorg
              codapp
              percod
              appsta
              appinf
              arefec
              dappld
              dapplt
              dappls
              manuel
              codsit
              codcom
              codfic
              numcom
              codprd
              ficsta
              ficinf
              frefec
              ficvid
              dappcr
              dfichd
              dficht
              dfichs
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

  public searchOccAppByFic(fichierPayload: SearchOccAppByFicInput) {
    return this.apollo.watchQuery<SearchOccAppByFicPayloadDTO>({
      query: gql`
        query searchOccAppByFic($fichierPayload: SearchOccAppByFicInput) {
          searchOccAppByFic(fichierPayload: $fichierPayload) {
            libfic
            libfor
            libsup
            libmul
            reffor
            refimp
            refsup
            reftri
            refech
            ficatt
            ficsta
            maxpag
            codprd
            repexp
            typsig
            codcli
            codrnd
            ficinf
            dappcr
            dfichd
            dficht
            dfichs
            codsit
            eclate
          }
        }
      `,
      variables: {
        fichierPayload: fichierPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchProduitsByFichier(fichierPayload: SearchProduitsByFichierInput) {
    return this.apollo.watchQuery<SearchProduitsByFichierPayloadDTO>({
      query: gql`
        query searchProduitsByFichier($fichierPayload: SearchProduitsByFichierInput) {
          searchProduitsByFichier(fichierPayload: $fichierPayload) {
            codgam
            libgam
            prosta
            proinf
            dprodd
            dprodt
            dprods
            pagfic
            plific
            rejfic
          }
        }
      `,
      variables: {
        fichierPayload: fichierPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchFacturationsByFichier(fichierPayload: SearchFacturationsByFichierInput) {
    return this.apollo.watchQuery<SearchFacturationsByFichierPayloadDTO>({
      query: gql`
        query searchFacturationsByFichier($fichierPayload: SearchFacturationsByFichierInput) {
          searchFacturationsByFichier(fichierPayload: $fichierPayload) {
            facturations {
              typtar
              libtar
              nbplis
              coutot
            }
            fichiersMas {
              codenv
              codorg
              codapp
              percod
              codcom
              codfic
              numcom
              libtar
              nbplis
              coutot
            }
          }
        }
      `,
      variables: {
        fichierPayload: fichierPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
