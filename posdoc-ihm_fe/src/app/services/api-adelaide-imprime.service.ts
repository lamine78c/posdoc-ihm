import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Imprime } from '@app/models/Imprime';
import { FichiersQueryInterface } from '@app/produit/fichier/model/update-fichier.interface';
import { AllImprimeInterface } from '@app/produit/fond-page/imprime/model/imprime.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideImprimeService {
  constructor(private apollo: Apollo) {}

  public getAllImprimes() {
    return this.apollo.watchQuery<AllImprimeInterface>({
      query: gql`
        query GetImprimes {
          allImprimes {
            reference
            libelle
            codeRND
            typeComposition
            typeCouleur
            rectoVerso
            isNotAuthorisedToBeDeleted
          }
          allComposs {
            typmef
            libmef
          }
          allColimps {
            typcol
            libcol
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getImprimesByEnvsAndApps(codesEnv?: string[], codesApp?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetImprimesByEnvsAndApps($codesEnv: [String], $codesApp: [String]) {
          getImprimesByEnvsAndApps(codesEnv: $codesEnv, codesApp: $codesApp) {
            reference
            libelle
            codeRND
            typeComposition
            typeCouleur
            rectoVerso
          }
        }
      `,
      variables: {
        codesEnv: codesEnv,
        codesApp: codesApp,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public deleteImprimes(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteImprimes(deleteImprimes: { ids: $ids }) {
            ok
          }
        }
      `,
      variables: {
        ids: ids,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public createImprime(createImprime: Imprime) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createImprime: CreateOrUpdateImprimeInput!) {
          createImprime(createImprime: $createImprime) {
            reference
            libelle
            codeRND
            typeComposition
            typeCouleur
            rectoVerso
          }
        }
      `,
      variables: {
        createImprime: createImprime,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateImprime(updateImprime: Imprime) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateImprime: CreateOrUpdateImprimeInput!) {
          updateImprime(updateImprime: $updateImprime) {
            reference
            libelle
            codeRND
            typeComposition
            typeCouleur
            rectoVerso
          }
        }
      `,
      variables: {
        updateImprime: updateImprime,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateFichiersFromFondDePage(fichiers: any) {
    return this.apollo.mutate<FichiersQueryInterface>({
      mutation: gql`
        mutation update($fichiers: [CreateOrUpdateFichierInputDTO]!) {
          updateFichiersFromFondDePage(fichiers: $fichiers) {
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
}
