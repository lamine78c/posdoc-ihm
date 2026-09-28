import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchByEnvsOrgsAppProfilInput } from '@app/models/payload/search-by-envs-orgs-app-profil';
import { SearchFichierFilterQuery } from '@app/models/payload/search-fichier-filter';
import { SearchOrgByEnvAppComFicsInput } from '@app/models/payload/search-org-by-env-app-com-fics';
import { Apollo, gql } from 'apollo-angular';
import { NbFichierUpdatedInterface } from '@app/models/fichier';
import { GetConfigDataForAddInterface } from '@app/produit/fichier/model/get-config-data-for-add-interface';
import { DistFicFromEnvOrgAppComInterface } from '@app/models/gestion-fichier-edition/parametre-edition/get-fichier-from-env-org-app-com-interface';
import { FichiersQueryInterface } from '@app/produit/fichier/model/update-fichier.interface';
import { GetConfigDataForEditInterface } from '@app/produit/fichier/model/get-config-data-for-edit-interface';
import { SearchByEnvOrgsAppComQuery } from '@app/models/payload/search-by-env-orgs-app-com';
import { FindFicPrdImpByEnvOrgAppComInterface } from '@app/models/gestion-fichier-edition/notices/notfic';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideFichierService {
  constructor(private apollo: Apollo) {}

  public createFichierWithExemplaire(createFichiers: any[]) {
    return this.apollo.mutate<NbFichierUpdatedInterface>({
      mutation: gql`
        mutation create($createFichier: [CreateOrUpdateFichierInputDTO]!) {
          createFichierWithExemplaire(createFichier: $createFichier) {
            nbFichiers
            nbProduits
            nbExemplaires
          }
        }
      `,
      variables: {
        createFichier: createFichiers,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getAllFichiers() {
    return this.apollo.watchQuery({
      query: gql`
        query GetFichiers {
          allFichiers {
            codeEnv
            codeOrg
            codeApp
            codeCom
            codeFich
            libFichier
            refImprime
            codeAdr
            codeProd
            refFormat
            typeFormat
            page
            codeClient
            typeMultif
            typeSig
            typeSupport
            codeDocument
            eclatement
            refSupport
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getConfigData() {
    return this.apollo.watchQuery({
      query: gql`
        query GetConfigData {
          allFormats {
            value: code
            text: libelle
          }
          allClients {
            code
          }
          allImprimes {
            reference
            libelle
          }
          allSupports {
            value: type
            text: libelle
          }
          findAllOrganiClient {
            codorg
            codcli
          }
        }
      `,
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getConfigDataForAdd() {
    return this.apollo.watchQuery<GetConfigDataForAddInterface>({
      query: gql`
        query GetConfigData {
          allFormats {
            code
            libelle
          }
          allClients {
            code
          }
          allSupports {
            type
            libelle
          }
          findAllOrganiClient {
            codorg
            codcli
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public setNewImprimeToFichiers(fichiers: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation setNewImprimeToFichiers($fichiers: [CreateOrUpdateFichierInputDTO]!) {
          setNewImprimeToFichiers(fichiers: $fichiers) {
            codeEnv
            codeOrg
            codeApp
            codeCom
            codeFich
            libFichier
            refImprime
            codeAdr
            codeProd
            refFormat
            typeFormat
            page
            codeClient
          }
        }
      `,
      variables: {
        fichiers: fichiers,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public setNewImprimeToFichier(fichier: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation setNewImprimeToFichier($fichier: CreateOrUpdateFichierInputDTO!) {
          setNewImprimeToFichier(fichier: $fichier) {
            codeEnv
            codeOrg
            codeApp
            codeCom
            codeFich
            libFichier
            refImprime
            codeAdr
            codeProd
            refFormat
            typeFormat
            page
            codeClient
          }
        }
      `,
      variables: {
        fichier: fichier,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public findFichiersForUpdatingReference(codesEnv?: string[], codesApp?: string[], refsImp?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetFichiersForUpdatingReference($codesEnv: [String]!, $codesApp: [String]!, $refsImp: [String]!) {
          getFichiersForUpdatingReference(codesEnv: $codesEnv, codesApp: $codesApp, refsImp: $refsImp) {
            codeEnv
            codeApp
            codeCom
            codeFich
            codeProd
            refImprime
            libFichier
            codeOrg
            codeAdr
            refFormat
            typeFormat
            page
            codeClient
            typeMultif
            typeSupport
            typeSig
            refSupport
            eclatement
            codeDocument
          }
        }
      `,
      variables: {
        codesEnv: codesEnv,
        codesApp: codesApp,
        refsImp: refsImp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getAllSelectConfig() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allOrganismes {
            code
            codeRegion: codeRegion
          }
          allImprimes {
            reference
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getExistedFichiers(codeEnv?: string[], codeApp?: string, codeCom?: string, codeFic?: string) {
    return this.apollo.watchQuery({
      query: gql`
        query getExistedFichiers($codeEnv: [String], $codeApp: String, $codeCom: String, $codeFic: String) {
          getExistedFichiers(codeEnv: $codeEnv, codeApp: $codeApp, codeCom: $codeCom, codeFic: $codeFic) {
            codeEnv
            codeOrg
            codeApp
            codeCom
            codeFich
            codeProd
          }
        }
      `,
      variables: {
        codeEnv: codeEnv,
        codeApp: codeApp,
        codeCom: codeCom,
        codeFic: codeFic,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getFichiersSearchByEnvironnement() {
    return this.apollo.watchQuery({
      query: gql`
        query getFichiersSearchByEnvironnement {
          getFichiersSearchByEnvironnement {
            codeDoc
            codeEnv
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getFichiersForAdsNull(codeEnv?: string, codeOrg?: string, codeApp?: string, codeCom?: string, codeFic?: string, refImprime?: string) {
    return this.apollo.watchQuery<FichiersQueryInterface>({
      query: gql`
        query getFichiersForAdsNull($codeEnv: String, $codeOrg: String, $codeApp: String, $codeCom: String, $codeFic: String, $refImprime: String) {
          getFichiersForAdsNull(
            codeEnv: $codeEnv
            codeOrg: $codeOrg
            codeApp: $codeApp
            codeCom: $codeCom
            codeFic: $codeFic
            refImprime: $refImprime
          ) {
            codeEnv
            codeApp
            codeCom
            codeFich
            codeProd
            refImprime
            libFichier
            codeOrg
            codeAdr
            refFormat
            typeFormat
            page
            codeClient
            typeMultif
            typeSupport
            typeSig
            refSupport
            eclatement
            codeDocument
          }
        }
      `,
      variables: {
        codeEnv: codeEnv,
        codeOrg: codeOrg,
        codeApp: codeApp,
        codeCom: codeCom,
        codeFic: codeFic,
        refImprime: refImprime,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public updateFichiers(fichiers: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($fichiers: [CreateOrUpdateFichierInputDTO]!) {
          updateFichiers(fichiers: $fichiers) {
            codeEnv
            codeApp
            codeCom
            codeFich
            codeProd
            refImprime
            libFichier
            codeOrg
            codeAdr
            refFormat
            typeFormat
            page
            codeClient
            typeMultif
            typeSupport
            typeSig
            refSupport
            eclatement
            codeDocument
          }
        }
      `,
      variables: {
        fichiers: fichiers,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateMessage(fichier: any, message: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateMessage($fichier: CreateOrUpdateFichierInputDTO, $message: String) {
          updateMessage(fichier: $fichier, message: $message)
        }
      `,
      variables: {
        fichier: fichier,
        message: message,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getEnvAppRefImpEnGroup() {
    return this.apollo.watchQuery({
      query: gql`
        query GetFichiersSearchElements {
          getFichiersSearchElements {
            codeEnv
            codeApp
            refImprime
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
  public deleteFichiers(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($fichiers: [CreateOrUpdateFichierInputDTO]!) {
          deleteFichiers(deleteFichiers: $fichiers) {
            ok
          }
        }
      `,
      variables: {
        fichiers: ids,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getRessourcesGam(query: SearchByEnvsOrgsAppProfilInput) {
    return this.apollo.watchQuery({
      query: gql`
        query getRessourcesGam($query: SearchByEnvsOrgsAppProfilsQuery) {
          getRessourcesGam(query: $query) {
            codeEnvironnement
            codeOrganisme
            codeApplication
            codeGamme
            codeSite
            codeRessource
            codeServeur
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEnvironnements() {
    return this.apollo.watchQuery({
      query: gql`
        query getDistinctEnvsFromFichier {
          getDistinctEnvsFromFichier
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
        }
      `,
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctOrgsByEnvs(query: SearchFichierFilterQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistOrgByEnvFromFichier($query: SearchFichierFilterQuery) {
          getDistOrgByEnvFromFichier(query: $query)
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      variables: {
        query: query,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistAppsByEnvOrg(query: SearchFichierFilterQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistAppByEnvOrgFromFichier($query: SearchFichierFilterQuery) {
          getDistAppByEnvOrgFromFichier(query: $query)
        }
      `,
      variables: {
        query: query,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistComsByEnvOrgApp(query: SearchFichierFilterQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistComByEnvOrgAppFromFichier($query: SearchFichierFilterQuery) {
          getDistComByEnvOrgAppFromFichier(query: $query)
        }
      `,
      variables: {
        query: query,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistFicByEnvOrgAppCom(query: SearchFichierFilterQuery) {
    return this.apollo.watchQuery<DistFicFromEnvOrgAppComInterface>({
      query: gql`
        query getDistFicByEnvOrgAppCom($query: SearchFichierFilterQuery) {
          getDistFicByEnvOrgAppCom(query: $query)
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  preselectedData(query: SearchFichierFilterQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getPreselectedFichier($query: SearchFichierFilterQuery) {
          getPreselectedFichier(query: $query) {
            codeEnv
            codeOrg
            codeApp
            codeCom
            codeFich
            libFichier
            refImprime
            codeAdr
            codeProd
            refFormat
            typeFormat
            page
            codeClient
            typeMultif
            typeSig
            typeSupport
            codeDocument
            eclatement
            refSupport
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getFichiersToAddNewExemplaire(codeEnv: string, codeOrg: string, codeApp: string, perCod: string, codeGam: string) {
    return this.apollo.watchQuery({
      query: gql`
        query GetFichiersToAddNewExemplaire($codeEnv: String, $codeOrg: String, $codeApp: String, $perCod: String, $codeGam: String) {
          getFichiersToAddNewExemplaire(codeEnv: $codeEnv, codeOrg: $codeOrg, codeApp: $codeApp, perCod: $perCod, codeGam: $codeGam)
        }
      `,
      variables: {
        codeEnv: codeEnv,
        codeOrg: codeOrg,
        codeApp: codeApp,
        perCod: perCod,
        codeGam: codeGam,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getOrgByEnvAppComFics(query: SearchOrgByEnvAppComFicsInput) {
    return this.apollo.watchQuery({
      query: gql`
        query getOrgByEnvAppComFics($query: SearchOrgByEnvAppComFicsQuery) {
          getOrgByEnvAppComFics(query: $query)
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctOrgsNoMasByEnvs(query: SearchFichierFilterQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistOrgNoMasByEnvFromFichier($query: SearchFichierFilterQuery) {
          getDistOrgNoMasByEnvFromFichier(query: $query)
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      variables: {
        query: query,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getSearchFichierFilterQuery(codenvs: string[], codorgs?: string[], codapp?: string, codcom?: string) {
    return {
      codenvs: codenvs,
      codorgs: codorgs ?? [],
      codapp: codapp ?? '',
      codcom: codcom ?? '',
    };
  }

  findFicPrdImpByEnvOrgAppCom(query: SearchByEnvOrgsAppComQuery) {
    return this.apollo.watchQuery<FindFicPrdImpByEnvOrgAppComInterface>({
      query: gql`
        query findFicPrdImpByEnvOrgAppCom($query: SearchByEnvOrgsAppComQuery) {
          findFicPrdImpByEnvOrgAppCom(query: $query) {
            codfic
            refimp
            codprd
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
