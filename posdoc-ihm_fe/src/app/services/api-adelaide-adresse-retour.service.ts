import { Injectable } from '@angular/core';
import { AdresseRetourDTO } from '@app/models/adresseRetour';
import { FichiersQueryInterface } from '@app/produit/fichier/model/update-fichier.interface';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideAdresseRetourService {
  constructor(private apollo: Apollo) {}

  public getAllAdressesRetour() {
    return this.apollo.watchQuery({
      query: gql`
        query GetAllAdressesRetour {
          allAdressesRetour {
            code
            codeOrganisme
            adresse1
            adresse2
            adresse3
            adresse4
            fichiers {
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
            isNotAuthorisedToBeDeleted
          }
          allOrganismes {
            code
            codeRegion
          }
          allApplications {
            code
            codeOrganisation
            codeEnvironnement
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getFichiersByApp(codenv?: string, codesOrg?: string[], codesApp?: string[], codesCom?: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetFichiersByApp($codenv: String, $codesOrg: [String], $codesApp: [String], $codesCom: [String]) {
          getFichiersByApp(codenv: $codenv, codesOrg: $codesOrg, codesApp: $codesApp, codesCom: $codesCom) {
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
        codenv: codenv,
        codesOrg: codesOrg,
        codesApp: codesApp,
        codesCom: codesCom,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
  public createAdressesRetour(adressesRetour: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($adressesRetour: [CreateOrUpdateAdresseRetourInput]!) {
          createAdressesRetour(createAdressesRetour: { adressesRetour: $adressesRetour }) {
            code
            codeOrganisme
            adresse1
            adresse2
            adresse3
            adresse4
          }
        }
      `,
      variables: {
        adressesRetour: adressesRetour,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateAdresseRetour(updateAdresseRetour: AdresseRetourDTO) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateAdresseRetour: CreateOrUpdateAdresseRetourInput!) {
          updateAdresseRetour(updateAdresseRetour: $updateAdresseRetour) {
            code
            codeOrganisme
            adresse1
            adresse2
            adresse3
            adresse4
          }
        }
      `,
      variables: {
        updateAdresseRetour: updateAdresseRetour,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteAdressesRetour(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeleteAdresseRetourInput]!) {
          deleteAdressesRetour(deleteAdressesRetour: { ids: $ids }) {
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

  public updateFichiersFromAdressesRetour(fichiers: any) {
    return this.apollo.mutate<FichiersQueryInterface>({
      mutation: gql`
        mutation update($fichiers: [CreateOrUpdateFichierInputDTO]!) {
          updateFichiersFromAdressesRetour(fichiers: $fichiers) {
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
